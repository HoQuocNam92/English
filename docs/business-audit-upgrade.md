# Báo cáo nâng cấp audit log và bảo mật phiên

## Phạm vi và hiện trạng đã kiểm tra

Đã đọc luồng NestJS/Prisma, JWT và refresh token, MFA, RBAC, các controller xác thực/người dùng/vai trò/nội dung, schema và hai lịch sử migration, middleware audit cũ, frontend audit và design system, menu, API client web/mobile và CI/deploy.

Trước nâng cấp, middleware ghi request sau khi phản hồi; trang chỉ có email/đường dẫn, kết quả HTTP và phân trang. Chưa có xác nhận nghiệp vụ, trước/sau, request ID, quyền đọc riêng, cảnh báo hoặc bảo vệ chỉnh sửa trực tiếp. Bộ lọc mới được bổ sung trên API hiện có, không viết lại RBAC hay module nội dung.

## Chức năng đã thực hiện

- Tên nghiệp vụ tiếng Việt; HTTP method/route là thông tin phụ. Login thành công/thất bại có tên riêng. Dòng cũ không có `outcome` vẫn là **chưa xác nhận nghiệp vụ**, kể cả HTTP 200; không backfill hoặc suy đoán kết quả cũ.
- Lọc backend theo thời gian, người thực hiện, hành động, kết quả, IP, loại đối tượng, mức độ; tìm theo email/route và UUID request/sự kiện/đối tượng. Giới hạn 100 dòng; mặc định 25. Sắp xếp ổn định theo thời gian + ID, hỗ trợ cursor và giữ page/limit cũ. List không trả JSON trước/sau, user agent hay failure reason; xem chi tiết tải riêng.
- Modal chi tiết dùng Modal/Dropdown/PageHeader và biến màu hiện có; dữ liệu trước/sau trình bày thành trường dễ đọc. Có loading, empty, retry, đóng Escape và điều khiển focus. Đã bỏ mô tả dưới tiêu đề theo yêu cầu bổ sung.
- Actor lấy từ JWT đã được kiểm tra lại bằng database; không lấy `actor_id` trong body. Request ID được server tạo, trả qua `X-Request-ID` và dùng trong log lỗi. IP dùng Express `req.ip`; mặc định không tin forwarded header.
- Thành công được ghi khi handler nghiệp vụ hoàn tất và transaction commit. Với các route quan trọng đã ánh xạ, interceptor tạo transaction Serializable bao gồm cả thao tác và log. PrismaService dùng ngữ cảnh AsyncLocalStorage để các service và transaction lồng hiện có cùng tham gia một giao dịch. Lỗi ghi log làm rollback nghiệp vụ; xung đột Serializable trả 409 để tải lại/thử lại, không âm thầm chạy lại thao tác.
- MFA giữ transaction hiện tại để lần nhập sai vẫn cộng bộ đếm. Xác minh/kích hoạt/đặt lại MFA ghi sự kiện ngay trong transaction MFA; không ghi trùng từ interceptor. Chuẩn bị khóa thiết lập và kích hoạt MFA là hai sự kiện khác nhau, không coi việc lấy khóa là MFA đã bật.
- Ghi login, logout, đổi/đặt lại mật khẩu, thu hồi phiên, từ chối truy cập, tạo/khóa/mở/khôi phục/xóa tài khoản, thay đổi vai trò/quyền, CRUD nội dung và chuyển trạng thái hàng loạt. GET nội dung thường không ghi; đọc audit được coi là đọc bảo mật. Không nhận nhầm tạo bài làm của học viên là tạo bài thi.
- Vai trò/quyền có trước/sau từ database. Bài học có tiêu đề, trạng thái, số khối và SHA-256 nội dung để nhận diện thay đổi mà không sao chép đoạn văn/code vào log. Các snapshot chỉ chứa allowlist an toàn, tối đa 100 phần tử/mảng và 100 ký tự/chuỗi. Bulk giữ tối đa 10.000 UUID, số yêu cầu/cập nhật/bỏ qua. Bulk cập nhật nguyên tử; khi thất bại không xác nhận có dòng nào đã đổi.
- Quyền mới `audit:read`; admin giữ bypass sẵn có của kiến trúc. Nhân sự được cấp đúng permission có thể xem; người dùng thường bị từ chối. Không có API sửa/xóa audit.
- `info`, `warning`, `critical`; thay đổi quyền và reset MFA được phân loại quan trọng. Cảnh báo nội bộ khi có ít nhất 5 login thất bại/IP/5 phút, thay đổi quyền/MFA thành công, hoặc yêu cầu đổi quyền bị từ chối. Lỗi thông thường không tự được coi là tấn công. Khóa giao dịch theo IP bảo vệ đếm lỗi đồng thời. Unique dedupe theo loại + actor/IP + bucket 5 phút chống trùng. Cảnh báo chỉ hiển thị trong ứng dụng, không gửi email/Telegram.
- Trigger PostgreSQL chặn UPDATE/DELETE/TRUNCATE log. Xóa theo chính sách lưu trữ chỉ dành cho tài khoản hạ tầng được cấp role bảo trì riêng; không có đường xóa từ admin UI.
- Bảo mật tài khoản chuyển xuống cuối menu. Cả hai API đổi mật khẩu và reset password đều thu hồi phiên; JWT strategy kiểm tra session cho mọi vai trò. Web có kênh SSE riêng cho phiên hiện tại, nhận thu hồi khoảng 2 giây khi kết nối; mobile kiểm tra mỗi 5 giây lúc foreground và khi mở lại. Access/refresh token cũ bị API từ chối ngay sau commit. Máy mất mạng chỉ nhận biết khi nối lại; không có cam kết đẩy dữ liệu tới thiết bị offline.

