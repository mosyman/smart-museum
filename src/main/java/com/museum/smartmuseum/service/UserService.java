package com.museum.smartmuseum.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.museum.smartmuseum.entity.User;

public interface UserService extends IService<User> {
    User login(String username, String password);

    /** 公开注册：强制 role = tourist */
    boolean register(User user);

    /** 管理员创建用户：保留 role（可创建 admin / tourist） */
    boolean adminCreate(User user);

    User getUserByUsername(String username);
    User getUserById(Integer id);
}
