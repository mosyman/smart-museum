package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.Exhibit;
import java.util.List;

public interface ExhibitService extends IService<Exhibit> {
    // 增加浏览次数
    void incrementViewCount(Integer exhibitId);

    // 获取热门展品（按浏览次数排序）
    List<Exhibit> getHotExhibits(int limit);

    // 根据分类获取展品
    List<Exhibit> getByCategory(String category);
}