package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.Statistics;
import java.util.Map;

public interface StatisticsService extends IService<Statistics> {
    // 统计今日参观数据
    void collectTodayStatistics();

    // 获取热门展品分析
    Map<String, Object> getHotExhibitAnalysis();

    // 获取人流量统计
    Map<String, Object> getVisitorFlow();
}