## Migration

`20261104100000_business_audit/migration.sql` có bản giống nhau trong:

- `apps/api/prisma/migrations/`
- `docker/prisma/migrations/`

Chỉ bổ sung cột nullable vào `audit_logs`, severity mặc định info, index và GIN cho target IDs; thêm bảng `audit_alerts`, permission `audit:read` và trigger append-only. Không xóa/sửa dòng lịch sử, không tạo lại bảng cũ. Các trường cũ và response `{data, meta}` giữ lại; endpoint detail/alerts và trường dữ liệu mới là bổ sung. `outcome=unknown` chỉ lịch sử chưa có xác nhận; success/failure lọc kết quả nghiệp vụ mới, không suy từ HTTP code của dữ liệu cũ.

## Lưu giữ và bảo vệ hạ tầng

Mặc định đề xuất giữ 365 ngày trong DB, tối thiểu 90 ngày nếu vận hành chọn dùng công cụ. Đây là chính sách kỹ thuật đề xuất, chưa thay thế quyết định lưu giữ của đơn vị vận hành. Không có job tự xóa và chưa chạy dọn dữ liệu.

`scripts/audit/archive.cjs` mặc định chỉ đếm; `--archive` xuất NDJSON theo batch 1.000 dòng, fsync và manifest SHA-256. Lưu vào ổ mã hóa và sao lưu ngoại vi/immutable storage do người vận hành quản lý. Không lưu password/token trong manifest hoặc in connection string.

Ví dụ thao tác **chỉ sau khi vận hành xác nhận đúng database**:

```sh
# DATABASE_URL lấy từ secret store, không ghi vào shell history.
AUDIT_RETENTION_DAYS=365 node scripts/audit/archive.cjs
AUDIT_ARCHIVE_DIR=/secure/audit-archives node scripts/audit/archive.cjs --archive
```

Sau khi xác minh checksum, số dòng, khôi phục thử và sao chép bản sao ra nơi khác, người vận hành dùng một tài khoản DB riêng để chạy `--prune --backup-verified` với `AUDIT_ARCHIVE_MANIFEST` trỏ tới manifest **đã tạo trước đó**. Công cụ kiểm tra digest, database, số dòng, ID và cutoff trước khi xóa; chỉ xóa các ID có trong bản sao, không DELETE toàn bộ theo ngày. Không chạy archive và prune trong cùng lệnh. Cần role `techenglish_audit_maintenance`; không cấp role này cho API, admin ứng dụng hoặc tài khoản deploy thường ngày. Chưa chạy chức năng prune trong công việc này.

Người vận hành cần tách tài khoản runtime khỏi migration/owner/superuser, thu hồi UPDATE/DELETE/TRUNCATE trên audit khỏi runtime; runtime cần SELECT/INSERT audit và quyền cần thiết cho upsert cảnh báo. Trigger không thể chống một DBA/superuser cố ý bỏ trigger/drop bảng. Muốn bằng chứng chống DBA can thiệp cần backup/WORM ngoài máy và chính sách IAM độc lập. Chưa thay đổi quyền DB hoặc backup thực tế trên VPS.

## Kiểm thử và bằng chứng

