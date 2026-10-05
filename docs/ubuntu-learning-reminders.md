# Nhắc học bằng cron trên Ubuntu Server

Cron trên Ubuntu gọi API mỗi phút. Backend không tự lập lịch trong NestJS. API dùng giờ và múi giờ đã lưu của từng học viên để tạo thông báo; ràng buộc user/ngày ngăn trùng thông báo khi có nhiều lời gọi. Lần gọi trễ sẽ kiểm tra và tạo thông báo còn thiếu trong ngày hiện tại.

## 1. Chuẩn bị backend

Triển khai bản code mới, tạo Prisma Client và áp dụng migration (đặc biệt `20261005040000_learning_notifications`):

```bash
pnpm --filter @techenglish/api db:generate
node --env-file=apps/api/.env docker/migrate.cjs
```

Tạo khóa bằng `openssl rand -hex 32`, rồi đặt cùng giá trị vào hai nơi:

- `LEARNING_REMINDER_JOB_KEY` trong môi trường API.
- Header `x-scheduler-key` trong file cấu hình cron ở bước tiếp theo.

Không còn sử dụng biến `LEARNING_REMINDER_SCHEDULER`. Khởi động lại API sau khi đặt khóa.

Nếu chạy Docker Compose, đặt `LEARNING_REMINDER_JOB_KEY` trong `.env.compose` và tạo lại container API:

```bash
docker compose --env-file .env.compose up -d api
```

Với PostgreSQL hiện có, thêm `-f compose.postgres.yml` vào lệnh Compose. Áp dụng migration theo [hướng dẫn Docker](../docker/README.md); file compose cho PostgreSQL hiện có không tự chạy migration.

## 2. Cấu hình và cài cron

Chạy tại thư mục gốc của repo trên Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y cron curl util-linux
sudo install -d -o root -g root -m 700 /etc/techenglish
sudo install -o root -g root -m 600 scripts/ubuntu/learning-reminders.curl.example /etc/techenglish/learning-reminders.curl
sudoedit /etc/techenglish/learning-reminders.curl
```

Giữ URL loopback nếu API chạy trên cùng server; chỉnh port theo `API_PORT` khi dùng Docker. Nếu gọi API ở máy khác, dùng HTTPS. Thay giá trị `REPLACE_WITH...` bằng đúng khóa của API. Không đưa file thật vào Git hoặc đặt khóa trong dòng crontab.

```bash
sudo bash scripts/ubuntu/install-learning-reminders.sh /etc/techenglish/learning-reminders.curl
```

Installer kiểm tra một lần gọi API trước khi bật lịch. Lần kiểm tra này có thể tạo thông báo đang đến hạn. Cài lại sẽ cập nhật cùng file `/etc/cron.d/techenglish-learning-reminders`, không tạo lịch thứ hai và không sửa crontab của người dùng.

File được cài:

```cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MAILTO=""
* * * * * root /usr/local/lib/techenglish/run-learning-reminders.sh >/dev/null 2>&1
```

Script dùng `flock` để ngăn chạy chồng và timeout 45 giây cho mỗi lần gọi. Khóa được curl đọc từ file root-only, không nằm trong tham số tiến trình. Các lần gọi lỗi trả exit code khác 0 và ghi log với tag `techenglish-learning-reminders`.

## 3. Kiểm tra

```bash
sudo /usr/local/lib/techenglish/run-learning-reminders.sh
systemctl status cron --no-pager
sudo cat /etc/cron.d/techenglish-learning-reminders
sudo journalctl -t techenglish-learning-reminders --since '1 hour ago'
```

Trên máy dùng rsyslog, có thể kiểm tra thêm `/var/log/syslog`. Nếu lời gọi lỗi: kiểm tra API đang chạy, URL/port và hai khóa có giống nhau. API trả 401 nếu khóa sai và 503 nếu chưa cấu hình khóa hợp lệ.

## 4. Hiển thị trong web

Người học bật nhắc học và chọn giờ trong hồ sơ. Web lấy `GET /api/v1/notifications/pending` mỗi 30 giây khi đang hiển thị; đóng hoặc bấm “Học ngay” đánh dấu đã đọc qua `PATCH /api/v1/notifications/:id/read`. Hai endpoint yêu cầu JWT và chỉ truy cập thông báo của người đang đăng nhập.

Cron không mở trình duyệt: khi web đóng, thông báo được lưu để hiển thị khi người học quay lại. Thông báo hệ điều hành ngoài web vẫn cần Firebase và quyền thông báo trình duyệt.

## Kiểm thử script trước triển khai

```bash
python3 scripts/ubuntu/test_learning_reminders.py
```

Bộ test gọi HTTP server giả lập local để kiểm tra xác thực, lỗi API, quyền file và chống chạy chồng; không cài lịch vào hệ thống. Python chỉ cần cho kiểm thử, script cron chạy bằng Bash/curl.

## Tắt lịch

```bash
sudo rm /etc/cron.d/techenglish-learning-reminders
```

Các thông báo đã lưu vẫn được giữ. Không cần tắt toàn bộ dịch vụ cron của server.

Tham khảo: [Ubuntu crontab](https://manpages.ubuntu.com/manpages/noble/man5/crontab.5.html), [curl config](https://curl.se/docs/manpage.html#-K).
