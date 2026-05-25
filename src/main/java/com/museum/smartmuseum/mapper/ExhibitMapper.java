package com.museum.smartmuseum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.smartmuseum.entity.Exhibit;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ExhibitMapper extends BaseMapper<Exhibit> {

    @Update("UPDATE exhibit SET view_count = view_count + 1 WHERE id = #{id}")
    void incrementViewCount(Integer id);
}