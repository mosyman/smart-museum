package com.museum.smartmuseum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.smartmuseum.entity.Favorite;
import com.museum.smartmuseum.mapper.FavoriteMapper;
import com.museum.smartmuseum.service.FavoriteService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteServiceImpl extends ServiceImpl<FavoriteMapper, Favorite> implements FavoriteService {

    @Override
    public boolean addFavorite(Integer userId, Integer exhibitId) {
        if (isFavorited(userId, exhibitId)) {
            return false;  // 已经收藏过了
        }
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setExhibitId(exhibitId);
        return save(favorite);
    }

    @Override
    public boolean removeFavorite(Integer userId, Integer exhibitId) {
        QueryWrapper<Favorite> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("exhibit_id", exhibitId);
        return remove(wrapper);
    }

    @Override
    public List<Integer> getUserFavoriteIds(Integer userId) {
        QueryWrapper<Favorite> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).select("exhibit_id");
        List<Favorite> favorites = list(wrapper);
        return favorites.stream()
                .map(Favorite::getExhibitId)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isFavorited(Integer userId, Integer exhibitId) {
        QueryWrapper<Favorite> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("exhibit_id", exhibitId);
        return count(wrapper) > 0;
    }
}