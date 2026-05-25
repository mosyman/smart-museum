package com.museum.smartmuseum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.smartmuseum.entity.Route;
import com.museum.smartmuseum.mapper.RouteMapper;
import com.museum.smartmuseum.service.RouteService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RouteServiceImpl extends ServiceImpl<RouteMapper, Route> implements RouteService {

    @Override
    public List<Route> getRoutesByFloor(Integer floor) {
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.eq("floor", floor);
        return list(wrapper);
    }

    @Override
    public Route recommendRoute(Integer minutes) {
        // 简单推荐：找到推荐时间最接近用户要求的路线
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("ABS(recommend_time - " + minutes + ")").last("limit 1");
        return getOne(wrapper);
    }
}