import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Điều khoản sử dụng | TechEnglish Pro' };

const sections = [
  ['1. Phạm vi sử dụng', 'TechEnglish Pro cung cấp bài học, từ vựng và hoạt động luyện tập tiếng Anh chuyên ngành CNTT. Khi sử dụng nền tảng, bạn cần tuân thủ các điều khoản dưới đây và sử dụng dịch vụ cho mục đích học tập hợp lệ.'],
  ['2. Tài khoản và trách nhiệm của bạn', 'Bạn cần cung cấp thông tin tài khoản chính xác, bảo vệ thông tin đăng nhập và chịu trách nhiệm về hoạt động trên tài khoản của mình. Không sử dụng tài khoản của người khác hoặc chia sẻ quyền truy cập trái phép. Nếu phát hiện tài khoản bị truy cập bất thường, hãy đổi mật khẩu và thông báo cho quản trị viên nền tảng.'],
  ['3. Nội dung học tập', 'Nội dung trên nền tảng được cung cấp để hỗ trợ học tập. Bạn có thể sử dụng nội dung trong phạm vi các chức năng được cho phép. Không sao chép, phân phối hoặc khai thác thương mại tài liệu khi chưa có sự cho phép của chủ sở hữu quyền tương ứng.'],
  ['4. Hành vi không được phép', 'Không can thiệp vào hệ thống, tìm cách truy cập dữ liệu của người khác, phát tán mã độc, gian lận kết quả học tập hoặc đăng tải nội dung vi phạm quyền của người khác. Quyền truy cập có thể bị hạn chế khi có hành vi lạm dụng hoặc ảnh hưởng đến an toàn của nền tảng.'],
  ['5. Kết quả học tập và hoạt động dịch vụ', 'Kết quả bài tập và đánh giá trên nền tảng phục vụ việc theo dõi học tập; chúng không thay thế chứng chỉ do tổ chức khảo thí cấp. Hiệu quả học phụ thuộc vào trình độ và quá trình luyện tập của mỗi người. Nền tảng có thể cần bảo trì hoặc cập nhật, gây gián đoạn truy cập tạm thời.'],
  ['6. Cập nhật điều khoản', 'Các điều khoản có thể được cập nhật khi tính năng hoặc cách vận hành thay đổi. Phiên bản mới sẽ được đăng trên trang này để bạn có thể xem lại trước khi tiếp tục sử dụng dịch vụ.'],
];

export default function TermsPage() {
  return (
    <article>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Thông tin &amp; chính sách</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-black">Điều khoản sử dụng</h1>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant">Vui lòng đọc các điều khoản để hiểu quyền và trách nhiệm khi sử dụng TechEnglish Pro.</p>
      <div className="mt-10 space-y-8">
        {sections.map(([title, content]) => <section key={title}><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-on-surface-variant">{content}</p></section>)}
      </div>
    </article>
  );
}
