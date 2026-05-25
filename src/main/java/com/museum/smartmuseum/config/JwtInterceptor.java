package com.museum.smartmuseum.config;

import com.museum.smartmuseum.utils.JwtUtil;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;

public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 非映射方法直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        PassToken passToken = handlerMethod.getMethodAnnotation(PassToken.class);
        PassToken classPassToken = handlerMethod.getBeanType().getAnnotation(PassToken.class);
        if (passToken != null || classPassToken != null) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return reject(response, 401, "未登录，请先登录");
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (!JwtUtil.validateToken(token)) {
            return reject(response, 401, "Token 无效或已过期");
        }

        // 解析 token 信息并暴露给 controller
        Integer userId = JwtUtil.getUserIdFromToken(token);
        String role = JwtUtil.getRoleFromToken(token);
        request.setAttribute("userId", userId);
        request.setAttribute("role", role);

        // 角色校验
        RequiresRole requiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
        if (requiresRole == null) {
            requiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
        }
        if (requiresRole != null) {
            String[] allowed = requiresRole.value();
            if (role == null || Arrays.stream(allowed).noneMatch(r -> r.equals(role))) {
                return reject(response, 403, "无权限访问");
            }
        }
        return true;
    }

    private boolean reject(HttpServletResponse response, int code, String msg) throws Exception {
        response.setStatus(code);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":" + code + ",\"message\":\"" + msg + "\"}");
        return false;
    }
}
