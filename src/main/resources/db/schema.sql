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
  INDEX idx_exhibit (`exhibit_id`),
  CONSTRAINT fk_visit_user    FOREIGN KEY (`user_id`)    REFERENCES `user` (`id`)    ON DELETE CASCADE,
  CONSTRAINT fk_visit_exhibit FOREIGN KEY (`exhibit_id`) REFERENCES `exhibit` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏
CREATE TABLE IF NOT EXISTS `favorite` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT NOT NULL,
  `exhibit_id`  INT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_exhibit (`user_id`, `exhibit_id`),
  CONSTRAINT fk_fav_user    FOREIGN KEY (`user_id`)    REFERENCES `user` (`id`)    ON DELETE CASCADE,
  CONSTRAINT fk_fav_exhibit FOREIGN KEY (`exhibit_id`) REFERENCES `exhibit` (`id`) ON DELETE CASCADE
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

-- 种子展品（图片来自 static/images/，由 Spring Boot 静态资源映射服务）
INSERT INTO `exhibit` (`name`, `category`, `description`, `image_url`, `location_floor`, `location_area`, `position_x`, `position_y`, `view_count`) VALUES
  ('清明上河图',   '书画',   '北宋张择端代表作，描绘汴京繁华市井，长卷构图细节丰富。', '/images/qingminghe.jpg',  1, 'A区', 100, 100, 120),
  ('青铜鼎',       '青铜器', '商周时期祭祀礼器，铸造工艺精湛，纹饰庄严。',           '/images/qingtongding.jpg', 1, 'A区', 200, 150, 88),
  ('金缕玉衣',     '服饰',   '汉代王侯下葬玉殓服，金丝串缀玉片，工艺繁复。',         '/images/jinlv.jpg',       1, 'B区', 300, 200, 95),
  ('马踏飞燕',     '雕塑',   '东汉青铜奔马，三足腾空，被誉为中国旅游标志。',         '/images/mata.jpg',        2, 'A区', 120, 120, 142),
  ('汝窑天青釉碗', '陶瓷',   '北宋汝窑代表，胎质细腻，釉色温润如玉。',               '/images/ruyao.jpg',       2, 'B区', 220, 180, 67),
  ('青花瓷瓶',     '陶瓷',   '元代景德镇青花瓷，纹饰精美、发色浓艳。',               '/images/qinghua_vase.webp', 2, 'B区', 260, 220, 53),
  ('敦煌飞天壁画', '壁画',   '唐代敦煌壁画临摹，飞天衣袂飘举、姿态轻盈。',           '/images/feitian.jpg',     3, 'A区', 150, 100, 76),
  ('甲骨文残片',   '文献',   '商代甲骨文，记录占卜活动，汉字之源。',                 '/images/jiagu.jpeg',      3, 'B区', 200, 180, 41),
  ('越王勾践剑',   '青铜器', '春秋越国宝剑，历经两千年仍寒光逼人、刃锋如新。',       '/images/yuewang.webp',    1, 'B区', 320, 240, 110),
  ('马王堆帛画',   '书画',   '西汉马王堆出土 T 形帛画，描绘升天主题。',             '/images/mawang.jpg',      3, 'A区', 180, 220, 58)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 种子路线
INSERT INTO `route` (`name`, `floor`, `waypoints`, `recommend_time`, `description`) VALUES
  ('精华速览',      1, '[1,2,3]',     30,  '只想看代表性藏品？覆盖 1 楼三件镇馆之宝。'),
  ('青铜器主题',    1, '[2,9]',       45,  '从商周到春秋，串联两件青铜重器。'),
  ('书画与陶瓷',    2, '[5,6,4]',     60,  '逛 2 楼陶瓷展厅，看汝窑与青花的对比。'),
  ('全馆深度游',    1, '[1,2,3,4,5,6,7,8,9,10]', 120, '覆盖三层全部精品，建议预留 2 小时。')
ON DUPLICATE KEY UPDATE name = VALUES(name);
