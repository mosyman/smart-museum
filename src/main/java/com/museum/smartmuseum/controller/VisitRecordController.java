package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.entity.VisitRecord;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.service.VisitRecordService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/visit")
@CrossOrigin
public class VisitRecordController {

    @Autowired
    private VisitRecordService visitRecordService;

    @Autowired
    private ExhibitService exhibitService;

    /** 记录参观 */
    @PostMapping("/record")
    public Result<Boolean> record(@RequestBody Map<String, Integer> params) {
        Integer userId = params.get("userId");
        Integer exhibitId = params.get("exhibitId");
        Integer duration = params.get("duration");
        visitRecordService.recordVisit(userId, exhibitId, duration);
        return Result.success(true);
    }

    /**
     * 获取用户参观足迹（按展品聚合：去重 + 累计参观次数和时长）。
     * 返回字段：exhibitId / exhibitName / imageUrl / category / lastVisitTime / totalDuration / visitCount
     */
    @GetMapping("/footprint/{userId}")
    public Result<List<Map<String, Object>>> getFootprint(@PathVariable Integer userId) {
        List<VisitRecord> records = visitRecordService.getUserVisitRecords(userId);

        // 按 exhibitId 聚合
        Map<Integer, Map<String, Object>> grouped = new LinkedHashMap<>();
        for (VisitRecord r : records) {
            Integer exhibitId = r.getExhibitId();
            Map<String, Object> agg = grouped.get(exhibitId);
            if (agg == null) {
                Exhibit e = exhibitService.getById(exhibitId);
                if (e == null) continue; // FK 应保证不会出现，但保险一下
                agg = new HashMap<>();
                agg.put("exhibitId", e.getId());
                agg.put("exhibitName", e.getName());
                agg.put("imageUrl", e.getImageUrl());
                agg.put("category", e.getCategory());
                agg.put("lastVisitTime", r.getVisitTime());
                agg.put("totalDuration", 0);
                agg.put("visitCount", 0);
                grouped.put(exhibitId, agg);
            }
            agg.put("totalDuration", (int) agg.get("totalDuration") + (r.getDuration() == null ? 0 : r.getDuration()));
            agg.put("visitCount", (int) agg.get("visitCount") + 1);
            // records 已按 visit_time DESC 排序，第一次出现就是最近一次
        }
        return Result.success(new ArrayList<>(grouped.values()));
    }

    /** 清空当前登录用户的全部参观记录（userId 从 JWT 取，不允许传参） */
    @DeleteMapping("/mine")
    public Result<Integer> clearMine(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        if (userId == null) return Result.error(401, "未登录");
        int deleted = visitRecordService.clearByUser(userId);
        return Result.success("已清空", deleted);
    }

    /** 删除当前登录用户对某个展品的全部参观记录 */
    @DeleteMapping("/mine/exhibit/{exhibitId}")
    public Result<Integer> removeMineByExhibit(@PathVariable Integer exhibitId, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        if (userId == null) return Result.error(401, "未登录");
        int deleted = visitRecordService.removeByUserAndExhibit(userId, exhibitId);
        return Result.success("已删除", deleted);
    }

    /** 参观报告（保留，便于其它端复用） */
    @GetMapping("/report/{userId}")
    public Result<Map<String, Object>> getReport(@PathVariable Integer userId) {
        List<Integer> visitedIds = visitRecordService.getVisitedExhibitIds(userId);
        Set<Integer> distinctIds = new HashSet<>(visitedIds);

        Map<String, Object> report = new HashMap<>();
        report.put("totalVisited", distinctIds.size());
        report.put("visitedExhibitIds", new ArrayList<>(distinctIds));

        if (!distinctIds.isEmpty()) {
            Exhibit first = exhibitService.getById(distinctIds.iterator().next());
            if (first != null && first.getCategory() != null) {
                report.put("recommendByCategory", exhibitService.getByCategory(first.getCategory()));
            }
        }
        return Result.success(report);
    }
}
