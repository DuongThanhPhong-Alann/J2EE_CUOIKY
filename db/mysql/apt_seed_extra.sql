-- Extra seed data (converted ideas from Supabase/Postgres scripts) for MySQL.
-- Run after `db/mysql/apt_schema.sql`.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- More buildings (idempotent; requires UNIQUE `UQ_ChungCus_Ten`)
INSERT IGNORE INTO `ChungCus` (`Ten`, `DiaChi`, `ChuDauTu`, `NamXayDung`, `SoTang`, `MoTa`)
VALUES
  ('Chung cư APT Skyline',     '123 Hoa Phượng, Quận 1, TP.HCM',     'PHQ Group',       2020, 25, 'Dự án căn hộ cao cấp, tiện ích đầy đủ'),
  ('Chung cư Green City',      '456 Lê Lợi, Quận Hải Châu, Đà Nẵng', 'GreenLand',       2018, 30, 'Khu căn hộ xanh, gần công viên'),
  ('Chung cư Sun Plaza',       '789 Trần Phú, Quận 5, TP.HCM',       'Sun Holding',     2019, 28, 'Căn hộ cao cấp, gần trung tâm thương mại'),
  ('Chung cư River View',      '12 Nguyễn Huệ, TP. Thủ Đức',         'River Corp',      2021, 35, 'View sông, không gian thoáng mát'),
  ('Chung cư Ocean Park',      '88 Võ Nguyên Giáp, TP. Đà Nẵng',     'Ocean Group',     2017, 22, 'Gần biển, phù hợp nghỉ dưỡng'),
  ('Chung cư City Garden',     '35 Điện Biên Phủ, Bình Thạnh, HCM',  'CityHome',        2016, 21, 'Khu căn hộ nhiều cây xanh, hồ bơi'),
  ('Chung cư Central Park',    '720 Điện Biên Phủ, Quận Bình Thạnh', 'Vingroup',        2015, 40, 'Tổ hợp căn hộ + TTTM cao cấp'),
  ('Chung cư Lake View',       '25A Phạm Văn Đồng, Hà Nội',          'LakeHouse',       2019, 26, 'View hồ, không gian yên tĩnh'),
  ('Chung cư An Cư Residence', '15 Lê Văn Việt, TP. Thủ Đức',        'An Cư Corp',      2022, 18, 'Dành cho gia đình trẻ, giá hợp lý'),
  ('Chung cư Golden Home',     '99 Nguyễn Văn Cừ, TP. Cần Thơ',      'Golden Home JSC', 2020, 24, 'Căn hộ hiện đại, gần trường học và bệnh viện');

-- Apartments (idempotent upsert on unique key (MaCan, ID_ChungCu))
INSERT INTO `CanHos` (`MaCan`, `ID_ChungCu`, `DienTich`, `SoPhong`, `Gia`, `TrangThai`, `MoTa`, `URLs`)
VALUES (
  'C01-01',
  (SELECT `ID` FROM `ChungCus` WHERE `Ten`='Chung cư APT Skyline' LIMIT 1),
  65, 2, 1500000000, 'Dang ban',
  'Căn hộ 2 phòng ngủ tại dự án APT Skyline. Thiết kế hiện đại, tối ưu không gian. Ban công rộng rãi hướng Đông Nam, đón nắng và gió mát cả ngày. Nội thất cơ bản, sẵn sàng dọn vào ở.',
  JSON_ARRAY(
    'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/1.jpg',
    'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/2.jpg',
    'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/3.jpg'
  )
)
ON DUPLICATE KEY UPDATE
  `DienTich` = VALUES(`DienTich`),
  `SoPhong` = VALUES(`SoPhong`),
  `Gia` = VALUES(`Gia`),
  `TrangThai` = VALUES(`TrangThai`),
  `MoTa` = VALUES(`MoTa`),
  `URLs` = VALUES(`URLs`);

INSERT INTO `CanHos` (`MaCan`, `ID_ChungCu`, `DienTich`, `SoPhong`, `Gia`, `TrangThai`, `MoTa`, `URLs`)
VALUES (
  'C01-02',
  (SELECT `ID` FROM `ChungCus` WHERE `Ten`='Chung cư APT Skyline' LIMIT 1),
  70, 2, 1600000000, 'Dang ban',
  'Căn hộ 2 phòng ngủ, nằm ở tầng trung yên tĩnh. Layout vuông vắn, không có góc chết, phòng khách liên thông với khu vực bếp tạo cảm giác mở và thoáng đãng.',
  JSON_ARRAY(
    'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/4.jpg',
    'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/5.jpg'
  )
)
ON DUPLICATE KEY UPDATE
  `DienTich` = VALUES(`DienTich`),
  `SoPhong` = VALUES(`SoPhong`),
  `Gia` = VALUES(`Gia`),
  `TrangThai` = VALUES(`TrangThai`),
  `MoTa` = VALUES(`MoTa`),
  `URLs` = VALUES(`URLs`);

