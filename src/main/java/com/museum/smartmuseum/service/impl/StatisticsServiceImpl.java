package com.museum.smartmuseum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.entity.Statistics;
import com.museum.smartmuseum.entity.VisitRecord;
import com.museum.smartmuseum.mapper.StatisticsMapper;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.service.StatisticsService;
import com.museum.smartmuseum.service.VisitRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class StatisticsServiceImpl extends ServiceImpl<StatisticsMapper, Statistics> implements StatisticsService {

    @Autowired
    private VisitRecordService visitRecordService;

    @Autowired
    private ExhibitService exhibitService;

    @Override
    public void collectTodayStatistics() {
        // 简化版，后续可根据需要完善
        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        System.out.println("统计日期：" + today);
    }

    @Override
    public Map<String, Object> getHotExhibitAnalysis() {
        Map<String, Object> result = new HashMap<>();
        // 获取前10热门展品
        List<Exhibit> hotExhibits = exhibitService.getHotExhibits(10);
        result.put("hotExhibits", hotExhibits);
        result.put("total", hotExhibits.size());
        return result;
    }

    @Override
    public Map<String, Object> getVisitorFlow() {
        Map<String, Object> result = new HashMap<>();
        // 获取今日访问量（简化：统计今天的参观记录数）
        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        QueryWrapper<VisitRecord> wrapper = new QueryWrapper<>();
        wrapper.apply("DATE(visit_time) = {0}", today);
        long todayVisits = visitRecordService.count(wrapper);
        result.put("todayVisits", todayVisits);
        result.put("totalVisits", visitRecordService.count());
        return result;
    }
}