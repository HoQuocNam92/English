> Báo cáo này ghi nhận **trước khi bổ sung**. Xem [kết quả sau bổ sung](ket-qua-bo-sung-20261009.md) để có số liệu hiện tại.

# Kiểm tra dữ liệu học tập — 09/10/2026

## Phạm vi và giới hạn
Đã đếm dữ liệu của toàn bộ 43 bảng public; đọc toàn bộ nội dung từ vựng, ví dụ, câu hỏi, lựa chọn, bài học, phần bài học, đề thi, chứng chỉ và chủ đề trong DB cấu hình tại apps/api/.env. Giao dịch chỉ đọc; không sửa DB. Không đọc nội dung tài khoản, mật khẩu hoặc token để lập báo cáo.

Đây là kiểm tra độ đầy đủ, cấu trúc và một số dấu hiệu chất lượng. Chưa thẩm định từng phát biểu kỹ thuật trong 2.694 từ và 1.238 câu hỏi với tài liệu chính thức; không thể kết luận tất cả đáp án còn lại đều chính xác. Các số liệu là ảnh chụp tại thời điểm kiểm tra, gồm bản nháp khi có ghi rõ.

## Tổng quan
| Nội dung | Tổng | Đã xuất bản | Bản nháp |
|---|---:|---:|---:|
| Từ vựng | 2.694 | 2.587 | 107 |
| Câu hỏi | 1.238 | 1.166 | 72 |
| Bài học | 34 | 25 | 9 |
| Đề thi | 59 | 56 | 3 |

Có 9 chứng chỉ, 21 chủ đề, 2.696 câu ví dụ, 4.478 lựa chọn trả lời và 236 phần bài học.

## Vấn đề cần sửa trước
1. **160 câu trắc nghiệm đã xuất bản không có bất kỳ lựa chọn trả lời nào.** Có lời giải nhắc đến đáp án B/D nhưng không lưu các phương án tương ứng. Đây là thiếu dữ liệu thực, không chỉ thiếu diễn giải. Hai đề đã xuất bản có liên kết tới 4 câu thuộc nhóm này:
   - AWS SAA Mock Exam — High Availability & Networking: 3/5 câu thiếu lựa chọn.
   - Bài tập tình huống thực tế cho chuyên viên IT: 1/5 câu thiếu lựa chọn.
   Cần khôi phục phương án từ nguồn nhập, xác nhận đáp án rồi mới sử dụng. Không nên tự suy ra toàn bộ lựa chọn chỉ từ một dòng lời giải.
2. **833 câu đã xuất bản thiếu giải thích cho ít nhất một lựa chọn.** Người học có thể biết đáp án đúng nhưng không biết đáp án mình chọn sai ở đâu. Cần bổ sung lý do đúng/sai theo từng phương án, gắn với tình huống của câu hỏi.
3. **654 câu đã xuất bản có lời giải dưới 80 ký tự** (667 tính cả bản nháp). Đây là dấu hiệu cần đọc lại, không phải kết luận tự động rằng mọi lời giải ngắn đều sai. Nên giải thích khái niệm, căn cứ chọn và một ví dụ hoặc đối chiếu.
4. **57 từ đã xuất bản có nghĩa tiếng Việt bắt đầu bằng “Xem/See”.** Ví dụ: function → “Xem chức năng nội tại.”; ETL → “Xem trích xuất, chuyển đổi và tải (ETL).”. Cột không rỗng nhưng chưa phải định nghĩa có thể học độc lập. Cần viết nghĩa đầy đủ hoặc liên kết rõ tới mục được dẫn chiếu.
5. **899 từ đã xuất bản có ví dụ dạng mẫu** “The cloud/network/software team reviewed …”. Mẫu này có thể đúng ngữ pháp nhưng thường không giúp hiểu công dụng của thuật ngữ. Đây là số phát hiện bằng mẫu cụ thể, không phải tổng số ví dụ kém chất lượng.

## Thiếu dữ liệu bổ trợ và liên kết
- 1 từ đã xuất bản không có ví dụ: **Hello**; cần kiểm tra đây có phải dữ liệu thử nghiệm hay không.
- 38 từ đã xuất bản thiếu IPA; tính cả bản nháp là 143.
- Cả 2.694 từ chưa có audioUrl. Website có đường đọc bằng giọng của trình duyệt, nên thiếu file âm thanh không đồng nghĩa nút nghe chắc chắn hỏng.
- 25/25 bài học đã xuất bản không có liên kết trong bảng lesson_vocabularies. Không đồng nghĩa bài học không chứa từ trong nội dung, nhưng tính năng lấy từ theo bài sẽ không lấy được qua bảng nối này.
- 2.547/2.587 từ đã xuất bản chưa gắn với bài học hoặc chủ đề chứng chỉ (2.549 tính cả bản nháp). Chúng vẫn có thể học theo lĩnh vực; thiếu liên kết làm lộ trình theo bài/chủ đề nghèo dữ liệu.
- 2 chủ đề “Imported content” và “Ok” không có từ và bài học; “Ok” cũng không có câu hỏi. Cần kiểm tra dữ liệu nhập/thử nghiệm.

