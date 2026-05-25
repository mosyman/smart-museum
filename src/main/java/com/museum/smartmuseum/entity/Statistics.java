package com.museum.smartmuseum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.util.Date;

@Data
@TableName("statistics")
public class Statistics {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Date statDate;
    private Integer totalVisitors;
    private Integer totalViews;
    private Integer hotExhibitId;
    private Date createTime;
}