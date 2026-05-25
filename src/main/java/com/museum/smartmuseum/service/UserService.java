package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.User;

public interface UserService extends IService<User> {
    // 登录验证
    User login(String username, String password);

    // 注册
    boolean register(User user);

    // 根据用户名查询用户
    User getUserByUsername(String username);
    // 新增：根据用户ID获取用户
    User getUserById(Integer id);
}