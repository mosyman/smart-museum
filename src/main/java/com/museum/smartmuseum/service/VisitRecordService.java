package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.VisitRecord;
import java.util.List;

public interface VisitRecordService extends IService<VisitRecord> {
    void recordVisit(Integer userId, Integer exhibitId, Integer duration);

    List<VisitRecord> getUserVisitRecords(Integer userId);

    List<Integer> getVisitedExhibitIds(Integer userId);

    /** 删除某用户所有访问记录，返回删除条数 */
    int clearByUser(Integer userId);

    /** 删除某用户对某展品的所有访问记录，返回删除条数 */
    int removeByUserAndExhibit(Integer userId, Integer exhibitId);
}
