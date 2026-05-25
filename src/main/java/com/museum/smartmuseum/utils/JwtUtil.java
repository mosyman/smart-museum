package com.museum.smartmuseum.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具。
 *
 * 密钥来源（按优先级）：
 *   1. 配置 jwt.secret（application.properties / 环境变量 JWT_SECRET）
 *   2. 默认值（仅开发环境使用，长度需 >= 32 字节满足 HS256 要求）
 *
 * 之前 SECRET_KEY 用 Keys.secretKeyFor() 每次启动随机生成，
 * 导致后端重启后已发的所有 token 全部失效 —— 这是 bug，已修。
 */
@Component
public class JwtUtil {

    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000L; // 24h
    private static SecretKey SECRET_KEY;

    @Value("${jwt.secret:smart-museum-default-secret-please-change-in-prod-environment}")
    private String configuredSecret;

    @PostConstruct
    public void init() {
        SECRET_KEY = Keys.hmacShaKeyFor(configuredSecret.getBytes(StandardCharsets.UTF_8));
    }

    public static String generateToken(Integer userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public static boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static Integer getUserIdFromToken(String token) {
        return (Integer) parseToken(token).get("userId");
    }

    public static String getUsernameFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public static String getRoleFromToken(String token) {
        return (String) parseToken(token).get("role");
    }
}
