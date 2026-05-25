// 完整修正后的 Exhibit.java
package com.museum.smartmuseum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.util.Date;

@Data
@TableName("exhibit")
public class Exhibit {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String name;
    private String category;
    private String description;

    @TableField("image_url")
    private String imageUrl;

    @TableField("audio_url")
    private String audioUrl;

    @TableField("model_3d_url")   // ← 关键修改
    private String model3dUrl;

    @TableField("location_floor")
    private Integer locationFloor;

    @TableField("location_area")
    private String locationArea;

    @TableField("position_x")
    private Integer positionX;

    @TableField("position_y")
    private Integer positionY;

    @TableField("view_count")
    private Integer viewCount;

    @TableField("qr_code")
    private String qrCode;

    @TableField("create_time")
    private Date createTime;

    @TableField("update_time")
    private Date updateTime;
}