package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.config.PassToken;
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

    /**
     * 用户登录（不需要认证）
     */
    @PassToken
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody User loginUser) {
        User user = userService.login(loginUser.getUsername(), loginUser.getPassword());
        if (user != null) {
            // 生成 Token
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

    /**
     * 用户注册（不需要认证）
     */
    @PassToken
    @PostMapping("/register")
    public Result<Boolean> register(@RequestBody User user) {
        user.setRole("tourist");
        boolean success = userService.register(user);
        if (success) {
            return Result.success("注册成功", true);
        }
        return Result.error("用户名已存在");
    }

    /**
     * 获取所有用户（管理员，需要认证）
     */
    @GetMapping("/list")
    public Result<List<User>> list() {
        return Result.success(userService.list());
    }

    /**
     * 根据ID获取用户
     */
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Integer id) {
        return Result.success(userService.getById(id));
    }

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/current")
    public Result<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Integer userId = JwtUtil.getUserIdFromToken(token);
        User user = userService.getUserById(userId);
        if (user != null) {
            user.setPassword(null);  // 清除密码
            return Result.success(user);
        }
        return Result.error("用户不存在");
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody User user) {
        return Result.success(userService.updateById(user));
    }

    /**
     * 删除用户（管理员）
     */
    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Integer id) {
        return Result.success(userService.removeById(id));
    }
}