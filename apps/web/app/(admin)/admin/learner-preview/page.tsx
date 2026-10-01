import Link from 'next/link';
import { PageHeader } from '@/shared/ui';

const features = [
  ['home', 'Trang chủ cá nhân', 'Mục tiêu hôm nay, chứng chỉ mục tiêu và gợi ý học tập cá nhân hóa.'],
  ['menu_book', 'Học tiếng Anh CNTT', 'Từ vựng, thuật ngữ, đọc hiểu kỹ thuật, tài liệu API và System Design.'],
  ['work', 'Tình huống thực tế', 'Case study theo công việc và lĩnh vực CNTT quan tâm.'],
  ['quiz', 'Luyện tập và kiểm tra', 'Vocabulary, Reading, Technical Understanding và Scenario-based.'],
  ['workspace_premium', 'Luyện chứng chỉ', 'Học theo Domain, Topic, quiz và đề thi mô phỏng.'],
  ['monitoring', 'Theo dõi tiến độ', 'Mức độ hoàn thành, lịch sử bài thi và điểm theo chủ đề.'],
  ['person', 'Hồ sơ và mục tiêu', 'Trình độ, lĩnh vực, nghề nghiệp, chứng chỉ và kế hoạch học.'],
  ['auto_awesome', 'Gợi ý cá nhân hóa', 'Đề xuất nội dung dựa trên hồ sơ, mục tiêu và kết quả học tập.'],
];

export default function LearnerPreviewPage() {
  return <main className="flex-1 p-margin">
    <PageHeader title="Giao diện ứng dụng người học" description="Bản đồ đầy đủ các màn hình trên ứng dụng mobile dành cho học viên theo đề cương KLCN028." icon="phone_iphone" iconClassName="from-violet-500 to-indigo-600" />
    <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="rounded-[32px] border-[8px] border-slate-900 bg-slate-50 p-4 shadow-xl">
        <div className="mx-auto mb-5 h-5 w-28 rounded-full bg-slate-900" />
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-white/70">TechEnglish Pro</p><h2 className="mt-2 text-2xl font-black">Chào bạn 👋</h2><p className="mt-1 text-sm text-white/80">Tiếp tục lộ trình tiếng Anh CNTT hôm nay</p><div className="mt-5 rounded-2xl bg-white/15 p-4"><div className="flex justify-between text-xs"><span>Mục tiêu hôm nay</span><strong>6/10 từ</strong></div><div className="mt-2 h-2 rounded-full bg-white/20"><div className="h-2 w-3/5 rounded-full bg-white" /></div></div></div>
        <div className="mt-4 grid grid-cols-2 gap-3">{features.slice(1, 7).map(([icon,title]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-3"><span className="material-symbols-outlined text-primary">{icon}</span><p className="mt-2 text-xs font-bold">{title}</p></div>)}</div>
        <div className="mt-4 flex justify-around rounded-2xl bg-white p-3 text-primary shadow-sm">{['home','school','quiz','monitoring','person'].map(icon => <span key={icon} className="material-symbols-outlined">{icon}</span>)}</div>
      </section>
      <section><h2 className="text-xl font-black">Các chức năng người học đã có giao diện</h2><p className="mt-2 text-sm text-on-surface-variant">Ứng dụng người học là React Native/mobile, tách khỏi website quản trị. Các mục dưới đây tương ứng với các màn hình thực tế trong `apps/mobile`.</p><div className="mt-5 grid gap-4 md:grid-cols-2">{features.map(([icon,title,description]) => <article key={title} className="rounded-2xl border border-outline-variant bg-white p-5"><span className="material-symbols-outlined text-2xl text-primary">{icon}</span><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p></article>)}</div><div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5"><strong>Phân chia đúng theo đề cương:</strong><p className="mt-2 text-sm text-violet-900">Website hiện tại dành cho quản trị viên/giảng viên. Học viên sử dụng ứng dụng mobile; vì vậy menu web không thay thế thanh tab của ứng dụng người học.</p></div></section>
    </div>
  </main>;
}
