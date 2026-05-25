package com.museum.smartmuseum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.util.Date;

@Data
@TableName("route")
public class Route {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String name;
    private Integer floor;
    private String waypoints;
    private Integer recommendTime;
    private String description;
    private Date createTime;
}