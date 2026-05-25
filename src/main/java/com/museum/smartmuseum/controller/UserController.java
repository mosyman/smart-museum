package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.config.PassToken;
import com.museum.smartmuseum.config.RequiresRole;
import com.museum.smartmuseum.entity.User;
import com.museum.smartmuseum.service.UserService;
import com.museum.smartmuseum.utils.JwtUtil;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @PassToken
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody User loginUser) {
        User user = userService.login(loginUser.getUsername(), loginUser.getPassword());
        if (user != null) {
            String token = JwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
            Map<String, Object> data = new HashMap<>();
            data.put("id", user.getId());
            data.put("username", user.getUsername());
            data.put("role", user.getRole());
            data.put("nickname", user.getNickname());
            data.put("token", token);
            return Result.success("登录成功", data);
        }
        return Result.error(401, "用户名或密码错误");
    }

    /** 公开注册：role 强制为 tourist */
    @PassToken
    @PostMapping("/register")
    public Result<Boolean> register(@RequestBody User user) {
        boolean success = userService.register(user);
        if (success) {
            return Result.success("注册成功", true);
        }
        return Result.error("用户名已存在");
    }

    /** 管理员创建用户（可指定 role） */
    @RequiresRole("admin")
    @PostMapping("/admin/create")
    public Result<Boolean> adminCreate(@RequestBody User user) {
        boolean success = userService.adminCreate(user);
        if (success) {
            return Result.success("创建成功", true);
        }
        return Result.error("用户名已存在");
    }

    @RequiresRole("admin")
    @GetMapping("/list")
    public Result<List<User>> list() {
        List<User> users = userService.list();
        users.forEach(u -> u.setPassword(null));
        return Result.success(users);
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Integer id) {
        User user = userService.getById(id);
        if (user != null) user.setPassword(null);
        return Result.success(user);
    }

    @GetMapping("/current")
    public Result<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Integer userId = JwtUtil.getUserIdFromToken(token);
        User user = userService.getUserById(userId);
        if (user != null) {
            user.setPassword(null);
            return Result.success(user);
        }
        return Result.error("用户不存在");
    }

    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody User user) {
        // 不允许通过 update 接口改密码（避免明文绕过哈希）
        user.setPassword(null);
        return Result.success(userService.updateById(user));
    }

    @RequiresRole("admin")
    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Integer id) {
        return Result.success(userService.removeById(id));
    }
}
