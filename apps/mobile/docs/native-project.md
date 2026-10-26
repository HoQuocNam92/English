# Kiểm tra và cấu hình mobile

Ứng dụng dùng Expo SDK 58 (`expo ~58.0.19`), React Native `0.88.0`
và React `19.3.0`. Sau khi nâng SDK, phải build và cài lại development
client/APK; bản native SDK 57 đã cài không chạy được bộ JavaScript mới.
Android dùng Gradle `9.4.1` và bật R8 cho release theo template SDK 58.

Kiểm tra nâng cấp ngày 25/10/2026: Expo Doctor đạt 19/19, `expo install
--check` xác nhận dependency đúng phiên bản; typecheck web/mobile và 19 bài
test hồi quy web/mobile đều đạt. Metro xuất bundle Android thành công.
Các kết quả này chưa thay thế việc chạy thử APK trên thiết bị thật.
Ngày 26/10/2026 đã build thành công APK release cho `arm64-v8a` bằng
Temurin JDK 17 portable. APK đã qua kiểm tra tính toàn vẹn và chữ ký v2;
bundle bên trong dùng `https://api.techenglish.click/api/v1`, không còn IP LAN cũ.
Bản cài thử ở `artifacts/mobile-parity/TechEnglish-mobile-2026-10-26-arm64.apk`.
APK dùng debug keystore hiện có của dự án; chưa chạy thử trên điện thoại thật.

Trên Windows, cấu hình Gradle đặt thư mục CMake tại `artifacts/cxx` và giới hạn
đường dẫn object ở 240 ký tự để tránh lỗi Ninja khi biên dịch Gesture Handler.
Khi build local, đặt `JAVA_HOME` tới JDK 17, `ANDROID_HOME` tới Android SDK,
thêm Node và Java vào `PATH`, rồi chạy từ `apps/mobile/android`:

```sh
gradlew.bat :app:assembleRelease -PreactNativeArchitectures=arm64-v8a --no-daemon
```

Chạy từ thư mục gốc workspace:

```sh
pnpm install --frozen-lockfile
pnpm --filter mobile typecheck
pnpm --filter mobile test
```

Chạy từ `apps/mobile`:

```sh
npx -y expo-doctor
npx expo install --check
```

Các ứng dụng web/mobile và workspace dùng chung React và React DOM `19.3.0`
để tránh nhiều bản sao React trong các module native. Khi cập nhật SDK Expo,
chạy `pnpm --filter mobile exec expo install --fix --pnpm` từ thư mục gốc,
kiểm tra lại web/mobile và commit cả manifest lẫn `pnpm-lock.yaml`.

## Android native được lưu trong Git

Repo giữ `apps/mobile/android/` và các thay đổi native của dự án. EAS Build
biên dịch thư mục này; nó không tự chạy Prebuild để đồng bộ thuộc tính trong
`app.json`/`app.config.js`. Không xóa hoặc tạo lại Android chỉ để hết cảnh báo.

Vì dùng quy trình quản lý native này, `appConfigFieldsNotSyncedCheck` được tắt
trong `package.json`. Đây chỉ là cảnh báo về việc tự đồng bộ config của EAS;
các kiểm tra dependency, module trùng, schema và phiên bản SDK vẫn bật.

Khi đổi icon, scheme, orientation, plugin hoặc cấu hình Android, cập nhật phần
native tương ứng. Có thể chạy lệnh sau từ `apps/mobile` để áp dụng config:

```sh
pnpm exec expo prebuild --platform android --no-install
```

Kiểm tra kỹ diff Android, giữ các tùy chỉnh native và commit các thay đổi cần
thiết trước khi build APK. Không dùng `--clean` vì có thể ghi đè tùy chỉnh.

Nếu chuyển sang quy trình CNG trong tương lai, cần chuyển tùy chỉnh native
sang config plugin, ngừng theo dõi thư mục Android trong Git và bật lại
`appConfigFieldsNotSyncedCheck`.

Các file trong `.expo/` chỉ là trạng thái máy local, được ignore và không commit.

Tham khảo: [Expo Doctor configuration](https://docs.expo.dev/versions/latest/config/package-json/#appconfigfieldsnotsyncedcheck).
