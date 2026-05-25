package com.museum.smartmuseum.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // 生成 admin123 的加密密码
        String adminPwd = encoder.encode("admin123");
        System.out.println("admin123 加密后：");
        System.out.println(adminPwd);

        // 生成 123456 的加密密码
        String touristPwd = encoder.encode("123456");
        System.out.println("\n123456 加密后：");
        System.out.println(touristPwd);
    }
}