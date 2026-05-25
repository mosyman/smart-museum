package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.config.PassToken;
import com.museum.smartmuseum.config.RequiresRole;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.utils.QrCodeUtil;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${qr.base-url:https://museum.local/e}")
    private String qrBaseUrl;

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
     * 内容是 URL 形式 {qr.base-url}/{id}，例如 https://museum.local/e/5
     * - 外部扫码器至少看到 URL 提示，不是裸数字
     * - 小程序 scanQRCode 用正则提取末尾的数字 ID
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
        String content = qrBaseUrl.replaceAll("/+$", "") + "/" + id;
        byte[] png = QrCodeUtil.generatePng(content, size);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png);
    }
}