- TypeScript API/web/mobile đều đạt.
- API suite, regression suite, web suite và mobile suite đã chạy; xem kết quả cuối được báo trong chat.
- PostgreSQL QA độc lập: deploy đầy đủ migration Docker từ DB mới, `prisma migrate diff --exit-code` không có khác biệt.
- Kiểm thử HTTP thật login → MFA → audit list/detail/filter, từ chối quyền, không có PATCH/DELETE audit, login thất bại đồng thời và cảnh báo.
- PostgreSQL: thay đổi vai trò và log cùng commit; cố ý làm audit insert lỗi để xác nhận rollback; request đồng thời; UPDATE/DELETE/TRUNCATE log bị chặn; MFA không ghi trùng và bộ đếm sai được giữ.
- PostgreSQL: cả hai API đổi mật khẩu và password reset vô hiệu hóa hai access/refresh session, web nhận tín hiệu thu hồi.
- UI: phân biệt legacy 200 chưa xác nhận, chuyển bộ lọc tới server, mở modal tải dữ liệu thật qua API mock của test, retry và cursor; parser SSE xử lý khung bị cắt và không logout nhầm do mất mạng.
- Công cụ retention đã chạy dry-run và archive trên QA vào thư mục tạm. Không chạy prune.

## Giới hạn và rủi ro còn lại

- Chưa deploy, chạy migration, đổi quyền hạ tầng hay kiểm tra proxy/SSE trên VPS production.
- Log thất bại xảy ra trước handler hoặc transaction rollback được ghi riêng sau phản hồi; mất DB/process đúng lúc này có thể mất telemetry thất bại. Có lỗi `AUDIT_WRITE_FAILED` kèm request ID để giám sát. Log thành công của route đã ánh xạ được fail-closed trong giao dịch nghiệp vụ. Chưa có hàng đợi bền vững bên ngoài cho tình huống toàn DB mất kết nối.
- OAuth callback Google tạo phiên trong guard trước interceptor; sự kiện được ghi từ kết quả guard đã xác thực sau khi redirect kết thúc, không suy success chỉ từ HTTP 302 và không chặn redirect nếu lưu telemetry lỗi. Chưa thể bảo đảm transaction chung cho callback bên ngoài này. Password/Google-mobile login vẫn đi qua transaction audit. Cần kiểm thử OAuth với cấu hình provider thật ở staging; QA không gọi Google production.
- Không dựng lại trước/sau cho log cũ. Snapshot không chứa toàn bộ nội dung bài học, câu trả lời hay hồ sơ cá nhân để hạn chế rò rỉ; digest chứng minh có thay đổi, không dùng để phục hồi đoạn văn. Không audit mọi module phụ/SQL thủ công nằm ngoài các route đã ánh xạ. Giữ luật không ghi các GET bình thường.
- Chưa có chức năng tắt MFA vĩnh viễn hoặc role Owner trong hệ thống; không thêm API làm yếu MFA chỉ để có sự kiện. Reset MFA hiện có được audit critical và vẫn buộc đăng ký lại.
- Chưa gửi cảnh báo ra dịch vụ ngoài. Dedupe dùng bucket thời gian, nên hai cảnh báo gần ranh giới bucket có thể cùng tồn tại; không kết luận là tấn công.
- Index/cursor và giới hạn trang đã có; chưa benchmark ở tải hàng trăm nghìn dòng trên phần cứng VPS. Tìm kiếm contains hoặc total trên tập dữ liệu rất lớn cần theo dõi EXPLAIN/latency và cân nhắc trigram/search index sau đo đạc. Theo dõi chi phí transaction Serializable và kết nối SSE (một phép kiểm tra session/2 giây/web đang mở).

## Hướng dẫn production an toàn — chưa thực hiện

1. Review nhánh tính năng, chạy CI và thử trên staging có bản sao DB đã che thông tin. Xác minh provider Google, trusted proxy và SSE qua reverse proxy. Không đặt token trong URL.
2. Kiểm tra backup full PostgreSQL, khôi phục thử và dung lượng. Ghi số dòng audit hiện tại để đối chiếu. Xác định API runtime, migration owner và tài khoản bảo trì độc lập.
3. Chọn cửa sổ bảo trì ngắn: migration có thêm index/trigger/permission, có thể lấy lock. Chạy **luồng migration hiện có** `node docker/migrate.cjs` bằng tài khoản migration; không `db push`, reset, drop hoặc sửa lịch sử migration đã chạy.
4. Đối chiếu số dòng audit không giảm; xác minh schema, trigger và permission, quyền runtime chỉ cần thiết. Tài khoản runtime không là owner/superuser hoặc thành viên role bảo trì.
5. Cấu hình `TRUSTED_PROXY_CIDRS` bằng IP/CIDR của proxy thực sự đã xác minh, để trống nếu chưa chắc. Không trust-all, không dùng số hop tùy ý. Proxy phải chặn truy cập giả mạo vào backend, ghi đè/chuẩn hóa forwarded headers, tắt buffering cho SSE và cho phép kết nối lâu.
6. Build Prisma client/API/web; triển khai code sau migration. Kiểm tra login, MFA, đổi vai trò, bulk, snapshot, modal, lỗi 403 và quyền xem; đổi mật khẩu bằng tài khoản thử để kiểm tra thiết bị khác bị thu hồi. Phiên thiếu SID cũ phải refresh hợp lệ hoặc đăng nhập lại.
7. Bật giám sát `AUDIT_WRITE_FAILED`, 409, thời gian transaction, DB pool, dung lượng/index và cảnh báo nội bộ. Chưa bật prune/scheduler khi chưa phê duyệt retention và backup.

