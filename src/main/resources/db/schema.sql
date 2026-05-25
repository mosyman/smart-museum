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
  ('tourist', '$2y$10$jYI52L3zEkCAu04v06IcbuhSl7Z4cG/pAaYmandplvOCpjG1J8/H2', 'tourist', '游客测试账号'),
  ('chl',     '$2y$10$jYI52L3zEkCAu04v06IcbuhSl7Z4cG/pAaYmandplvOCpjG1J8/H2', 'tourist', 'chl')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- 种子展品（图片来自 static/images/，audio 来自 static/audio/，由 Spring Boot 静态资源映射服务）
-- position_x / position_y 与 floorplans.js 的 SVG viewBox(0-400, 0-300) 对齐，确保 markers 落在各区域内
INSERT INTO `exhibit` (`name`, `category`, `description`, `image_url`, `audio_url`, `location_floor`, `location_area`, `position_x`, `position_y`, `view_count`) VALUES
  -- 1F：A/B/C/D 四角厅
  ('清明上河图',   '书画',   '北宋张择端代表作，描绘汴京繁华市井，长卷构图细节丰富。', '/images/qingminghe.jpg',    '/audio/qingminghe.mp3',   1, 'A区',  100,  78, 120),
  ('青铜鼎',       '青铜器', '商周时期祭祀礼器，铸造工艺精湛，纹饰庄严。',             '/images/qingtongding.jpg',  '/audio/qingtongding.mp3', 1, 'B区',  300,  78,  88),
  ('金缕玉衣',     '服饰',   '汉代王侯下葬玉殓服，金丝串缀玉片，工艺繁复。',           '/images/jinlv.jpg',         '/audio/jinlv.mp3',        1, 'C区',  100, 222,  95),
  ('越王勾践剑',   '青铜器', '春秋越国宝剑，历经两千年仍寒光逼人、刃锋如新。',         '/images/yuewang.webp',      '/audio/yuewang.mp3',      1, 'D区',  300, 222, 110),
  -- 2F：中央大厅 + 东西展厅
  ('马踏飞燕',     '雕塑',   '东汉青铜奔马，三足腾空，被誉为中国旅游标志。',           '/images/mata.jpg',          '/audio/mata.mp3',         2, '中央大厅', 200,  78, 142),
  ('汝窑天青釉碗', '陶瓷',   '北宋汝窑代表，胎质细腻，釉色温润如玉。',                 '/images/ruyao.jpg',         '/audio/ruyao.mp3',        2, '东展厅',   150, 225,  67),
  ('青花瓷瓶',     '陶瓷',   '元代景德镇青花瓷，纹饰精美、发色浓艳。',                 '/images/qinghua_vase.webp', '/audio/qinghua.mp3',      2, '西展厅',  310, 225,  53),
  -- 3F：东西厢房 + 中央主厅
  ('甲骨文残片',   '文献',   '商代甲骨文，记录占卜活动，汉字之源。',                   '/images/jiagu.jpeg',        '/audio/jiagu.mp3',        3, '东厢房',  95,  60,  41),
  ('马王堆帛画',   '书画',   '西汉马王堆出土 T 形帛画，描绘升天主题。',                '/images/mawang.jpg',        '/audio/mawang.mp3',       3, '西厢房', 305,  60,  58),
  ('敦煌飞天壁画', '壁画',   '唐代敦煌壁画临摹，飞天衣袂飘举、姿态轻盈。',             '/images/feitian.jpg',       '/audio/feitian.mp3',      3, '中央主厅', 200, 190,  76)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  audio_url = VALUES(audio_url),
  location_floor = VALUES(location_floor),
  location_area = VALUES(location_area),
  position_x = VALUES(position_x),
  position_y = VALUES(position_y);

-- 种子路线（waypoints = exhibit_id 数组，新种子数据下 ID 顺序：1清明 2青铜 3金缕 4越王 5马踏 6汝窑 7青花 8甲骨 9马王 10飞天）
INSERT INTO `route` (`name`, `floor`, `waypoints`, `recommend_time`, `description`) VALUES
  ('精华速览',      1, '[1,2,4,3]',                30,  '只想看代表性藏品？覆盖 1 楼四件镇馆之宝。'),
  ('青铜器主题',    1, '[2,4]',                    20,  '从商周到春秋，串联两件青铜重器。'),
  ('陶瓷之美',      2, '[6,7]',                    30,  '2 楼东西两厅，对比汝窑与青花的釉色。'),
  ('书画文献',      3, '[8,9,10]',                 45,  '3 楼三件文人珍品，从甲骨到帛画。'),
  ('全馆深度游',    1, '[1,2,4,3,5,6,7,8,9,10]', 120, '覆盖三层全部精品，建议预留 2 小时。')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  floor = VALUES(floor),
  waypoints = VALUES(waypoints),
  recommend_time = VALUES(recommend_time),
  description = VALUES(description);
