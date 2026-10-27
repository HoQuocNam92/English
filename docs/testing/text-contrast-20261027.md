# Kiểm tra độ tương phản chữ — 27/10/2026

Ngưỡng theo yêu cầu: chỉ sửa cặp chữ/nền dưới **4:1**, giữ nguyên các cặp từ 4:1 trở lên. Đối chiếu công cụ: https://imagecolorpicker.com/color-contrast-checker/0b202e-2596be (cặp mẫu đạt 4,91:1).

## Thay đổi

Rà mã giao diện web và mobile theo theme sáng đang sử dụng. Tính độ chói tương đối sRGB và tỷ lệ `(L_sáng + 0.05) / (L_tối + 0.05)`; ghép màu alpha với nền trước khi tính. Với nút bị vô hiệu hóa, tính cả độ mờ của nền nút và chữ trên nền phía sau.

| Cặp trên nền trắng | Trước | Sau |
| --- | ---: | ---: |
| Web: chữ slate-400 → slate-500 | 2,63 | 4,76 |
| Web: chữ green-600 → green-700 | 3,22 | 4,94 |
| Web: chữ emerald-600 → emerald-700 | 3,67 | 5,37 |
| Web: chữ amber-600 → amber-700 | 3,19 | 5,05 |
| Mobile: lỗi #ef4444 → #dc2626 | 3,76 | 4,83 |
| Mobile: thành công #16a34a → #15803d | 3,30 | 5,02 |

Các nút nền xanh/cam dùng chữ trắng được làm đậm nền tương ứng. Các nhãn disabled thiếu tương phản được giảm mức làm mờ; trạng thái disabled và xử lý sự kiện vẫn giữ nguyên. Các biến thể Button có mức opacity riêng để giữ nguyên biến thể outline/secondary đã đạt ngưỡng. Chữ xám mô tả bài học chỉ đổi màu khi bài đang được chọn; màu ở trạng thái thường được giữ nguyên.

Giữ nguyên bảng màu chủ đạo và các cặp semantic đã đạt: primary/onPrimary, secondary/onSecondary, tertiary/onTertiary, error/onError và các cặp container tương ứng. Trên mobile, giữ màu biểu tượng flashcard và màu của các nhãn Khó/Đã biết đã đạt.

## Kiểm tra ngữ cảnh

- Đã đối chiếu trực tiếp màu `#62748e` / `#ffffff` trên công cụ được yêu cầu: **4,76:1**.
- Nền gradient violet-600 → indigo-700: nhãn trắng 70% chưa đạt ở đầu violet; tăng riêng nhãn này lên 80%. Các chữ trắng 80% sẵn có được giữ nguyên.
- Các nhãn biểu đồ nằm ngoài thanh màu, nhãn được định nghĩa trước khi đặt vào nút, và các tổ hợp nhánh điều kiện không thể xảy ra được kiểm tra theo ngữ cảnh thực tế, tránh sửa nhầm cặp đã đạt.
- Chữ trên màn hình native dùng màu thực tế từ `useTheme`, bao gồm nền primaryContainer sáng, thay vì nhầm với token container khác trong package thiết kế.

Rà tĩnh hỗ trợ tìm lỗi trong JSX/StyleSheet, không thay thế việc kiểm tra mọi màn hình với mọi bộ dữ liệu động hoặc thiết bị native.

## Xác minh

- TypeScript web và mobile: đạt.
- Kiểm thử hiện có: web **18/18**, mobile **26/26**.
- Build production Next.js: đạt, tạo đủ **57** trang tĩnh.
