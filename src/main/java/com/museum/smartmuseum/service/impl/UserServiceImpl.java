package com.museum.smartmuseum.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.museum.smartmuseum.entity.User;
import com.museum.smartmuseum.mapper.UserMapper;
import com.museum.smartmuseum.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User login(String username, String password) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        User user = baseMapper.selectOne(wrapper);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            user.setPassword(null);
            return user;
        }
        return null;
    }

    @Override
    public boolean register(User user) {
        if (existsByUsername(user.getUsername())) return false;
        user.setRole("tourist");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return save(user);
    }

    @Override
    public boolean adminCreate(User user) {
        if (existsByUsername(user.getUsername())) return false;
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("tourist");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return save(user);
    }

    private boolean existsByUsername(String username) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        return baseMapper.selectCount(wrapper) > 0;
    }

    @Override
    public User getUserByUsername(String username) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        return baseMapper.selectOne(wrapper);
    }

    @Override
    public User getUserById(Integer id) {
        return baseMapper.selectById(id);
    }
}
