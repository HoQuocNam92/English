// Context-specific senses reviewed against the existing reading passages.
const groups = [
  [/BA:|thanh toán/i, [
    ['checkout', 'Luồng hoàn tất đơn hàng và thanh toán của ứng dụng.'],
    ['user journey', 'Chuỗi bước người dùng thực hiện để đạt một mục tiêu trong sản phẩm.'],
    ['Business Analyst', 'Chuyên viên phân tích nghiệp vụ, làm rõ nhu cầu và yêu cầu phần mềm.'],
    ['Product Owner', 'Người chịu trách nhiệm định hướng giá trị và ưu tiên công việc của sản phẩm.'],
    ['edge case', 'Trường hợp ở ranh giới hoặc ít gặp cần được xét khi thiết kế và kiểm thử.'],
    ['backend duplicate protection', 'Cơ chế phía máy chủ ngăn một thao tác bị xử lý trùng.'],
  ]],
  [/cloud|đám mây|Region|Object,|Cloud|Cân bằng tải/i, [
    ['cloud computing', 'Cung cấp tài nguyên điện toán qua mạng theo nhu cầu sử dụng.'],
    ['total cost of ownership', 'Tổng chi phí sở hữu và vận hành trong suốt khoảng thời gian được xét.'],
    ['Pay-as-you-go', 'Mô hình trả phí dựa trên mức tài nguyên thực tế sử dụng.'],
    ['Right-sizing', 'Điều chỉnh loại và dung lượng tài nguyên theo nhu cầu đã đo.'],
    ['Edge location', 'Điểm hạ tầng gần người dùng để cung cấp nội dung hoặc dịch vụ.'],
    ['data residency', 'Yêu cầu về vị trí địa lý nơi dữ liệu được lưu hoặc xử lý.'],
    ['block storage', 'Lưu trữ dữ liệu theo các khối mà hệ điều hành có thể truy cập.'],
    ['file system', 'Cấu trúc tổ chức và truy cập dữ liệu dưới dạng tệp và thư mục.'],
    ['Amazon EFS', 'Dịch vụ hệ thống tệp được quản lý, dùng để chia sẻ tệp giữa các tài nguyên điện toán.'],
    ['rollout', 'Quá trình triển khai phiên bản hoặc thay đổi tới các thành phần đang chạy.'],
  ]],
  [/Danh tính|quyền truy cập|bảo vệ tài khoản/i, [
    ['authenticate', 'Xác thực danh tính của người dùng hoặc thành phần truy cập.'],
    ['authorized', 'Được cấp quyền thực hiện thao tác được yêu cầu.'],
  ]],
];
function supplements(title) {
  return groups.filter(([scope]) => scope.test(title)).flatMap(([, words]) => words.map(([term, definitionVi]) => ({ term, definitionVi, status: 'published', tags: ['reviewed-meaning'] })));
}
module.exports = { supplements };
