-- APT-CONNECT schema & seed data for MySQL (Laragon)
-- Default connection (per application.properties):
--   host: 127.0.0.1
--   port: 3306
--   db:   apt
--   user: root
--
-- Usage (example):
--   mysql -h 127.0.0.1 -P 3306 -u root apt < db/mysql/apt_schema.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- Core: buildings & apartments ------------------------------------------------

CREATE TABLE IF NOT EXISTS `ChungCus` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `Ten` LONGTEXT NOT NULL,
  `DiaChi` LONGTEXT NOT NULL,
  `ChuDauTu` LONGTEXT NULL,
  `NamXayDung` INT NULL,
  `SoTang` INT NULL,
  `MoTa` LONGTEXT NULL,
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_ChungCus_Ten` (`Ten`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CanHos` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `MaCan` VARCHAR(64) NOT NULL,
  `ID_ChungCu` BIGINT NOT NULL,
  `DienTich` DECIMAL(10,2) NULL,
  `SoPhong` INT NULL,
  `Gia` DECIMAL(18,2) NULL,
  `TrangThai` VARCHAR(32) NOT NULL,
  `MoTa` LONGTEXT NULL,
  `Model3DUrl` LONGTEXT NULL,
  `SketchfabUrl` LONGTEXT NULL,
  `URLs` LONGTEXT NULL,
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `IX_CanHos_MaCan_ID_ChungCu` (`MaCan`, `ID_ChungCu`),
  KEY `IX_CanHos_ID_ChungCu` (`ID_ChungCu`),
  CONSTRAINT `FK_CanHos_ChungCus`
    FOREIGN KEY (`ID_ChungCu`) REFERENCES `ChungCus` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `HinhAnhChungCus` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_ChungCu` BIGINT NOT NULL,
  `DuongDan` LONGTEXT NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_HinhAnhChungCus_ChungCu_DuongDan` (`ID_ChungCu`, `DuongDan`(255)),
  KEY `IX_HinhAnhChungCus_ID_ChungCu` (`ID_ChungCu`),
  CONSTRAINT `FK_HinhAnhChungCus_ChungCus`
    FOREIGN KEY (`ID_ChungCu`) REFERENCES `ChungCus` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `HinhAnhCanHos` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_CanHo` BIGINT NOT NULL,
  `DuongDan` LONGTEXT NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_HinhAnhCanHos_CanHo_DuongDan` (`ID_CanHo`, `DuongDan`(255)),
  KEY `IX_HinhAnhCanHos_ID_CanHo` (`ID_CanHo`),
  CONSTRAINT `FK_HinhAnhCanHos_CanHos`
    FOREIGN KEY (`ID_CanHo`) REFERENCES `CanHos` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users & residents -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS `NguoiDungs` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `HoTen` LONGTEXT NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `MatKhau` LONGTEXT NOT NULL,
  `SoDienThoai` VARCHAR(32) NULL,
  `LoaiNguoiDung` VARCHAR(32) NOT NULL DEFAULT 'Khach',
  `HinhAnh` LONGTEXT NULL,
  `LastActiveAt` TIMESTAMP NULL,
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_NguoiDungs_Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `FaceEmbeddings` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_NguoiDung` BIGINT NOT NULL,
  `Embedding` JSON NOT NULL,
  `VectorModel` VARCHAR(32) NOT NULL DEFAULT 'facenet',
  `HinhAnh` LONGTEXT NULL,
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_Face_User` (`ID_NguoiDung`),
  CONSTRAINT `FK_FaceEmbeddings_NguoiDungs`
    FOREIGN KEY (`ID_NguoiDung`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `PasswordResetRequests` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_NguoiDung` BIGINT NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `CodeHash` LONGTEXT NOT NULL,
  `ExpiresAt` TIMESTAMP NOT NULL,
  `FailedAttempts` INT NOT NULL DEFAULT 0,
  `LockedUntil` TIMESTAMP NULL,
  `VerifiedAt` TIMESTAMP NULL,
  `ResetTokenHash` LONGTEXT NULL,
  `ResetTokenExpiresAt` TIMESTAMP NULL,
  `ConsumedAt` TIMESTAMP NULL,
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_PasswordResetRequests_Email` (`Email`),
  KEY `IX_PasswordResetRequests_ID_NguoiDung` (`ID_NguoiDung`),
  CONSTRAINT `FK_PasswordResetRequests_NguoiDungs`
    FOREIGN KEY (`ID_NguoiDung`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CuDans` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_NguoiDung` BIGINT NOT NULL,
  `ID_CanHo` BIGINT NOT NULL,
  `ID_ChungCu` BIGINT NOT NULL,
  `LaChuHo` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_CuDans_User_Apartment` (`ID_NguoiDung`, `ID_CanHo`),
  KEY `IX_CuDans_ID_NguoiDung` (`ID_NguoiDung`),
  KEY `IX_CuDans_ID_CanHo` (`ID_CanHo`),
  KEY `IX_CuDans_ID_ChungCu` (`ID_ChungCu`),
  CONSTRAINT `FK_CuDans_NguoiDungs`
    FOREIGN KEY (`ID_NguoiDung`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_CuDans_CanHos`
    FOREIGN KEY (`ID_CanHo`) REFERENCES `CanHos` (`ID`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_CuDans_ChungCus`
    FOREIGN KEY (`ID_ChungCu`) REFERENCES `ChungCus` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Services & invoices ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS `DichVus` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `TenDichVu` LONGTEXT NOT NULL,
  `MoTa` LONGTEXT NULL,
  `Gia` DECIMAL(18,2) NOT NULL,
  `HinhAnh` LONGTEXT NULL,
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `HinhAnhDichVus` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_DichVu` BIGINT NOT NULL,
  `DuongDan` LONGTEXT NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `IX_HinhAnhDichVus_ID_DichVu` (`ID_DichVu`),
  CONSTRAINT `FK_HinhAnhDichVus_DichVus`
    FOREIGN KEY (`ID_DichVu`) REFERENCES `DichVus` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `HoaDonDichVus` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_CanHo` BIGINT NOT NULL,
  `ID_ChungCu` BIGINT NOT NULL,
  `SoTien` DECIMAL(18,2) NOT NULL,
  `NgayLap` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` VARCHAR(32) NOT NULL DEFAULT 'Chua thanh toan',
  `NgayThucHien` TIMESTAMP NULL,
  `HinhThucThanhToan` VARCHAR(64) NULL,
  PRIMARY KEY (`ID`),
  KEY `IX_HoaDonDichVus_ID_CanHo` (`ID_CanHo`),
  KEY `IX_HoaDonDichVus_ID_ChungCu` (`ID_ChungCu`),
  CONSTRAINT `FK_HoaDonDichVus_CanHos`
    FOREIGN KEY (`ID_CanHo`) REFERENCES `CanHos` (`ID`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_HoaDonDichVus_ChungCus`
    FOREIGN KEY (`ID_ChungCu`) REFERENCES `ChungCus` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `HoaDonDichVu_DichVus` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_HoaDon` BIGINT NOT NULL,
  `ID_DichVu` BIGINT NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_HoaDon_DichVu` (`ID_HoaDon`, `ID_DichVu`),
  KEY `IX_HoaDonDichVu_DichVus_ID_DichVu` (`ID_DichVu`),
  CONSTRAINT `FK_HoaDonDichVu_DichVus_HoaDonDichVus`
    FOREIGN KEY (`ID_HoaDon`) REFERENCES `HoaDonDichVus` (`ID`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_HoaDonDichVu_DichVus_DichVus`
    FOREIGN KEY (`ID_DichVu`) REFERENCES `DichVus` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `PhieuThus` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_HoaDon` BIGINT NOT NULL,
  `ID_Admin` BIGINT NOT NULL,
  `NgayXuat` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_PhieuThu_HoaDon` (`ID_HoaDon`),
  KEY `IX_PhieuThus_ID_Admin` (`ID_Admin`),
  CONSTRAINT `FK_PhieuThus_HoaDonDichVus`
    FOREIGN KEY (`ID_HoaDon`) REFERENCES `HoaDonDichVus` (`ID`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_PhieuThus_NguoiDungs`
    FOREIGN KEY (`ID_Admin`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- News & complaints -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS `TinTucs` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `TieuDe` LONGTEXT NOT NULL,
  `NoiDung` LONGTEXT NOT NULL,
  `NgayDang` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `HinhAnh` LONGTEXT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `PhanAnhs` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_NguoiDung` BIGINT NOT NULL,
  `NoiDung` LONGTEXT NOT NULL,
  `TrangThai` VARCHAR(32) NOT NULL DEFAULT 'Chua xu ly',
  `NgayGui` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PhanHoi` LONGTEXT NULL,
  `HinhAnh` LONGTEXT NULL,
  PRIMARY KEY (`ID`),
  KEY `IX_PhanAnhs_ID_NguoiDung` (`ID_NguoiDung`),
  CONSTRAINT `FK_PhanAnhs_NguoiDungs`
    FOREIGN KEY (`ID_NguoiDung`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chat & messaging ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Chats` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `Loai` VARCHAR(16) NOT NULL,
  `ID_ChungCu` BIGINT NULL,
  `PrivateKey` VARCHAR(255) NULL,
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_Chats_PrivateKey` (`PrivateKey`),
  KEY `IX_Chats_ID_ChungCu` (`ID_ChungCu`),
  CONSTRAINT `FK_Chats_ChungCus`
    FOREIGN KEY (`ID_ChungCu`) REFERENCES `ChungCus` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ChatMembers` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Chat` BIGINT NOT NULL,
  `ID_NguoiDung` BIGINT NOT NULL,
  `VaiTro` VARCHAR(16) NOT NULL DEFAULT 'member',
  `JoinedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UQ_Chat_User` (`ID_Chat`, `ID_NguoiDung`),
  KEY `IX_ChatMembers_ID_NguoiDung` (`ID_NguoiDung`),
  CONSTRAINT `FK_ChatMembers_Chats`
    FOREIGN KEY (`ID_Chat`) REFERENCES `Chats` (`ID`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_ChatMembers_NguoiDungs`
    FOREIGN KEY (`ID_NguoiDung`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ChatMessages` (
  `ID` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Chat` BIGINT NOT NULL,
  `ID_NguoiGui` BIGINT NOT NULL,
  `NoiDung` LONGTEXT NULL,
  `AttachmentURL` LONGTEXT NULL,
  `Status` VARCHAR(16) NOT NULL DEFAULT 'sent',
  `CreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `IX_ChatMessages_ID_Chat` (`ID_Chat`),
  KEY `IX_ChatMessages_ID_NguoiGui` (`ID_NguoiGui`),
  CONSTRAINT `FK_ChatMessages_Chats`
    FOREIGN KEY (`ID_Chat`) REFERENCES `Chats` (`ID`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_ChatMessages_NguoiDungs`
    FOREIGN KEY (`ID_NguoiGui`) REFERENCES `NguoiDungs` (`ID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data ------------------------------------------------------------------

INSERT INTO `ChungCus` (`Ten`, `DiaChi`, `ChuDauTu`, `NamXayDung`, `SoTang`, `MoTa`)
VALUES
  ('APT Skyline', '123 Đường Hoa Phượng, TP.HCM', 'PHQ Group', 2020, 25, 'Khu phức hợp cao cấp'),
  ('Sunrise City', '58 Nguyễn Hữu Thọ, Quận 7, TP.HCM', 'Novaland', 2018, 25, 'Tổ hợp thương mại - căn hộ'),
  ('Eco Green Saigon', '5 Tân Thuận Tây, Quận 7, TP.HCM', 'Sài Gòn Nam Long', 2020, 30, 'Phân khu xanh và tiện ích');

INSERT INTO `CanHos` (`MaCan`, `ID_ChungCu`, `DienTich`, `SoPhong`, `Gia`, `TrangThai`, `MoTa`, `URLs`)
VALUES
  ('A1-05', (SELECT `ID` FROM `ChungCus` WHERE `Ten` = 'APT Skyline' LIMIT 1), 75, 3, 2500000000, 'Dang ban',
   'Căn góc hướng Đông, nội thất cao cấp', '["/images/canho/A105-1.jpg","/images/canho/A105-2.jpg"]'),
  ('B2-12', (SELECT `ID` FROM `ChungCus` WHERE `Ten` = 'APT Skyline' LIMIT 1), 68, 2, 1800000000, 'Cho thue',
   'View hồ bơi, đầy đủ nội thất', '[]'),
  ('S1-09', (SELECT `ID` FROM `ChungCus` WHERE `Ten` = 'Sunrise City' LIMIT 1), 90, 3, 3200000000, 'Dang ban',
   'Ban công lớn, tầng trung', '["/images/canho/S109.jpg"]');

INSERT INTO `NguoiDungs` (`HoTen`, `Email`, `MatKhau`, `SoDienThoai`, `LoaiNguoiDung`)
VALUES
  ('Nguyễn Văn Admin', 'admin@apt.local', '$2b$10$oBHOIVqSFCyXrVqSSH9e8e.xbgw0aQMxg2N03QzMWZYUm9t6WwoGG', '0909000000', 'Ban quan ly'),
  ('Lê Thị Cư Dân', 'resident@apt.local', '$2b$10$QydiocIhAPfF1JVhHRVjGeRQGa8vzSVnKFgsKEQBikop0wFEmyW3S', '0909111222', 'Cu dan');

INSERT INTO `CuDans` (`ID_NguoiDung`, `ID_CanHo`, `ID_ChungCu`, `LaChuHo`)
VALUES (
  (SELECT `ID` FROM `NguoiDungs` WHERE `Email` = 'resident@apt.local' LIMIT 1),
  (SELECT `ID` FROM `CanHos` WHERE `MaCan` = 'A1-05' LIMIT 1),
  (SELECT `ID_ChungCu` FROM `CanHos` WHERE `MaCan` = 'A1-05' LIMIT 1),
  1
);

INSERT INTO `DichVus` (`TenDichVu`, `MoTa`, `Gia`)
VALUES
  ('Phí gửi xe ô tô', 'Đăng ký 1 chỗ đậu xe/tháng', 1500000),
  ('Vệ sinh căn hộ', 'Dọn vệ sinh định kỳ mỗi tuần', 800000);

INSERT INTO `HoaDonDichVus` (`ID_CanHo`, `ID_ChungCu`, `SoTien`, `TrangThai`)
VALUES (
  (SELECT `ID` FROM `CanHos` WHERE `MaCan` = 'A1-05' LIMIT 1),
  (SELECT `ID_ChungCu` FROM `CanHos` WHERE `MaCan` = 'A1-05' LIMIT 1),
  1500000,
  'Chua thanh toan'
);

INSERT INTO `HoaDonDichVu_DichVus` (`ID_HoaDon`, `ID_DichVu`)
VALUES (
  (SELECT `ID` FROM `HoaDonDichVus` ORDER BY `ID` DESC LIMIT 1),
  (SELECT `ID` FROM `DichVus` WHERE `TenDichVu` = 'Phí gửi xe ô tô' LIMIT 1)
);

INSERT INTO `TinTucs` (`TieuDe`, `NoiDung`, `HinhAnh`)
VALUES
  ('Thông báo bảo trì thang máy', 'Thang máy tháp A bảo trì ngày 15/03. Quý cư dân vui lòng sử dụng thang B.', '/images/news/baotri.jpg'),
  ('Sự kiện cuối tuần', 'BBQ cộng đồng tại khu vườn tầng 5 lúc 18h ngày 20/03.', '/images/news/bbq.jpg');

INSERT INTO `PhanAnhs` (`ID_NguoiDung`, `NoiDung`, `TrangThai`, `HinhAnh`)
VALUES (
  (SELECT `ID` FROM `NguoiDungs` WHERE `Email` = 'resident@apt.local' LIMIT 1),
  'Hành lang tầng 5 đang bị hỏng đèn và có mùi khó chịu.',
  'Chua xu ly',
  NULL
);

COMMIT;