## Độ phủ chứng chỉ
| Mã chứng chỉ | Bài học liên kết | Đề thi liên kết |
| AWS-SAA | 2 | 1 |
| AWS-CLF-C02 | 19 | 43 |
| AWS-DVA | 1 | 0 |
| GCP-ACE | 0 | 0 |
| AZURE-AZ900 | 0 | 0 |
| CKA | 0 | 0 |
| A2 | 0 | 6 |
| AWS-SAA-C03 | 0 | 5 |
| COMPTIA-SECURITY-PLUS | 0 | 0 |

Các số trên gồm mọi trạng thái. GCP-ACE, AZURE-AZ900, CKA và COMPTIA-SECURITY-PLUS chưa có bài học lẫn đề thi liên kết. AWS-DVA có bài học nhưng chưa có đề thi. AWS-SAA và AWS-SAA-C03 là hai bản ghi riêng; cần xem có chủ đích tách phiên bản hay cần gom liên kết để tránh chia dữ liệu.

## Vì sao màn hình trong ảnh khó hiểu?
Phần kiểm tra từ vựng được tạo trực tiếp từ bảng từ, không lấy lời giải từ ngân hàng câu hỏi. Máy chủ hiện tạo lời giải đúng bằng cách lặp lại nghĩa; lời giải sai chỉ nói “Bạn chọn nghĩa của X, không phải Y”. Ví dụ được tải từ DB nhưng không đưa vào lời giải câu trắc nghiệm. Vì vậy, bổ sung question_options.explanation sẽ cải thiện đề thi nhưng chưa tự cải thiện màn hình trong ảnh.

DB hiện có definitionEn, definitionVi và ví dụ; chưa có trường riêng cho diễn giải dễ hiểu, lỗi nhầm thường gặp hoặc đối chiếu khái niệm trong Vocabulary. Một số nghĩa quiz còn được lấy từ tập nội dung ghi trong mã nguồn (quiz-meanings.ts), ưu tiên trước definitionVi. Sửa nghĩa trong DB chưa chắc đổi đáp án trên quiz nếu còn bản ghi ưu tiên đó.

Với “cache engine version”, DB có nghĩa “Phiên bản của dịch vụ Memcached đang chạy trên nút bộ đệm.” và ví dụ khá chung chung “The cloud team reviewed cache engine version before deploying the workload.”; bản dịch dùng “phiên bản công cụ bộ đệm” khác với định nghĩa, khiến người học khó nối ý. “orchestration” còn trộn nhiều từ tiếng Anh vào nghĩa và bản dịch.

Cách trình bày nên hướng tới: nêu thuật ngữ chỉ điều gì bằng tiếng Việt dễ hiểu; đưa ví dụ cụ thể; sau đó giải thích đáp án đã chọn đang nói về khái niệm nào và khác đáp án đúng ở điểm nào. Cần kết hợp biên tập dữ liệu với sửa cách tạo/hiển thị lời giải; chỉ thêm số lượng từ sẽ không giải quyết vấn đề.

## Những kiểm tra chưa thấy thiếu
Không có từ rỗng nghĩa Anh/Việt hoặc thiếu loại từ theo trường hiện có. Các ví dụ hiện có đều có bản dịch không rỗng. Không có câu hỏi rỗng lời giải, bài học không có phần nội dung, đề thi không có câu hỏi, hoặc đề xuất bản liên kết tới câu hỏi chưa xuất bản. Điều này chỉ xác nhận có dữ liệu, chưa xác nhận nội dung hay và đúng.

Các bảng learner_groups, learner_group_members, saved_questions hiện rỗng. Đây là dữ liệu phát sinh do sử dụng tính năng; chưa đủ căn cứ xem là thiếu dữ liệu nền.

## Thứ tự xử lý đề xuất
1. Khôi phục lựa chọn và xác nhận đáp án của 160 câu lỗi; kiểm tra hai đề bị ảnh hưởng trước.
2. Sửa phần lời giải quiz để tận dụng định nghĩa và ví dụ đã có, bổ sung đối chiếu rõ ràng.
3. Biên tập 57 nghĩa dẫn chiếu, 899 ví dụ mẫu và các giải thích thiếu/ngắn; ưu tiên nội dung đang xuất bản.
4. Gắn từ vào bài/chủ đề, bổ sung các chứng chỉ còn trống, rà soát dữ liệu thử nghiệm và bản ghi chứng chỉ có thể trùng.

Danh sách ID và nhãn nội dung từng mục nằm trong missing-data.csv; audit-results.json chứa thống kê và phân bố. Một bản ghi có thể thuộc nhiều nhóm, nên không cộng các nhóm để suy ra tổng số nội dung lỗi.
