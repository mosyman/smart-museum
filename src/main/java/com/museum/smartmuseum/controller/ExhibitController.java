package com.museum.smartmuseum.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.museum.smartmuseum.config.PassToken;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exhibit")
@CrossOrigin
public class ExhibitController {

    @Autowired
    private ExhibitService exhibitService;

    /**
     * 获取所有展品
     */
    @GetMapping("/list")
    @PassToken
    public Result<List<Exhibit>> list() {
        return Result.success(exhibitService.list());
    }

    /**
     * 根据分类获取展品
     */
    @GetMapping("/category/{category}")
    @PassToken
    public Result<List<Exhibit>> getByCategory(@PathVariable String category) {
        return Result.success(exhibitService.getByCategory(category));
    }

    /**
     * 获取展品详情
     */
    @GetMapping("/{id}")
    @PassToken
    public Result<Exhibit> getById(@PathVariable Integer id) {
        Exhibit exhibit = exhibitService.getById(id);
        if (exhibit != null) {
            exhibitService.incrementViewCount(id);  // 增加浏览次数
        }
        return Result.success(exhibit);
    }

    /**
     * 获取热门展品（前10）
     */
    @GetMapping("/hot")
    @PassToken
    public Result<List<Exhibit>> getHotExhibits() {
        return Result.success(exhibitService.getHotExhibits(10));
    }

    /**
     * 新增展品（管理员）
     */
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Exhibit exhibit) {
        return Result.success(exhibitService.save(exhibit));
    }

    /**
     * 更新展品（管理员）
     */
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Exhibit exhibit) {
        return Result.success(exhibitService.updateById(exhibit));
    }

    /**
     * 删除展品（管理员）
     */
    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Integer id) {
        return Result.success(exhibitService.removeById(id));
    }
}