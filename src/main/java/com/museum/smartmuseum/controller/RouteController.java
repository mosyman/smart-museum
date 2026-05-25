package com.museum.smartmuseum.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.museum.smartmuseum.config.PassToken;
import com.museum.smartmuseum.config.RequiresRole;
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

    @GetMapping("/list")
    @PassToken
    public Result<List<Route>> list() {
        return Result.success(routeService.list());
    }

    @GetMapping("/{id}")
    @PassToken
    public Result<Route> getById(@PathVariable Integer id) {
        Route route = routeService.getById(id);
        if (route == null) {
            return Result.error("路线不存在");
        }
        return Result.success(route);
    }

    @GetMapping("/floor/{floor}")
    @PassToken
    public Result<List<Route>> getByFloor(@PathVariable Integer floor) {
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.eq("floor", floor);
        return Result.success(routeService.list(wrapper));
    }

    /**
     * 根据可用时间推荐路线（取 recommend_time 与传入值差距最小的路线）。
     * 兼容旧参数名 minutes 与新参数名 availableTime。
     */
    @GetMapping("/recommend")
    @PassToken
    public Result<Route> recommendRoute(
            @RequestParam(value = "availableTime", required = false) Integer availableTime,
            @RequestParam(value = "minutes", required = false) Integer minutes) {
        Integer target = availableTime != null ? availableTime : minutes;
        if (target == null) {
            return Result.error("请传入 availableTime 参数");
        }
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("ABS(recommend_time - " + target + ")").last("limit 1");
        Route route = routeService.getOne(wrapper);
        if (route == null) {
            return Result.error("未找到合适的路线");
        }
        return Result.success(route);
    }

    @RequiresRole("admin")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Route route) {
        return Result.success(routeService.save(route));
    }

    @RequiresRole("admin")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Route route) {
        return Result.success(routeService.updateById(route));
    }

    @RequiresRole("admin")
    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Integer id) {
        return Result.success(routeService.removeById(id));
    }
}
