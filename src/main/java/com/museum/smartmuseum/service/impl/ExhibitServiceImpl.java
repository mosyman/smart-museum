package com.museum.smartmuseum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.mapper.ExhibitMapper;
import com.museum.smartmuseum.service.ExhibitService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExhibitServiceImpl extends ServiceImpl<ExhibitMapper, Exhibit> implements ExhibitService {

    @Override
    public void incrementViewCount(Integer exhibitId) {
        baseMapper.incrementViewCount(exhibitId);
    }

    @Override
    public List<Exhibit> getHotExhibits(int limit) {
        QueryWrapper<Exhibit> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("view_count").last("limit " + limit);
        return list(wrapper);
    }

    @Override
    public List<Exhibit> getByCategory(String category) {
        QueryWrapper<Exhibit> wrapper = new QueryWrapper<>();
        wrapper.eq("category", category);
        return list(wrapper);
    }
}