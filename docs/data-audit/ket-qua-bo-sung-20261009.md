# Kết quả bổ sung dữ liệu — 09/10/2026

## Đã áp dụng trong DB

- Thêm 96 từ mới; biên tập 36 từ có sẵn trong 132 mục nội dung của bộ bổ sung. Mỗi mục có định nghĩa Anh/Việt và ví dụ song ngữ riêng.
- Xuất bản 105 từ, 9 bài học và 72 câu hỏi bản nháp sau rà soát; sửa thêm hai bản dịch bio/commit rồi xuất bản.
- Thêm 33 bài học, 132 câu hỏi có lời giải từng lựa chọn và 33 bài luyện tập. Có 28 bộ chung cho 7 lĩnh vực × 4 trình độ và 5 bộ mở đầu theo chứng chỉ.
- Thay 57 nghĩa dẫn chiếu bằng định nghĩa đầy đủ; thêm ví dụ cho Hello, từ duy nhất thiếu ví dụ.
- Biên soạn lại lựa chọn và lời giải của 4 câu đang dùng trong hai đề thi. Giữ ID và vị trí chữ cái đáp án; đây là nội dung biên soạn lại, không phải phục hồi nguyên văn lựa chọn gốc.
- Thêm 623 lời giải phương án khớp chính xác tên thuật ngữ cùng lĩnh vực, dựa trên định nghĩa từ và lời giải câu hỏi đã lưu. Đây là bổ sung diễn giải, chưa phải thẩm định độc lập mọi đáp án của câu hỏi gốc.
- Thêm liên kết từ vựng vào bài học. Hiện mọi bài học đều có từ liên kết.
- GCP-ACE, AZURE-AZ900, CKA, COMPTIA-SECURITY-PLUS và AWS-DVA đã có thêm bộ mở đầu với bài học và bài luyện tập riêng. Các bộ bốn câu này không thay cho khóa ôn thi đầy đủ hay đề thi thử chính thức.
- Liên kết bài High Availability AWS SAA với bản ghi AWS-SAA-C03, giữ nguyên cả hai mã chứng chỉ.

## Độ phủ từ vựng đã xuất bản sau bổ sung

| Lĩnh vực | Sơ cấp | Trung cấp | Nâng cao | Chuyên nghiệp |
|---|---:|---:|---:|---:|
| SOFTWARE_ENG | 4 | 902 | 6 | 4 |
| CLOUD | 10 | 924 | 7 | 4 |
| NETWORKING | 11 | 558 | 14 | 4 |
| CYBERSEC | 6 | 10 | 6 | 4 |
| DEVOPS | 6 | 179 | 7 | 4 |
| DATA_ENG | 10 | 12 | 16 | 4 |
| DATA_SCI | 12 | 10 | 14 | 4 |

Bốn lĩnh vực AWS_CLF_C02_D1–D4 là các phần kiến thức của chứng chỉ nền tảng, không phải bốn lĩnh vực nghề nghiệp độc lập; không nhân bản chúng sang mọi trình độ chỉ để lấp ô thống kê.

## Tổng số hiện tại

- Từ vựng: 2790 (đều đã xuất bản).
- Câu hỏi: 1370 (đều đã xuất bản; xem lỗi còn lại bên dưới).
- Bài học: 67 (đều đã xuất bản).
- Đề/bài luyện tập: 92 (89 đã xuất bản, 3 bản nháp).

## Chưa khắc phục hết

