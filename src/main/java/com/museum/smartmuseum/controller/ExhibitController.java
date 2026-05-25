package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.config.PassToken;
import com.museum.smartmuseum.config.RequiresRole;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.utils.QrCodeUtil;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exhibit")
@CrossOrigin
public class ExhibitController {

    @Autowired
    private ExhibitService exhibitService;

    @GetMapping("/list")
    @PassToken
    public Result<List<Exhibit>> list() {
        return Result.success(exhibitService.list());
    }

    @GetMapping("/category/{category}")
    @PassToken
    public Result<List<Exhibit>> getByCategory(@PathVariable String category) {
        return Result.success(exhibitService.getByCategory(category));
    }

    @GetMapping("/{id}")
    @PassToken
    public Result<Exhibit> getById(@PathVariable Integer id) {
        Exhibit exhibit = exhibitService.getById(id);
        if (exhibit != null) {
            exhibitService.incrementViewCount(id);
        }
        return Result.success(exhibit);
    }

    @GetMapping("/hot")
    @PassToken
    public Result<List<Exhibit>> getHotExhibits() {
        return Result.success(exhibitService.getHotExhibits(10));
    }

    @RequiresRole("admin")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Exhibit exhibit) {
        return Result.success(exhibitService.save(exhibit));
    }

    @RequiresRole("admin")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Exhibit exhibit) {
        return Result.success(exhibitService.updateById(exhibit));
    }

    @RequiresRole("admin")
    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Integer id) {
        return Result.success(exhibitService.removeById(id));
    }

    /**
     * 生成展品二维码（PNG）。
     * 内容为展品 ID（小程序 scanQRCode 直接 parseInt 跳到详情页）。
     * 公开访问，便于 admin-web 用 <img> 直接展示。
     */
    @PassToken
    @GetMapping(value = "/{id}/qr-code", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrCode(@PathVariable Integer id,
                                          @RequestParam(defaultValue = "300") int size) throws Exception {
        Exhibit exhibit = exhibitService.getById(id);
        if (exhibit == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] png = QrCodeUtil.generatePng(String.valueOf(id), size);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png);
    }
}
