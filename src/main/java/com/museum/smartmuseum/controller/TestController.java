package com.museum.smartmuseum.controller;

import com.museum.smartmuseum.service.ExhibitService;
import com.museum.smartmuseum.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public Result<String> hello() {
        return Result.success("项目运行成功！");
    }

    @Autowired
    private ExhibitService exhibitService;

    @GetMapping("/test-service")
    public Result<Integer> testService() {
        int count = exhibitService.list().size();
        return Result.success("展品总数：" + count, count);
    }
}

