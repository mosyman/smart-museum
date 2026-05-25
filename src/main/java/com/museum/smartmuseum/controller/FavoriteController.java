package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.config.PassToken;
import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.service.FavoriteService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorite")
@CrossOrigin
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private ExhibitService exhibitService;

    /**
     * 添加收藏
     */
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Map<String, Integer> params) {
        Integer userId = params.get("userId");
        Integer exhibitId = params.get("exhibitId");
        boolean success = favoriteService.addFavorite(userId, exhibitId);
        if (success) {
            return Result.success("收藏成功", true);
        }
        return Result.error("已经收藏过了");
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/remove")
    public Result<Boolean> remove(@RequestParam Integer userId, @RequestParam Integer exhibitId) {
        boolean success = favoriteService.removeFavorite(userId, exhibitId);
        return Result.success(success);
    }

    /**
     * 获取用户收藏的展品列表
     */
    @GetMapping("/list/{userId}")
    @PassToken
    public Result<List<Map<String, Object>>> getUserFavorites(@PathVariable Integer userId) {
        List<Integer> favoriteIds = favoriteService.getUserFavoriteIds(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Integer exhibitId : favoriteIds) {
            Exhibit exhibit = exhibitService.getById(exhibitId);
            if (exhibit != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("exhibitId", exhibit.getId());
                item.put("exhibitName", exhibit.getName());
                item.put("imageUrl", exhibit.getImageUrl());
                item.put("category", exhibit.getCategory());
                result.add(item);
            }
        }
        return Result.success(result);
    }

    /**
     * 判断是否已收藏
     */
    @GetMapping("/check")
    public Result<Boolean> isFavorited(@RequestParam Integer userId, @RequestParam Integer exhibitId) {
        return Result.success(favoriteService.isFavorited(userId, exhibitId));
    }
}