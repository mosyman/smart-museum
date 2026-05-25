package com.museum.smartmuseum.config;

import java.lang.annotation.*;

/**
 * 标记接口需要特定角色才能访问。
 * 由 JwtInterceptor 在 token 校验通过后再校验 role。
 * 示例： @RequiresRole("admin")
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {
    String[] value();
}