-- Building images (Supabase Storage public URLs you provided)
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/gd-1764562317239.jpg'
FROM `ChungCus` WHERE `Ten`='Chung cư Golden Home' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/ancu-1764562421522.jpg'
FROM `ChungCus` WHERE `Ten`='Chung cư An Cư Residence' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/vinhomes-central-park-landmark-1-gia-ban-chi-tiet-cac-loai-can-ho-1-1764562578627.jpg'
FROM `ChungCus` WHERE `Ten`='Chung cư Central Park' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/01-du-an-city-garden-nhin-tu-xa-1764562651636.jpg'
FROM `ChungCus` WHERE `Ten`='Chung cư City Garden' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/grenncity-1764566689147.JPG'
FROM `ChungCus` WHERE `Ten`='Chung cư Green City' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/hanoi-lake-view_2013103110726-1764566760737.jpg'
FROM `ChungCus` WHERE `Ten`='Chung cư Lake View' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/vincity-ocean-park-2225-1764566818631.jpg'
FROM `ChungCus` WHERE `Ten`='Chung cư Ocean Park' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/vrg-river-view-1_2201222643-1764566868485.jpg'
FROM `ChungCus` WHERE `Ten`='Chung cư River View' LIMIT 1;
INSERT IGNORE INTO `HinhAnhChungCus` (`ID_ChungCu`, `DuongDan`)
SELECT `ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/buildings/tttm-sun-plaza-ancora-du-kien-chinh-thuc-khai-truong-vao-ngay-11-1-2019-anh-minh-hoa-15466005797861654199583-1764566922159.webp'
FROM `ChungCus` WHERE `Ten`='Chung cư Sun Plaza' LIMIT 1;

-- Apartment images: mỗi căn hộ 3 ảnh cơ bản (Supabase Storage public URLs)
-- (Dựa theo mẫu bạn đưa: 1.jpg, 4.jpg, 9.jpg; bạn có thể đổi danh sách tại đây)
INSERT IGNORE INTO `HinhAnhCanHos` (`ID_CanHo`, `DuongDan`)
SELECT c.`ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/1.jpg'
FROM `CanHos` c;
INSERT IGNORE INTO `HinhAnhCanHos` (`ID_CanHo`, `DuongDan`)
SELECT c.`ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/4.jpg'
FROM `CanHos` c;
INSERT IGNORE INTO `HinhAnhCanHos` (`ID_CanHo`, `DuongDan`)
SELECT c.`ID`, 'https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/9.jpg'
FROM `CanHos` c;

-- Mirror 3 ảnh cơ bản vào CanHos.URLs (JSON text)
UPDATE `CanHos`
SET `URLs` = '["https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/1.jpg","https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/4.jpg","https://dwmksmgzljllumyaajti.supabase.co/storage/v1/object/public/apt-assets/apartments/9.jpg"]'
WHERE `URLs` IS NULL OR `URLs` = '';

-- Add 360/3D links (Momento360 + Sketchfab)
UPDATE `CanHos`
SET
  `SketchfabUrl` = ELT(1 + MOD(`ID`, 3),
    'https://sketchfab.com/models/d2b1f21f36264e0a940e24a4b560e435/embed',
    'https://sketchfab.com/models/80425c18729e44a8a614c5678fbc5589/embed',
    'https://sketchfab.com/models/350328cef4e04822a9728d8938125729/embed'
  ),
  `Model3DUrl` = ELT(1 + MOD(`ID`, 4),
    'https://momento360.com/e/u/e04a80b91a4a4e9699c0797136a1f5cb?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
    'https://momento360.com/e/u/a123e303bcdf46b9b0d459c33e30d5a6?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
    'https://momento360.com/e/u/3934e10e48a34d10ac3fe68c3a243fba?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
    'https://momento360.com/e/u/228c36f7e1464c61b9aa16c98de8b1b2?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true'
  )
WHERE `SketchfabUrl` IS NULL OR `Model3DUrl` IS NULL;

-- More news (MySQL interval syntax)
INSERT INTO `TinTucs` (`TieuDe`, `NoiDung`, `NgayDang`, `HinhAnh`)
VALUES
  (
    'Phản ánh tiếng ồn vào ban đêm tại hành lang tầng cao',
    'Nhiều cư dân phản ánh tình trạng nói chuyện lớn tiếng, tụ tập tại hành lang sau 22h làm ảnh hưởng đến sinh hoạt và giấc ngủ của các hộ gia đình. Ban quản lý đề nghị cư dân tuân thủ quy định giữ trật tự chung.',
    NOW() - INTERVAL 3 DAY,
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Một số căn hộ gặp tình trạng rò rỉ nước nhà vệ sinh',
    'Một số hộ tại các tầng trung cho biết nhà vệ sinh bị thấm nước, ố vàng trần và tường. Ban quản lý đã ghi nhận và phối hợp với đơn vị thi công kiểm tra, lên phương án xử lý dứt điểm để tránh ảnh hưởng lâu dài đến kết cấu công trình.',
    NOW() - INTERVAL 5 DAY,
    'https://images.unsplash.com/photo-1519710884009-22a59b772e2f?auto=format&fit=crop&w=1200&q=80'
  );

-- Services with images
INSERT INTO `DichVus` (`TenDichVu`, `MoTa`, `Gia`, `HinhAnh`)
VALUES
  (
    'Lắp đặt đèn trang trí',
    'Lắp đặt các loại đèn trang trí nội thất: đèn chùm, đèn thả, đèn ray trượt, đèn LED âm trần cho căn hộ.',
    400000,
    'https://cdn.pixabay.com/photo/2018/06/07/20/00/lighting-3460673_1280.jpg'
  ),
  (
    'Chuyển nhà trọn gói nhỏ',
    'Hỗ trợ đóng gói, tháo lắp đồ đạc cơ bản, vận chuyển và sắp xếp đồ đạc trong phạm vi nội thành.',
    1500000,
    'https://c0.wallpaperflare.com/preview/420/550/474/boxes-moving-cardboard-relocation.jpg'
  );

COMMIT;
