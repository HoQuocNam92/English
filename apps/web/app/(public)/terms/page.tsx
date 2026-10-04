import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Điều khoản sử dụng | TechEnglish Pro' };

import { termsSections as sections } from '../../../../../packages/shared-kernel/src/policies';

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
