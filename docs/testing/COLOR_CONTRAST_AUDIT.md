# Kiểm tra tương phản màu — web và mobile

Ngày: 2026-09-30. Phạm vi: các cặp màu đặc lấy từ mã nguồn light theme và hai màu trong URL. Không phải chứng nhận toàn bộ giao diện đạt WCAG. Chưa đo computed style từng màn, opacity, gradient, ảnh nền, hover/focus hoặc dark theme.

Nguồn mã: apps/web/app/globals.css; packages/design-tokens/src/colors.ts; apps/mobile/src/shared/store/theme-context.tsx; apps/mobile/app/flashcards/index.tsx; apps/mobile/app/(tabs)/_layout.tsx.

WCAG AA: chữ thường ≥4.5:1, chữ lớn ≥3:1. Chữ lớn: từ 24 CSS px thường hoặc 18.67 CSS px đậm; cần kiểm kích thước render thực tế trên native. Kết luận dùng tỷ lệ chưa làm tròn.

Nguồn: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

Không truy cập được công cụ imagecolorpicker qua trình duyệt web tool; tỷ lệ bên dưới được tính độc lập bằng công thức luminance WCAG, không phải kết quả lấy từ website đó.

| Vị trí | Chữ | Nền | Tỷ lệ | AA chữ thường | AA chữ lớn |
|---|---|---|---:|---|---|
| Cặp màu trong URL người dùng | `#0b202e` | `#2596be` | 4.91:1 | Đạt | Đạt |
| Web/mobile: chữ chính trên nền trang | `#191c1e` | `#f7f9fb` | 16.23:1 | Đạt | Đạt |
| Web/mobile: chữ phụ trên nền trắng | `#464555` | `#ffffff` | 9.36:1 | Đạt | Đạt |
| Web/mobile: chữ trắng trên nút primary | `#ffffff` | `#3525cd` | 9.14:1 | Đạt | Đạt |
| Web: on-primary-container/primary-container | `#dad7ff` | `#4f46e5` | 4.53:1 | Đạt | Đạt |
| Mobile: onPrimaryContainer/primaryContainer | `#02006d` | `#e0e0ff` | 13.30:1 | Đạt | Đạt |
| Mobile: nhãn tab chưa chọn/placeholder trên trắng | `#6b687b` | `#ffffff` | 5.40:1 | Đạt | Đạt |
| Web: muted-foreground trên trắng | `#64748b` | `#ffffff` | 4.76:1 | Đạt | Đạt |
| Mobile flashcards: chữ kết quả đúng trên surface | `#15803d` | `#f7f9fb` | 4.75:1 | Đạt | Đạt |
| Mobile flashcards: chữ kết quả sai trên surface | `#b91c1c` | `#f7f9fb` | 6.13:1 | Đạt | Đạt |
| Đề xuất chữ kết quả đúng | `#15803d` | `#f7f9fb` | 4.75:1 | Đạt | Đạt |
| Đề xuất chữ kết quả sai | `#b91c1c` | `#f7f9fb` | 6.13:1 | Đạt | Đạt |

## Nhận xét

- Đã sửa màu chữ kết quả đúng/sai trên mobile và màu outline dùng cho nhãn/placeholder. Các cặp đã sửa đều đạt AA chữ thường; chưa khẳng định toàn bộ UI đạt chuẩn.
- Cùng tên primaryContainer nhưng web/shared tokens và mobile theme đang dùng nền khác nhau; cả hai cặp phải kiểm độc lập. Khác màu không tự động có nghĩa không đạt tương phản.
- Chữ có opacity phải pha với nền thực tế trước khi tính; không áp dụng kết quả màu đặc cho nhãn opacity-60/65 trong thẻ chuyên đề.
- Muốn đánh giá toàn hệ thống, tiếp tục đo từng màn admin/learner/native ở trạng thái thường, chọn, lỗi, focus; kiểm riêng icon và viền điều khiển theo tiêu chí non-text contrast.
