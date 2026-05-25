-- 智慧博物馆导览系统 - 数据库初始化脚本
-- 由 entity 类反推得到，字段名遵循 MyBatis-Plus 的 @TableField 映射

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS smart_museum DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_museum;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `username`    VARCHAR(64)  NOT NULL UNIQUE,
  `password`    VARCHAR(128) NOT NULL,
  `role`        VARCHAR(32)  NOT NULL DEFAULT 'tourist',
  `nickname`    VARCHAR(64),
  `avatar`      VARCHAR(255),
  `phone`       VARCHAR(32),
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 展品表
CREATE TABLE IF NOT EXISTS `exhibit` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `name`           VARCHAR(128) NOT NULL,
  `category`       VARCHAR(64),
  `description`    TEXT,
  `image_url`      VARCHAR(255),
  `audio_url`      VARCHAR(255),
  `model_3d_url`   VARCHAR(255),
  `location_floor` INT,
  `location_area`  VARCHAR(64),
  `position_x`     INT,
  `position_y`     INT,
  `view_count`     INT DEFAULT 0,
  `qr_code`        VARCHAR(255),
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (`category`),
  INDEX idx_floor    (`location_floor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 路线表
CREATE TABLE IF NOT EXISTS `route` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `name`           VARCHAR(128) NOT NULL,
  `floor`          INT,
  `waypoints`      TEXT,
  `recommend_time` INT,
  `description`    TEXT,
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 参观记录
CREATE TABLE IF NOT EXISTS `visit_record` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT NOT NULL,
  `exhibit_id` INT NOT NULL,
  `visit_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `duration`   INT,
  INDEX idx_user (`user_id`),
  INDEX idx_exhibit (`exhibit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏
CREATE TABLE IF NOT EXISTS `favorite` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT NOT NULL,
  `exhibit_id`  INT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_exhibit (`user_id`, `exhibit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 统计
CREATE TABLE IF NOT EXISTS `statistics` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `stat_date`       DATE NOT NULL,
  `total_visitors`  INT DEFAULT 0,
  `total_views`     INT DEFAULT 0,
  `hot_exhibit_id`  INT,
  `create_time`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_date (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 种子数据：管理员 admin / admin123，游客 tourist / 123456
-- BCrypt hash 由 htpasswd 生成（$2y$ 与 Spring 的 $2a$ 兼容）
INSERT INTO `user` (`username`, `password`, `role`, `nickname`) VALUES
  ('admin',   '$2y$10$k91D.GYV10EQrO6gsrFQFuTkrSdhCcZazXq9wu6izKL0a0sXG5tPW', 'admin',   '管理员'),
  ('tourist', '$2y$10$jYI52L3zEkCAu04v06IcbuhSl7Z4cG/pAaYmandplvOCpjG1J8/H2', 'tourist', '游客测试账号')
ON DUPLICATE KEY UPDATE username = VALUES(username);
