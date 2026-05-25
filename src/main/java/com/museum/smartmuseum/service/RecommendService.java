package com.museum.smartmuseum.service;

import com.museum.smartmuseum.entity.Exhibit;
import com.museum.smartmuseum.entity.Favorite;
import com.museum.smartmuseum.entity.VisitRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Item-based 协同过滤推荐。
 *
 * 思路：
 *   1. 用 visit_record（权重 1）+ favorite（权重 2）作为隐式反馈，构建用户-展品交互矩阵；
 *   2. 计算展品两两余弦相似度： sim(A,B) = |Ua ∩ Ub| / sqrt(|Ua| * |Ub|)；
 *   3. 对目标用户未交互过的每个候选展品，计算分数 = Σ sim(seen, candidate) * weight(seen)；
 *   4. 排序取 topN；冷启动用户（无交互记录）回退到热门展品。
 *
 * 适合博物馆场景（用户多、展品少），相似度矩阵很小，可纯内存实时计算。
 */
@Service
public class RecommendService {

    private static final double WEIGHT_VISIT = 1.0;
    private static final double WEIGHT_FAVORITE = 2.0;

    @Autowired private VisitRecordService visitRecordService;
    @Autowired private FavoriteService favoriteService;
    @Autowired private ExhibitService exhibitService;

    public List<Exhibit> recommendForUser(Integer userId, int topN) {
        List<VisitRecord> visits = visitRecordService.list();
        List<Favorite> favs = favoriteService.list();

        // user -> {exhibit -> weight}
        Map<Integer, Map<Integer, Double>> userItem = new HashMap<>();
        for (VisitRecord v : visits) {
            userItem.computeIfAbsent(v.getUserId(), k -> new HashMap<>())
                    .merge(v.getExhibitId(), WEIGHT_VISIT, Double::sum);
        }
        for (Favorite f : favs) {
            userItem.computeIfAbsent(f.getUserId(), k -> new HashMap<>())
                    .merge(f.getExhibitId(), WEIGHT_FAVORITE, Double::sum);
        }

        Map<Integer, Double> targetItems = userItem.getOrDefault(userId, Collections.emptyMap());
        if (targetItems.isEmpty()) {
            // 冷启动：返回热门展品
            return exhibitService.getHotExhibits(topN);
        }

        // exhibit -> set<user>
        Map<Integer, Set<Integer>> itemUsers = new HashMap<>();
        userItem.forEach((u, items) ->
                items.keySet().forEach(item ->
                        itemUsers.computeIfAbsent(item, k -> new HashSet<>()).add(u)
                )
        );

        // 计算候选分数
        Map<Integer, Double> scores = new HashMap<>();
        for (Integer candidate : itemUsers.keySet()) {
            if (targetItems.containsKey(candidate)) continue; // 跳过已看过
            double score = 0.0;
            for (Map.Entry<Integer, Double> seen : targetItems.entrySet()) {
                double sim = cosineSim(itemUsers.get(seen.getKey()), itemUsers.get(candidate));
                score += sim * seen.getValue();
            }
            if (score > 0) scores.put(candidate, score);
        }

        List<Integer> topIds = scores.entrySet().stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                .limit(topN)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        if (topIds.isEmpty()) return exhibitService.getHotExhibits(topN);

        // 按相似度顺序返回展品详情
        Map<Integer, Exhibit> byId = exhibitService.listByIds(topIds).stream()
                .collect(Collectors.toMap(Exhibit::getId, e -> e));
        List<Exhibit> result = new ArrayList<>();
        for (Integer id : topIds) {
            Exhibit e = byId.get(id);
            if (e != null) result.add(e);
        }
        return result;
    }

    private double cosineSim(Set<Integer> a, Set<Integer> b) {
        if (a == null || b == null || a.isEmpty() || b.isEmpty()) return 0;
        long inter = a.stream().filter(b::contains).count();
        if (inter == 0) return 0;
        return inter / Math.sqrt((double) a.size() * b.size());
    }
}
