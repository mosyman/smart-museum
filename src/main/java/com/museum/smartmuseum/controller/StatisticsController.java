package com.museum.smartmuseum.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.museum.smartmuseum.config.RequiresRole;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.entity.VisitRecord;
import com.museum.smartmuseum.mapper.VisitRecordMapper;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.service.VisitRecordService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin
@RequiresRole("admin")
public class StatisticsController {

    @Autowired
    private ExhibitService exhibitService;

    @Autowired
    private VisitRecordService visitRecordService;

    @Autowired
    private VisitRecordMapper visitRecordMapper;

    @GetMapping("/hot-exhibit")
    public Result<List<Exhibit>> getHotExhibit() {
        QueryWrapper<Exhibit> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("view_count").last("limit 10");
        return Result.success(exhibitService.list(wrapper));
    }

    @GetMapping("/visitor-flow")
    public Result<Map<String, Object>> getVisitorFlow() {
        Map<String, Object> result = new HashMap<>();
        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());

        QueryWrapper<VisitRecord> todayWrapper = new QueryWrapper<>();
        todayWrapper.apply("DATE(visit_time) = {0}", today);
        long todayVisits = visitRecordService.count(todayWrapper);

        long totalVisits = visitRecordService.count();
        long totalUsers = visitRecordMapper.countDistinctUsers();

        result.put("todayVisits", todayVisits);
        result.put("totalVisits", totalVisits);
        result.put("totalUsers", totalUsers);
        result.put("totalExhibits", exhibitService.count());
        return Result.success(result);
    }

    @GetMapping("/category-stats")
    public Result<Map<String, Integer>> getCategoryStats() {
        List<Exhibit> exhibits = exhibitService.list();
        Map<String, Integer> categoryMap = new HashMap<>();
        for (Exhibit exhibit : exhibits) {
            String category = exhibit.getCategory();
            if (category == null || category.isEmpty()) category = "其他";
            categoryMap.put(category, categoryMap.getOrDefault(category, 0) + 1);
        }
        return Result.success(categoryMap);
    }

    @GetMapping("/visit-trend")
    public Result<Map<String, Object>> getVisitTrend() {
        // SQL 一次聚合，避免 7 次循环查询
        List<Map<String, Object>> rows = visitRecordMapper.visitTrend(7);
        Map<String, Long> bucket = new HashMap<>();
        for (Map<String, Object> row : rows) {
            String d = String.valueOf(row.get("d"));
            Number c = (Number) row.get("c");
            bucket.put(d, c.longValue());
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Calendar calendar = Calendar.getInstance();
        List<String> dates = new ArrayList<>();
        List<Long> counts = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            calendar.setTime(new Date());
            calendar.add(Calendar.DAY_OF_MONTH, -i);
            String date = sdf.format(calendar.getTime());
            dates.add(date);
            counts.add(bucket.getOrDefault(date, 0L));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("dates", dates);
        result.put("counts", counts);
        return Result.success(result);
    }
}
