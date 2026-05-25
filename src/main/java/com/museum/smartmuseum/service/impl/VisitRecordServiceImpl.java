package com.museum.smartmuseum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.smartmuseum.entity.VisitRecord;
import com.museum.smartmuseum.mapper.VisitRecordMapper;
import com.museum.smartmuseum.service.VisitRecordService;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VisitRecordServiceImpl extends ServiceImpl<VisitRecordMapper, VisitRecord> implements VisitRecordService {

    @Override
    public void recordVisit(Integer userId, Integer exhibitId, Integer duration) {
        VisitRecord record = new VisitRecord();
        record.setUserId(userId);
        record.setExhibitId(exhibitId);
        record.setVisitTime(new Date());
        record.setDuration(duration != null ? duration : 0);
        save(record);
    }

    @Override
    public List<VisitRecord> getUserVisitRecords(Integer userId) {
        QueryWrapper<VisitRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("visit_time");
        return list(wrapper);
    }

    @Override
    public List<Integer> getVisitedExhibitIds(Integer userId) {
        QueryWrapper<VisitRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).select("exhibit_id");
        return list(wrapper).stream()
                .map(VisitRecord::getExhibitId)
                .collect(Collectors.toList());
    }

    @Override
    public int clearByUser(Integer userId) {
        QueryWrapper<VisitRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        return baseMapper.delete(wrapper);
    }

    @Override
    public int removeByUserAndExhibit(Integer userId, Integer exhibitId) {
        QueryWrapper<VisitRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("exhibit_id", exhibitId);
        return baseMapper.delete(wrapper);
    }
}
