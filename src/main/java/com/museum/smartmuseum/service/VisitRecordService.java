package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.VisitRecord;
import java.util.List;

public interface VisitRecordService extends IService<VisitRecord> {
    // 记录用户参观
    void recordVisit(Integer userId, Integer exhibitId, Integer duration);

    // 获取用户的参观足迹
    List<VisitRecord> getUserVisitRecords(Integer userId);

    // 获取用户已参观的展品ID列表（用于推荐算法）
    List<Integer> getVisitedExhibitIds(Integer userId);
}