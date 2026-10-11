# Kiểm tra và cấu hình mobile

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

Các ứng dụng web/mobile và workspace dùng chung React và React DOM `19.2.3`
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
