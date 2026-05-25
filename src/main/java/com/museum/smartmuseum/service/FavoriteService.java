package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.Favorite;
import java.util.List;

public interface FavoriteService extends IService<Favorite> {
    // 添加收藏
    boolean addFavorite(Integer userId, Integer exhibitId);

    // 取消收藏
    boolean removeFavorite(Integer userId, Integer exhibitId);

    // 获取用户收藏的展品ID列表
    List<Integer> getUserFavoriteIds(Integer userId);

    // 判断是否已收藏
    boolean isFavorited(Integer userId, Integer exhibitId);
}