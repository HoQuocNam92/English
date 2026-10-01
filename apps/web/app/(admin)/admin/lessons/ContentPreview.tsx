import { CONTENT_TYPES } from '@/shared/lib/admin-content-types';

export type ContentPreviewItem = {
  title: string; summary: string; type: string; keyConcepts?: string[];
  estimatedMinutes: number; domain?: { name: string }; level?: { name: string };
  _count?: { sections: number };
};

export function ContentPreview({ item }: { item: ContentPreviewItem }) {
  const category = CONTENT_TYPES[item.type];
  const concepts = item.keyConcepts ?? [];
  const tags = <div className="mt-3 flex flex-wrap gap-2">{concepts.map((word, index) => <span key={`${index}-${word}`} className="rounded-lg bg-surface-container-low px-3 py-1.5 text-sm text-on-surface">{word}</span>)}{!concepts.length && <p className="text-sm text-on-surface-variant">Chưa bổ sung {category?.conceptsLabel.toLocaleLowerCase('vi') ?? 'khái niệm'}.</p>}</div>;
  const title = <h2 className="text-lg font-bold text-on-surface">{item.title}</h2>;
  const summary = <p className="mt-2 whitespace-pre-line text-sm leading-6 text-on-surface-variant">{item.summary}</p>;
  const label = (text: string) => <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{text}</h3>;

  if (item.type === 'terminology') return <div>{title}{summary}<div className="mt-5 border-t border-outline-variant/40 pt-4">{label('Thuật ngữ trọng tâm')}{tags}</div></div>;
  if (item.type === 'technical_reading') return <div className="grid gap-5 md:grid-cols-[1fr_180px]"><div className="border-l-4 border-blue-700 pl-4">{title}<div className="mt-4">{label('Mục tiêu đọc hiểu')}{summary}</div></div><aside className="rounded-xl bg-blue-50 p-4">{label('Từ khóa tài liệu')}{tags}</aside></div>;
  if (item.type === 'api_documentation') return <div><div className="flex items-start gap-3"><span className="material-symbols-outlined text-violet-700">api</span>{title}</div><div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">{label('Mục đích API')}{summary}</div><div className="mt-4 font-mono">{label('Endpoint, phương thức và khái niệm')}{tags}</div></div>;
  if (item.type === 'system_design') return <div>{title}<div className="mt-5 grid gap-4 md:grid-cols-2"><section className="rounded-xl bg-indigo-50 p-4">{label('Bối cảnh và mục tiêu hệ thống')}{summary}</section><section className="rounded-xl border border-indigo-200 p-4">{label('Thành phần và tiêu chí thiết kế')}{tags}</section></div></div>;
  if (item.type === 'case_study') return <div className="grid gap-5 md:grid-cols-[160px_1fr]"><aside className="rounded-xl bg-amber-50 p-4"><span className="material-symbols-outlined mb-3 text-amber-800">work</span>{label('Hồ sơ tình huống')}<p className="mt-3 text-sm text-amber-900">{item.domain?.name ?? 'Chưa có lĩnh vực'}</p></aside><div>{title}<div className="mt-4">{label('Vấn đề cần giải quyết')}{summary}</div><div className="mt-4">{label('Kỹ năng áp dụng')}{tags}</div></div></div>;
  return <div>{title}{summary}{tags}</div>;
}
