package com.museum.smartmuseum.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.museum.smartmuseum.config.PassToken;
import com.museum.smartmuseum.entity.Route;
import com.museum.smartmuseum.service.RouteService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route")
@CrossOrigin
public class RouteController {

    @Autowired
    private RouteService routeService;

    /**
     * 获取所有路线
     */
    @GetMapping("/list")
    @PassToken
    public Result<List<Route>> list() {
        return Result.success(routeService.list());
    }

    /**
     * 获取路线详情
     */
    @GetMapping("/{id}")
    @PassToken
    public Result<Route> getById(@PathVariable Integer id) {
        Route route = routeService.getById(id);
        if (route == null) {
            return Result.error("路线不存在");
        }
        return Result.success(route);
    }

    /**
     * 根据楼层获取路线
     */
    @GetMapping("/floor/{floor}")
    @PassToken
    public Result<List<Route>> getByFloor(@PathVariable Integer floor) {
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.eq("floor", floor);
        return Result.success(routeService.list(wrapper));
    }

    /**
     * 推荐路线（根据用户时间）
     */
    @GetMapping("/recommend")
    @PassToken
    public Result<Route> recommendRoute(@RequestParam Integer minutes) {
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("ABS(recommend_time - " + minutes + ")").last("limit 1");
        Route route = routeService.getOne(wrapper);
        if (route == null) {
            return Result.error("未找到合适的路线");
        }
        return Result.success(route);
    }

    /**
     * 新增路线
     */
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Route route) {
        return Result.success(routeService.save(route));
    }

    /**
     * 更新路线
     */
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Route route) {
        return Result.success(routeService.updateById(route));
    }

    /**
     * 删除路线
     */
    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Integer id) {
        return Result.success(routeService.removeById(id));
    }
}