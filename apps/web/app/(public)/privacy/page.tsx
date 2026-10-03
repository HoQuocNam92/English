import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Chính sách bảo mật | TechEnglish Pro' };

const sections = [
  ['1. Thông tin được xử lý', 'Nền tảng xử lý thông tin tài khoản bạn cung cấp, như họ tên và email, cùng dữ liệu phát sinh khi học: bài học đã truy cập, tiến độ, câu trả lời và kết quả luyện tập. Những dữ liệu này giúp xác định tài khoản và ghi nhận quá trình học của bạn.'],
  ['2. Mục đích sử dụng', 'Thông tin được sử dụng để đăng nhập, quản lý tài khoản, cung cấp nội dung học, lưu kết quả và hiển thị tiến độ. Quản trị viên và giáo viên được phân quyền có thể sử dụng dữ liệu học tập để quản lý và hỗ trợ người học trong phạm vi nhiệm vụ của họ.'],
  ['3. Lưu trữ trên trình duyệt', 'Thông tin phiên đăng nhập được lưu trong localStorage hoặc sessionStorage tùy lựa chọn ghi nhớ đăng nhập. Một số tùy chọn giao diện cũng được lưu trên trình duyệt. Bạn có thể đăng xuất và xóa dữ liệu trang trong cài đặt trình duyệt; thao tác này không tự động xóa dữ liệu tài khoản đã lưu trên hệ thống.'],
  ['4. Quyền truy cập và dịch vụ liên quan', 'Dữ liệu tài khoản và học tập cần được truy cập theo quyền của người dùng, giáo viên và quản trị viên. Khi bạn sử dụng đăng nhập Google hoặc cho phép thông báo, dịch vụ tương ứng có thể xử lý thông tin cần thiết để thực hiện chức năng đó theo chính sách riêng của nhà cung cấp.'],
  ['5. Quản lý thông tin cá nhân', 'Bạn có thể xem và cập nhật các thông tin được hỗ trợ trong trang hồ sơ. Với yêu cầu sửa hoặc xóa dữ liệu ngoài các chức năng hiện có, hãy liên hệ quản trị viên đơn vị cung cấp tài khoản hoặc vận hành nền tảng để được xử lý.'],
  ['6. Bảo vệ tài khoản', 'Hãy dùng mật khẩu khó đoán, không chia sẻ thông tin đăng nhập và đăng xuất khi dùng thiết bị chung. Chỉ cho phép thông báo hoặc các quyền trình duyệt khi bạn có nhu cầu sử dụng tính năng tương ứng.'],
  ['7. Thay đổi chính sách', 'Chính sách này có thể được cập nhật khi cách xử lý dữ liệu hoặc tính năng thay đổi. Nội dung cập nhật được công bố tại trang này.'],
];

export default function PrivacyPage() {
  return (
    <article>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Thông tin &amp; chính sách</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-black">Chính sách bảo mật</h1>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant">Trang này giải thích các nhóm dữ liệu được sử dụng để vận hành tài khoản và hỗ trợ việc học trên TechEnglish Pro.</p>
      <div className="mt-10 space-y-8">
        {sections.map(([title, content]) => <section key={title}><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-on-surface-variant">{content}</p></section>)}
      </div>
    </article>
  );
}
