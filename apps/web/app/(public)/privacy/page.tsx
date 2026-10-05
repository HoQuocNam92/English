import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Chính sách bảo mật | TechEnglish Pro' };

import { privacySections as sections } from '../../../../../packages/shared-kernel/src/policies';

export default function PrivacyPage() {
  return (
    <article><Link href="/landing" className="mb-6 inline-flex text-sm font-semibold text-primary">← Quay lại trang chủ</Link>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Thông tin &amp; chính sách</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-black">Chính sách bảo mật</h1>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant">Trang này giải thích các nhóm dữ liệu được sử dụng để vận hành tài khoản và hỗ trợ việc học trên TechEnglish Pro.</p>
      <div className="mt-10 space-y-8">
        {sections.map(([title, content]) => <section key={title}><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-on-surface-variant">{content}</p></section>)}
      </div>
    </article>
  );
}
