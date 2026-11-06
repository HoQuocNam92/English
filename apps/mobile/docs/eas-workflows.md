# Workflow Android

File cấu hình: `apps/mobile/.eas/workflows/android-preview.yml`.

Workflow kiểm tra TypeScript, chạy bộ test mobile rồi mới build APK bằng
profile `preview` trong `eas.json`. Nếu kiểm tra thất bại, bước build không chạy.
APK kết nối API thật `https://api.techenglish.click/api/v1` và cài độc lập.

## Chạy thủ công từ máy tính

```powershell
cd D:\English\apps\mobile
npx eas-cli@latest workflow:run .eas/workflows/android-preview.yml
```

Theo dõi lượt chạy trong mục Workflows của dự án Expo. Sau khi hoàn tất,
mở job Build Installable Android APK để tải/cài APK.

## Tự chạy khi cập nhật GitHub

Commit và push các file cấu hình này lên repository `HoQuocNam92/English`.
Trong Expo Project settings > GitHub, liên kết repository đó với dự án
`tech-english`, đặt app base directory là `apps/mobile` nếu được yêu cầu.
Sau khi kết nối, mỗi push lên `main` có thay đổi mobile, packages dùng chung
hoặc cấu hình dependency sẽ kích hoạt workflow.

Chỉnh sửa hoặc lưu file trên máy chưa kích hoạt workflow; cần push GitHub
hoặc chạy lệnh thủ công ở trên. Mỗi lượt chạy dùng tài nguyên/hạn mức Expo.
Workflow chỉ tạo APK để test; không tự gửi app lên Google Play.

Tham khảo:
- https://docs.expo.dev/eas/workflows/get-started/
- https://docs.expo.dev/eas/workflows/syntax/
