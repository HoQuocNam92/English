# Hướng dẫn dùng hệ thống vận hành TechEnglish

## Đăng nhập dashboard

Mở https://techenglish.click/monitoring/d/techenglish-vps

Tài khoản và mật khẩu nằm trong file riêng trên máy:
`D:\English\artifacts\ops-20261103\grafana-access.txt`.

Không chia sẻ file này. Mật khẩu không được ghi trong hướng dẫn.

## Xem tình trạng hệ thống

- Chọn khoảng thời gian ở góc trên bên phải; mặc định là 6 giờ gần nhất.
- Dashboard tự cập nhật mỗi 30 giây.
- Xem CPU, RAM, dung lượng ổ đĩa, HTTPS và PostgreSQL.
- Container health bằng 1/True nghĩa là dịch vụ khỏe; 0/False cần kiểm tra.
- Firing alerts hiển thị những cảnh báo đang xảy ra. Không có cảnh báo là trạng thái bình thường.
- Các ô về backup S3 cho biết độ mới của dữ liệu đã sao lưu, không chỉ lần kết nối S3 gần nhất.

## Xem log

Kéo xuống cuối dashboard để xem log API/web, PostgreSQL, Nginx và các tác vụ backup.
Dùng khoảng thời gian phía trên để tìm đúng lúc phát sinh lỗi.

## Nhận cảnh báo

Email đang bật tới `hoquocnam92@gmail.com`.
Hệ thống gửi mail khi có lỗi đáp ứng điều kiện cảnh báo và gửi thông báo khi sự cố được giải quyết.
Telegram đang tắt, không yêu cầu phải có bot để email hoạt động.

## Sao lưu S3

- Tự sao lưu mỗi ngày lúc 02:00, giờ Việt Nam/Bangkok.
- Tự thử đồng bộ lại mỗi giờ khi cần.
- Chủ nhật 03:00: tải bản mới nhất từ S3 và khôi phục thử vào database tạm.
- Mở AWS S3, chọn bucket `vps-backup-2026-unique`, vào `techenglish/postgresql/`.
- Mỗi thư mục có dạng `YYYYMMDDTHHMMSSZ`; chữ Z là giờ UTC, cộng 7 giờ để đổi sang giờ Việt Nam.
- `database.dump`: bản sao lưu PostgreSQL dạng custom.
- `database.sql.gz`: bản SQL đã nén; giải nén để lấy SQL.
- `manifest.json` và `SHA256SUMS`: thông tin kiểm tra tính toàn vẹn.
- `latest.json`: trỏ tới bản đã tải lên và xác minh hoàn tất.

Muốn tạo backup ngay, mở PowerShell:

```powershell
ssh techenglish "sudo systemctl start techenglish-backup.service"
```

Muốn kiểm tra khôi phục thử bản trên S3:

```powershell
ssh techenglish "sudo systemctl start techenglish-restore.service"
```

Hai lệnh trên không xóa hoặc ghi đè database production. Không tự phục hồi dữ liệu vào database đang dùng khi chưa có kế hoạch bảo vệ các thay đổi mới.

## Bật Telegram sau này

Trên VPS, điền bot token vào `~/techenglish-ops/secrets/telegram-token`.
Sửa `~/techenglish-ops/notifications.json`: đặt `telegram.enabled` thành `true` và điền `chat_id`.
Bấm Start trong cuộc trò chuyện với bot trước. Hệ thống tự áp dụng cấu hình hợp lệ; email có thể chạy đồng thời với Telegram.

## Những phần đã dọn trên PC

- Đã xóa tác vụ Windows `TechEnglishBackupSync`, không chỉ tạm tắt.
- Không còn tiến trình backup local được phát hiện.
- Đã dừng Riot Client chạy nền và gỡ mục Riot/Edge tự mở nền.
- Các bản dump/SQL đã có trong D:\ vẫn được giữ nguyên.
- Backup, monitoring và cảnh báo hiện chạy trên VPS, không cần giữ máy PC bật.

Cấu hình khởi động cũ được lưu tại `D:\English\artifacts\ops-20261103\disabled-background-startup.json` để có thể hoàn tác khi cần.

## Các biểu đồ hiệu năng vừa bổ sung

Tải lại dashboard và kéo xuống phần cuối để xem:

- Container RAM (MB): RAM riêng của API, web và PostgreSQL.
- Container network receive/transmit: tốc độ nhận/gửi dữ liệu từng container, tính từ bộ đếm Docker lấy mẫu mỗi phút.
- Container restarts: số lần restart trong 15 phút; thay container khi deploy là vòng đời mới.
- API requests per second: số yêu cầu thực tế qua Nginx mỗi giây, trung bình 5 phút.
- API HTTP 4xx/5xx: 4xx là yêu cầu bị từ chối/không hợp lệ/không tìm thấy; 5xx là lỗi phía dịch vụ. Không phải mọi 4xx đều là sự cố.
- API p95/p99 latency: 95%/99% yêu cầu quan sát được hoàn tất trong khoảng thời gian đó. Ví dụ p95=0.3s nghĩa là khoảng 95% yêu cầu trong cửa sổ đo mất không quá 300ms. Ít lượt truy cập khiến percentile dao động mạnh.
- Slowest API resource families: nhóm API có p95 cao; đường dẫn được gom theo tài nguyên, không lưu ID hay query string. Đây là đo ở reverse proxy, không phải tracing từng hàm backend.
- PostgreSQL transactions per second: số transaction commit + rollback mỗi giây, không phải chính xác số câu SQL mỗi giây.
- PostgreSQL active/slow queries: số truy vấn đang chạy và số đang chạy quá 1 giây tại lúc lấy mẫu; truy vấn kết thúc giữa hai lần lấy mẫu có thể không hiện ở biểu đồ này.
- PostgreSQL completed operations >1 second: log thời gian của thao tác đã hoàn tất trên 1 giây. Không ghi nội dung SQL; Parse/Bind/Execute có thể có các bản ghi thời gian riêng.
- PostgreSQL lock waiters: truy vấn chờ khóa, giúp phân biệt nghẽn khóa với CPU/RAM.
- Backup archive size: tổng dung lượng file của snapshot local dùng làm nguồn gửi S3, không phải dung lượng cộng dồn của toàn bucket.

Cảnh báo bổ sung: API 5xx vượt 5% trong 5 phút và có đủ lưu lượng; p95 vượt 2 giây trong 10 phút và có đủ lưu lượng; truy vấn PostgreSQL quá 30 giây kéo dài; kết nối database vượt 80%. Telegram vẫn chờ cấu hình; email tiếp tục hoạt động.

Dữ liệu hiệu năng API mới chỉ bắt đầu từ lúc bật log; không tái tạo dữ liệu quá khứ. Ô trống có thể nghĩa là chưa có sự kiện phù hợp, không mặc định là lỗi thu thập.
