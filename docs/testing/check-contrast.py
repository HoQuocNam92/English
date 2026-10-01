"""Run: python3 docs/testing/check-contrast.py. Static opaque color pairs, not a full UI audit."""
from pathlib import Path

def luminance(color):
    rgb = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
    return sum(v * w for v, w in zip(linear, [.2126, .7152, .0722]))

def contrast(a, b):
    light, dark = sorted([luminance(a), luminance(b)], reverse=True)
    return (light + .05) / (dark + .05)

pairs = [
    ('Cặp màu trong URL người dùng', '#0b202e', '#2596be'),
    ('Web/mobile: chữ chính trên nền trang', '#191c1e', '#f7f9fb'),
    ('Web/mobile: chữ phụ trên nền trắng', '#464555', '#ffffff'),
    ('Web/mobile: chữ trắng trên nút primary', '#ffffff', '#3525cd'),
    ('Web: on-primary-container/primary-container', '#dad7ff', '#4f46e5'),
    ('Mobile: onPrimaryContainer/primaryContainer', '#02006d', '#e0e0ff'),
    ('Mobile: nhãn tab chưa chọn/placeholder trên trắng', '#6b687b', '#ffffff'),
    ('Web: muted-foreground trên trắng', '#64748b', '#ffffff'),
    ('Mobile flashcards: chữ kết quả đúng trên surface', '#15803d', '#f7f9fb'),
    ('Mobile flashcards: chữ kết quả sai trên surface', '#b91c1c', '#f7f9fb'),
    ('Đề xuất chữ kết quả đúng', '#15803d', '#f7f9fb'),
    ('Đề xuất chữ kết quả sai', '#b91c1c', '#f7f9fb'),
]
assert contrast('#000000', '#ffffff') == 21
assert contrast('#ffffff', '#ffffff') == 1
lines = ['# Kiểm tra tương phản màu — web và mobile', '',
    'Ngày: 2026-09-30. Phạm vi: các cặp màu đặc lấy từ mã nguồn light theme và hai màu trong URL. Không phải chứng nhận toàn bộ giao diện đạt WCAG. Chưa đo computed style từng màn, opacity, gradient, ảnh nền, hover/focus hoặc dark theme.', '',
    'Nguồn mã: apps/web/app/globals.css; packages/design-tokens/src/colors.ts; apps/mobile/src/shared/store/theme-context.tsx; apps/mobile/app/flashcards/index.tsx; apps/mobile/app/(tabs)/_layout.tsx.', '',
    'WCAG AA: chữ thường ≥4.5:1, chữ lớn ≥3:1. Chữ lớn: từ 24 CSS px thường hoặc 18.67 CSS px đậm; cần kiểm kích thước render thực tế trên native. Kết luận dùng tỷ lệ chưa làm tròn.', '',
    'Nguồn: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html', '',
    'Không truy cập được công cụ imagecolorpicker qua trình duyệt web tool; tỷ lệ bên dưới được tính độc lập bằng công thức luminance WCAG, không phải kết quả lấy từ website đó.', '',
    '| Vị trí | Chữ | Nền | Tỷ lệ | AA chữ thường | AA chữ lớn |',
    '|---|---|---|---:|---|---|']
for label,fg,bg in pairs:
    ratio = contrast(fg,bg)
    lines.append(f'| {label} | `{fg}` | `{bg}` | {ratio:.2f}:1 | {"Đạt" if ratio >= 4.5 else "Không đạt"} | {"Đạt" if ratio >= 3 else "Không đạt"} |')
lines += ['', '## Nhận xét', '',
    '- Đã sửa màu chữ kết quả đúng/sai trên mobile và màu outline dùng cho nhãn/placeholder. Các cặp đã sửa đều đạt AA chữ thường; chưa khẳng định toàn bộ UI đạt chuẩn.',
    '- Cùng tên primaryContainer nhưng web/shared tokens và mobile theme đang dùng nền khác nhau; cả hai cặp phải kiểm độc lập. Khác màu không tự động có nghĩa không đạt tương phản.',
    '- Chữ có opacity phải pha với nền thực tế trước khi tính; không áp dụng kết quả màu đặc cho nhãn opacity-60/65 trong thẻ chuyên đề.',
    '- Muốn đánh giá toàn hệ thống, tiếp tục đo từng màn admin/learner/native ở trạng thái thường, chọn, lỗi, focus; kiểm riêng icon và viền điều khiển theo tiêu chí non-text contrast.', '']
Path(__file__).with_name('COLOR_CONTRAST_AUDIT.md').write_text('\n'.join(lines), encoding='utf-8')
print('\n'.join(lines[12:]))