## Rollback

- Không drop cột/bảng/index hoặc xóa log để rollback. Các cột thêm nullable/default cho phép API cũ tiếp tục INSERT với các trường cũ.
- Ưu tiên dừng nhận thao tác ghi trong cửa sổ xử lý sự cố; triển khai lại release tương thích đã kiểm thử. Giữ riêng bản sửa thu hồi session cho mọi vai trò và đổi mật khẩu nguyên tử, tránh vô tình đưa lỗi bảo mật phiên trở lại.
- Nếu tạm rollback phần audit, log mới có thể chỉ có dữ liệu request cũ và phải hiển thị **chưa xác nhận nghiệp vụ**; không backfill success. Giữ trigger và backup, không tắt bảo vệ để xóa lỗi.
- Không chạy migrate reset/rollback phá hủy. Sửa schema bằng migration tiến tiếp sau khi phân tích. Thử rollback code trên staging trước; không tự chạy các bước này trên production.

## Danh sách file

Danh sách chính xác của bản thay đổi được bổ sung dưới đây trước khi commit; các file dữ liệu, Android, tài liệu và tra từ đang sửa từ trước không được đưa vào bản nâng cấp này.

- `.github/workflows/ci.yml`
- `apps/api/.env.example`
- `apps/api/package.json`
- `apps/api/prisma/migrations/20261104100000_business_audit/migration.sql`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/app.module.ts`
- `apps/api/src/application/auth/admin-mfa.service.ts`
- `apps/api/src/application/auth/admin-security-http.spec.ts`
- `apps/api/src/application/auth/admin-security.integration.spec.ts`
- `apps/api/src/application/auth/admin-security.spec.ts`
- `apps/api/src/application/auth/auth.service.ts`
- `apps/api/src/application/auth/session-revocation.integration.spec.ts`
- `apps/api/src/application/user/user.service.ts`
- `apps/api/src/infrastructure/audit/audit-context.ts`
- `apps/api/src/infrastructure/audit/audit-events.ts`
- `apps/api/src/infrastructure/audit/audit.interceptor.ts`
- `apps/api/src/infrastructure/audit/audit.middleware.ts`
- `apps/api/src/infrastructure/audit/business-audit-http.integration.spec.ts`
- `apps/api/src/infrastructure/audit/business-audit.integration.spec.ts`
- `apps/api/src/infrastructure/audit/business-audit.spec.ts`
- `apps/api/src/infrastructure/auth/jwt-auth.guard.ts`
- `apps/api/src/infrastructure/auth/jwt.strategy.ts`
- `apps/api/src/infrastructure/database/prisma.service.ts`
- `apps/api/src/main.ts`
- `apps/api/src/modules/auth.module.ts`
- `apps/api/src/presentation/audit-log.controller.ts`
- `apps/api/src/presentation/filters/http-exception.filter.ts`
- `apps/api/src/presentation/session-events.controller.ts`
- `apps/mobile/src/shared/api/api-client.ts`
- `apps/mobile/src/shared/store/auth-context.tsx`
- `apps/web/app/(admin)/admin/audit-logs/page.tsx`
- `apps/web/app/(admin)/layout.tsx`
- `apps/web/src/shared/auth/SessionMonitor.tsx`
- `apps/web/src/shared/layout/RouteGuard.tsx`
- `apps/web/src/shared/layout/Sidebar.tsx`
- `apps/web/src/shared/layout/navigation.ts`
- `apps/web/src/shared/lib/audit-labels.test.mjs`
- `apps/web/src/shared/lib/audit-labels.ts`
- `apps/web/src/shared/lib/audit-page.test.mjs`
- `apps/web/src/shared/lib/session-monitor.test.mjs`
- `docker/prisma/migrations/20261104100000_business_audit/migration.sql`
- `docs/admin-security.md`
- `docs/business-audit-upgrade.md`
- `scripts/audit/archive.cjs`
