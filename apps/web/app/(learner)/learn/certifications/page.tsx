'use client';
import { PaginatedList } from '@/shared/ui/PaginatedList';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListTools, matchesSearch } from '@/shared/ui/ListTools';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export default function CertificationsPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search,setSearch]=useState(''),[filter,setFilter]=useState('');

  useEffect(() => {
    Promise.all([apiClient.get('/certificates'), apiClient.get('/progress/me')])
      .then(([certResult, progressResult]: any[]) => {
        setCertificates(certResult?.data ?? certResult ?? []);
        setProgress(progressResult?.certProgress ?? []);
      })
      .catch((cause) => setError(cause?.message || 'Không thể tải danh sách chứng chỉ'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;

  return <LearnerShell><div className="w-full">
    <div className="mb-8"><h1 className="text-[30px] font-bold text-on-surface">Luyện thi chứng chỉ</h1><p className="mt-2 text-[14px] text-on-surface-variant">Chọn chứng chỉ để luyện tập và làm Mock Exam.</p></div>
    {error && <p className="rounded-xl border border-error/30 bg-error-container p-4 text-sm text-error">{error}</p>}
    {!error && !certificates.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-on-surface-variant">Chưa có chứng chỉ đang hoạt động.</p>}
    <ListTools search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={[{value:'',label:'Tất cả tiến độ'},{value:'started',label:'Đã bắt đầu học'},{value:'new',label:'Chưa bắt đầu'}]} />
    <PaginatedList className="grid grid-cols-1 gap-6 lg:grid-cols-2">{certificates.filter(certificate => matchesSearch(search,certificate.name,certificate.code,certificate.provider) && (!filter || (progress.some(item=>item.certificateId===certificate.id && item.completionPercent>0) === (filter==='started')))).map((certificate) => {
      const itemProgress = progress.find((item) => item.certificateId === certificate.id);
      const percent = Math.round(itemProgress?.completionPercent ?? 0);
      const domains = (certificate.domains ?? []).map((item: any) => item.domain?.name).filter(Boolean);
      return <article key={certificate.id} className="content-card relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-surface-container-high"><div className="h-full bg-primary" style={{ width: `${percent}%` }} /></div>
        <div className="mt-2 flex items-start justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-wide text-primary">{certificate.code}</span><h2 className="mt-1 text-[20px] font-bold text-on-surface">{certificate.name}</h2><p className="mt-1 text-xs font-semibold text-on-surface-variant">{certificate.provider}</p></div><strong className="text-[24px] text-primary">{percent}%</strong></div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-on-surface-variant">{certificate.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">{domains.map((name: string) => <span key={name} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{name}</span>)}</div>
        <div className="content-card-footer"><div className="content-card-actions border-t border-outline-variant pt-4"><Link href={`/learn/certifications/${certificate.id}`} className="ui-button ui-button-primary text-sm">{percent > 0 ? 'Tiếp tục ôn' : 'Xem lộ trình'}</Link></div></div>
      </article>;
    })}</PaginatedList>
  </div></LearnerShell>;
}
