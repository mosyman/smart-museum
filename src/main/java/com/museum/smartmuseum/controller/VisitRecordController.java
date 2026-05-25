package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.entity.VisitRecord;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.service.VisitRecordService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visit")
@CrossOrigin
public class VisitRecordController {

    @Autowired
    private VisitRecordService visitRecordService;

    @Autowired
    private ExhibitService exhibitService;

    /**
     * 记录参观（扫码时调用）
     */
    @PostMapping("/record")
    public Result<Boolean> record(@RequestBody Map<String, Integer> params) {
        Integer userId = params.get("userId");
        Integer exhibitId = params.get("exhibitId");
        Integer duration = params.get("duration");
        visitRecordService.recordVisit(userId, exhibitId, duration);
        return Result.success(true);
    }

    /**
     * 获取用户的参观足迹（带展品详情）
     */
    @GetMapping("/footprint/{userId}")
    public Result<List<Map<String, Object>>> getFootprint(@PathVariable Integer userId) {
        List<VisitRecord> records = visitRecordService.getUserVisitRecords(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (VisitRecord record : records) {
            Exhibit exhibit = exhibitService.getById(record.getExhibitId());
            if (exhibit != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("recordId", record.getId());
                item.put("exhibitId", exhibit.getId());
                item.put("exhibitName", exhibit.getName());
                item.put("imageUrl", exhibit.getImageUrl());
                item.put("visitTime", record.getVisitTime());
                item.put("duration", record.getDuration());
                result.add(item);
            }
        }
        return Result.success(result);
    }

    /**
     * 生成参观报告
     */
    @GetMapping("/report/{userId}")
    public Result<Map<String, Object>> getReport(@PathVariable Integer userId) {
        List<Integer> visitedIds = visitRecordService.getVisitedExhibitIds(userId);

        Map<String, Object> report = new HashMap<>();
        report.put("totalVisited", visitedIds.size());
        report.put("visitedExhibitIds", visitedIds);

        // 根据参观记录推荐相似展品（简单版）
        if (!visitedIds.isEmpty()) {
            // 获取第一个参观展品的分类，推荐同分类其他展品
            Exhibit first = exhibitService.getById(visitedIds.get(0));
            if (first != null && first.getCategory() != null) {
                List<Exhibit> recommend = exhibitService.getByCategory(first.getCategory());
                report.put("recommendByCategory", recommend);
            }
        }
        return Result.success(report);
    }
}