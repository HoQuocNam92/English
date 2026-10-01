# Cấu hình thông báo Firebase

Mã nguồn đã hỗ trợ nhắc học trên web và mobile. Mobile còn có lịch nhắc cục bộ nên vẫn báo khi chưa cấu hình Firebase.

## API

Tạo service account trong Firebase Console và điền vào `apps/api/.env`:

`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

## Web

Tạo Web App và Web Push certificate (VAPID), sau đó điền các biến `NEXT_PUBLIC_FIREBASE_*` theo `apps/web/.env.example`. Web production phải chạy HTTPS.

## Android

Tải `google-services.json` từ Firebase, đặt tại `apps/mobile/google-services.json`, rồi thêm vào mục `android` trong `apps/mobile/app.json`:

```json
"googleServicesFile": "./google-services.json"
```

Sau đó tạo development build hoặc bản APK/AAB mới. Remote push Android không chạy trong Expo Go; lịch nhắc cục bộ vẫn chạy trên thiết bị thật.

## iOS

Cấu hình APNs key trong Firebase/EAS và tạo lại development build. Bundle ID hiện dùng `com.techenglish.pro`.
