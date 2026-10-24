# Kiểm tra chữ đầu nội dung học — 24/10/2026

Đã chạy audit và cập nhật database production qua SSH bằng
`scripts/audit-content-capitalization.cjs --apply`.

- Đã sửa 1.205 bản ghi: 44 bài học, 109 mục nội dung, 1.052 từ vựng.
- Audit sau sửa: không còn thay đổi tự động an toàn trong phạm vi trường được kiểm tra.
- Bảy từ trùng trong cùng chuyên ngành khi viết hoa được giữ nguyên ID và quan hệ:
  packet, variable, function, router, switch, parameter, namespace.
  Bản ghi tương ứng dạng viết hoa đã tồn tại; không gộp hoặc xóa tiến độ học.
- Nội dung thuật ngữ trong lesson sections và key concepts đã được viết hoa độc lập.
- Không sửa code, URL, HTML, tên biến camelCase, slug, mã định danh hoặc đoạn văn
  có thể chứa code. Đây là audit trường hiển thị được cho phép, không phải kiểm duyệt
  toàn bộ văn bản tự do trong database.

Backup tại server:
`/home/ubuntu/techenglish-backups/20261024-before-capitalization.dump`.
Nhật ký giá trị trước và sau sửa:
`/home/ubuntu/techenglish-backups/20261024-capitalization-changes.json`.

Lần áp dụng đầu tiên đã rollback toàn bộ do ràng buộc unique của từ vựng;
lần chạy thành công đã bỏ qua thay đổi tên gây trùng. Không xóa bản ghi.

Migration đi kèm cho cả hai lịch sử Prisma áp dụng cùng phạm vi trường hiển thị
và bỏ qua tên từ vựng gây trùng, để bản triển khai sau giữ được quy tắc này.
