import Link from 'next/link';

type DomainContent = { code: string; name: string; lessons: number; vocabularies: number; questions: number; exams: number; totalItems: number };
const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-orange-500', 'bg-sky-500', 'bg-fuchsia-500'];

export function ContentDistribution({ data, loading }: { data: DomainContent[]; loading: boolean }) {
  if (loading) return <p role="status" className="py-6 text-sm text-on-surface-variant">Đang tải học liệu...</p>;
  const total = data.reduce((sum, item) => sum + item.totalItems, 0);
  return <div className="mt-4 space-y-5">
    <p className="text-sm text-on-surface-variant">{data.length} chuyên ngành đang hoạt động · {total.toLocaleString('vi-VN')} học liệu trong kỳ</p>
    {!data.length && <p className="text-sm text-on-surface-variant">Chưa có chuyên ngành phù hợp với bộ lọc.</p>}
    {[...data].sort((a, b) => b.totalItems - a.totalItems).map((item, index) => {
      const percent = total > 0 ? item.totalItems / total * 100 : 0;
      return <div key={item.code}>
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold">{item.name}</span><span>{item.totalItems.toLocaleString('vi-VN')} · {percent.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%</span></div>
        <div role="img" aria-label={`${item.name}: ${item.totalItems} học liệu, ${percent.toFixed(1)}%`} className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${colors[index % colors.length]}`} style={{ width: `${percent}%` }} /></div>
        <p className="mt-2 text-xs leading-5 text-on-surface-variant">{item.lessons} bài học · {item.vocabularies} từ vựng · {item.questions} câu hỏi · {item.exams} đề thi</p>
      </div>;
    })}
    <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-outline-variant/40 pt-3 text-xs font-semibold text-primary">
      <Link href="/admin/domains">Quản lý chuyên ngành</Link><Link href="/admin/lessons">Quản lý bài học</Link><Link href="/admin/learning-content">Quản lý từ vựng</Link><Link href="/admin/questions">Quản lý câu hỏi</Link><Link href="/admin/tests">Quản lý đề thi</Link>
    </div>
  </div>;
}
