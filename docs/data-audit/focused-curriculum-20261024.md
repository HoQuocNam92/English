# Bộ nội dung ba ngành — 24/10/2026

## Bổ sung cấp Chuyên nghiệp — đã áp dụng

Sau yêu cầu bổ sung đủ bốn cấp, đã thêm 12 bài Chuyên nghiệp và 18 câu hỏi.
Bộ nội dung hiện có **48 bài theo chuỗi**: 3 ngành × 4 cấp × 4 bài;
96 lượt thuật ngữ theo ngữ cảnh và 72 câu hỏi có giải thích.

Ba bài luyện tập Chuyên nghiệp có sẵn được bổ sung mỗi bài sáu câu mới,
giữ nguyên ID bài luyện tập và snapshots của lượt làm trước. Cấp Chuyên nghiệp
không dùng bài kiểm tra đầu vào chung để xác nhận cấp độ, vì bộ chấm đầu vào
hiện chỉ định hướng tới Nâng cao. Lộ trình Chuyên nghiệp do seed tạo sẽ trỏ
đến bài luyện tập đúng cấp.

Đã kiểm tra QA, chạy lại không tạo trùng, kiểm tra production đủ 12 tổ hợp
ngành/cấp và ba bài luyện tập có liên kết đúng câu hỏi. Bổ sung 10 từ mới,
tái sử dụng 14 từ đã có. Tài khoản, tiến độ và lượt làm bài được giữ nguyên.
Ba kiểm thử cục bộ đều đạt. API công khai xác nhận số bài Chuyên nghiệp:
Cloud 6, Software 5, An toàn thông tin 6 (gồm bài cũ còn xuất bản).

Backup trước lần bổ sung:
`/home/ubuntu/techenglish-backups/20261024-before-professional-curriculum.dump`.
Báo cáo:
`20261024-professional-apply-report.json` và `20261024-professional-verification.json`
trong cùng thư mục backup trên server.

Nguồn khái niệm bổ sung:
[Parallel Change](https://martinfowler.com/bliki/ParallelChange.html),
[Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/),
[NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final).

Các phần dưới ghi nhận đợt bổ sung ba cấp ban đầu.

## Phạm vi theo yêu cầu

Chỉ thay dữ liệu; không sửa giao diện hay thuật toán tạo lộ trình của ứng dụng.
Ba nhóm có thể chọn: `CLOUD`, `SOFTWARE_ENG`, `CYBERSEC`.

Đã áp dụng trực tiếp lên production qua SSH sau kiểm thử trên database QA
cùng VPS. Không xuất nội dung production hoặc dữ liệu tài khoản về máy.

## Kết quả production

- Thêm 36 bài: 3 ngành × 3 trình độ × 4 bài.
- Mỗi cụm có thuật ngữ, đọc hiểu, đọc tài liệu và tình huống áp dụng.
- 72 lượt thuật ngữ theo ngữ cảnh; tái sử dụng từ hiện có, tạo thêm 33 từ mới.
- Thêm 54 câu có bốn lựa chọn, giải thích, đúng một đáp án; dùng trong ngân hàng
  kiểm tra trình độ, không thêm ô tự nhập câu trả lời vào bài học.
- Chuyển 31 bài hiện có về ngành chính, giữ nguyên ID.
- Lưu trữ 14 bài Dữ liệu/AI ngoài phạm vi đã chọn, không xóa bản ghi.
- Sửa 100 mục thuật ngữ cũ để reader đọc được định nghĩa song ngữ.
- Cập nhật 2 lộ trình đã lưu của hồ sơ mục tiêu từ vựng, giữ nguyên kết quả kiểm tra
  và trình độ. Không ghi đè lộ trình mục tiêu chứng chỉ/cả hai.
- Chuyển 16 lựa chọn ngành phụ sang ngành chính tương ứng.
- Giữ 25 từ có xung đột tên ở ngành đích, thêm phân loại phụ thay vì gộp/xóa ID.
- Kiểm tra bảo toàn số tài khoản, tiến độ và lượt thi đạt.

API công khai xác nhận số bài trung cấp sau sửa: Software 7, Cloud 11,
An toàn thông tin 8. Các số này bao gồm bài cũ còn xuất bản, không chỉ bài mới.

## Xác minh

`seed-focused-curriculum.test.cjs`: 2 kiểm thử đạt.
Kiểm tra toàn bộ chín cụm: mỗi cụm đủ bốn bài, mỗi bài liên kết đúng tám từ,
không có section `quiz` tự luận; 54 câu đều có đúng một đáp án.
Seed chạy lại nhiều lần trên QA và production không tạo thêm bài/từ/câu trùng.
API và web vẫn healthy sau cập nhật.

Backup và báo cáo tại VPS:

- `/home/ubuntu/techenglish-backups/20261024-before-focused-production-apply.dump`
- `/home/ubuntu/techenglish-backups/20261024-focused-apply-report.json`
- `/home/ubuntu/techenglish-backups/20261024-focused-rerun-report.json`
- `/home/ubuntu/techenglish-backups/20261024-focused-verification.json`

## Giới hạn cần giữ rõ

Đây là bộ nội dung bổ sung có cấu trúc, chưa phải tuyên bố hoàn thiện một khóa học
chuyên môn đầy đủ hoặc đánh giá CEFR chính thức. Hoàn thành bài đọc không tự nâng level.
Ngân hàng kiểm tra đo khả năng hiểu trong các ngữ cảnh đã biên soạn.

Lộ trình đã lưu được sắp xếp lại bằng seed. Thuật toán tạo lộ trình mới/tối ưu AI
hiện vẫn có giới hạn chọn năm mục và có thể chọn cấp thấp; yêu cầu lần này chỉ sửa
dữ liệu nên chưa thay thuật toán đó. Không hứa có nút tự động chuyển bài hoặc
gợi ý bài kế tiếp động. Người học đi theo thứ tự 01 → 04 trong Lộ trình, rồi ôn
flashcards và dùng Kiểm tra lại trình độ.

## Nguồn khái niệm

Tình huống và đoạn đọc được biên soạn riêng; nguồn kỹ thuật được ghi trong mỗi bài:

- [MDN: Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN: HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [MDN: Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)
- [Kubernetes: Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [OWASP: Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP: Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP: Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)