- 156 câu trắc nghiệm cũ còn thiếu toàn bộ lựa chọn. Không có bản gốc tương ứng trong nguồn nội dung tìm được; chỉ lời giải nhắc chữ A/B/C/D không đủ phục hồi chính xác. Chúng chưa liên kết với đề hiện tại. Không xóa hay đổi trạng thái để che số liệu.
- 737 câu còn thiếu lời giải cho ít nhất một lựa chọn. Cần biên tập theo nội dung từng câu; không dùng một câu mẫu chung để làm cho cột hết rỗng.
- 667 lời giải ngân hàng câu hỏi dài dưới 80 ký tự cần rà soát. Độ dài là dấu hiệu kiểm tra, không phải tiêu chí đúng/sai.
- 899 ví dụ mẫu ban đầu chưa được biên tập lại toàn bộ. Các mục được viết lại trong bộ bổ sung đã có ví dụ cụ thể; số ví dụ mẫu còn lại được thống kê phía dưới.
- 239 từ chưa có IPA; toàn bộ 2.790 từ chưa lưu file audioUrl. Không tạo phiên âm hoặc đường dẫn giả. Website có đọc bằng giọng trình duyệt, cần phân biệt với file thu âm lưu trong DB.
- 2.427 từ chưa gắn bài hoặc chủ đề; vẫn có thể học theo lĩnh vực. Chỉ gắn từ có liên hệ nội dung thực, không gắn cả kho từ vào một bài để làm đẹp số liệu.
- Chứng chỉ A2 còn chưa có bài học liên kết. Hai chủ đề Imported content và Ok thuộc A2 còn thiếu dữ liệu; chưa tự suy diễn phạm vi cho các mục chưa rõ mục đích này.

## Thay đổi trải nghiệm giải thích

API quiz ưu tiên nghĩa DB đã được đánh dấu reviewed-meaning, tránh bị nghĩa cũ trong mã nguồn ghi đè. Lời giải hiện có định nghĩa đầy đủ, ví dụ Anh/Việt và đối chiếu nghĩa của phương án đã chọn. Web được chỉnh để giữ xuống dòng. Mobile dùng cùng API và đã có phần hiển thị optionExplanations nên nhận dữ liệu/lời giải mới nếu kết nối DB/API này.

## Kiểm tra và khả năng chạy lại

- Kiểm tra kiểu mã API thành công; kiểm thử dịch vụ học từ vựng thành công, có ca kiểm tra nghĩa DB ưu tiên và lời giải song ngữ.
- API docs trả HTTP 200; kiểm tra CORS qua domain công khai trả HTTP 204 với đúng origin.
- Mỗi ô trong 28 ô lĩnh vực/trình độ có ít nhất bốn từ, một bài học và một bài luyện tập của bộ mới. Mỗi câu mới có bốn phương án, một đáp án đúng và lời giải không rỗng.
- Không có bài học thiếu phần nội dung hoặc thiếu liên kết từ; không có đề thiếu câu hỏi; không có đề xuất bản liên kết câu hỏi chưa xuất bản.
- Dữ liệu học viên và lịch sử học không bị xóa. Bản sao nội dung trước thay đổi nằm trong backups/.
- Bộ bổ sung chính được lưu tại apps/api/prisma/data/coverage-expansion-20261009.txt; chương trình seed-coverage-expansion.cjs chạy thử mặc định, chỉ ghi với --apply. Dùng slug và thẻ định danh để tránh tạo lặp bài/câu hỏi/đề khi chạy lại.
- Đây là bổ sung nền tảng có kiểm kê, chưa phải xác nhận toàn bộ kho kiến thức đã đầy đủ hoặc chính xác về nội dung.

## Nguồn kiểm tra đối chiếu

- [AWS Glossary](https://docs.aws.amazon.com/glossary/latest/reference/glos-chap.html)
- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
- [Apache Airflow Core Concepts](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/)
- [scikit-learn Common Pitfalls](https://scikit-learn.org/stable/common_pitfalls.html)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Azure Resource Manager](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview)
- [Google Cloud IAM](https://docs.cloud.google.com/iam/docs/overview)

Định nghĩa và ví dụ bổ sung được biên soạn cho nền tảng học; không sao chép nguyên văn đề thi chứng chỉ.

Số từ vẫn có ít nhất một ví dụ dạng mẫu được dò ở trên: **898**.
