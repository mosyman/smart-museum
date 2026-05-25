package com.museum.smartmuseum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.smartmuseum.entity.VisitRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface VisitRecordMapper extends BaseMapper<VisitRecord> {

    /** 去重统计用户数（COUNT DISTINCT 比 select.distinct + list.size 高效） */
    @Select("SELECT COUNT(DISTINCT user_id) FROM visit_record")
    long countDistinctUsers();

    /** 按日期分组统计访问量（近 N 天） */
    @Select("SELECT DATE(visit_time) AS d, COUNT(*) AS c FROM visit_record " +
            "WHERE visit_time >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) " +
            "GROUP BY DATE(visit_time)")
    List<Map<String, Object>> visitTrend(@Param("days") int days);

    /** 按展品分类统计参观次数（用于热门分类等） */
    @Select("SELECT e.category AS category, COUNT(*) AS cnt FROM visit_record v " +
            "JOIN exhibit e ON v.exhibit_id = e.id GROUP BY e.category")
    List<Map<String, Object>> countByCategory();
}
