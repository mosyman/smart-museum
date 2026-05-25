package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.Route;
import java.util.List;

public interface RouteService extends IService<Route> {
    // 根据楼层获取路线
    List<Route> getRoutesByFloor(Integer floor);

    // 推荐路线（根据用户时间）
    Route recommendRoute(Integer minutes);
}