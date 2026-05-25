package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.service.RecommendService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend")
@CrossOrigin
public class RecommendController {

    @Autowired
    private RecommendService recommendService;

    /** 基于 item-based 协同过滤的个性化推荐 */
    @GetMapping("/{userId}")
    public Result<List<Exhibit>> recommend(@PathVariable Integer userId,
                                           @RequestParam(defaultValue = "10") int limit) {
        return Result.success(recommendService.recommendForUser(userId, limit));
    }
}
