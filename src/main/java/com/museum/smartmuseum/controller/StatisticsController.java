package com.museum.smartmuseum.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.entity.VisitRecord;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.service.VisitRecordService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin
public class StatisticsController {

    @Autowired
    private ExhibitService exhibitService;

    @Autowired
    private VisitRecordService visitRecordService;

    /**
     * 获取热门展品统计（前10）
     */
    @GetMapping("/hot-exhibit")
    public Result<List<Exhibit>> getHotExhibit() {
        QueryWrapper<Exhibit> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("view_count").last("limit 10");
        return Result.success(exhibitService.list(wrapper));
    }

    /**
     * 获取人流量统计
     */
    @GetMapping("/visitor-flow")
    public Result<Map<String, Object>> getVisitorFlow() {
        Map<String, Object> result = new HashMap<>();

        // 今日访问量
        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        QueryWrapper<VisitRecord> todayWrapper = new QueryWrapper<>();
        todayWrapper.apply("DATE(visit_time) = {0}", today);
        long todayVisits = visitRecordService.count(todayWrapper);

        // 总访问量
        long totalVisits = visitRecordService.count();

        // 总用户数（去重）
        QueryWrapper<VisitRecord> userWrapper = new QueryWrapper<>();
        userWrapper.select("DISTINCT user_id");
        int totalUsers = visitRecordService.list(userWrapper).size();

        result.put("todayVisits", todayVisits);
        result.put("totalVisits", totalVisits);
        result.put("totalUsers", totalUsers);
        result.put("totalExhibits", exhibitService.count());

        return Result.success(result);
    }

    /**
     * 获取分类统计
     */
    @GetMapping("/category-stats")
    public Result<Map<String, Integer>> getCategoryStats() {
        List<Exhibit> exhibits = exhibitService.list();
        Map<String, Integer> categoryMap = new HashMap<>();

        for (Exhibit exhibit : exhibits) {
            String category = exhibit.getCategory();
            if (category == null || category.isEmpty()) {
                category = "其他";
            }
            categoryMap.put(category, categoryMap.getOrDefault(category, 0) + 1);
        }

        return Result.success(categoryMap);
    }

    /**
     * 获取访问趋势（近7天）
     */
    @GetMapping("/visit-trend")
    public Result<Map<String, Object>> getVisitTrend() {
        Map<String, Object> result = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<Integer> counts = new ArrayList<>();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Calendar calendar = Calendar.getInstance();

        // 获取近7天的日期和访问量
        for (int i = 6; i >= 0; i--) {
            calendar.setTime(new Date());
            calendar.add(Calendar.DAY_OF_MONTH, -i);
            String date = sdf.format(calendar.getTime());
            dates.add(date);

            // 查询当天的访问量
            QueryWrapper<VisitRecord> wrapper = new QueryWrapper<>();
            wrapper.apply("DATE(visit_time) = {0}", date);
            long count = visitRecordService.count(wrapper);
            counts.add((int) count);
        }

        result.put("dates", dates);
        result.put("counts", counts);

        return Result.success(result);
    }
}