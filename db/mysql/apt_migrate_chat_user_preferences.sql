-- Creates ChatUserPreferences table for existing databases.
--
-- Usage:
--   mysql -h 127.0.0.1 -P 3306 -u root apt < db/mysql/apt_migrate_chat_user_preferences.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `ChatUserPreferences` (
  `ID_NguoiDung` BIGINT NOT NULL,
  `Theme` VARCHAR(128) NOT NULL DEFAULT 'aurora',
  `Wallpaper` VARCHAR(16) NOT NULL DEFAULT 'none',
  `Fullscreen` TINYINT(1) NOT NULL DEFAULT 1,
  `UpdatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_NguoiDung`),
  CONSTRAINT `FK_ChatUserPreferences_NguoiDungs`
    FOREIGN KEY (`ID_NguoiDung`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;

