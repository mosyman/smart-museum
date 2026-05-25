package com.museum.smartmuseum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.museum.smartmuseum.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}