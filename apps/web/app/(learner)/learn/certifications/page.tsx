'use client';
import { ClearFiltersButton } from '@/shared/ui/ClearFiltersButton';
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
    Promise.all([apiClient.get('/certificates?activeOnly=true'), apiClient.get('/progress/me')])
      .then(([certResult, progressResult]: any[]) => {
        setCertificates(certResult?.data ?? certResult ?? []);
        setProgress(progressResult?.certProgress ?? []);
      })
      .catch((cause) => setError(cause?.message || 'Không thể tải danh sách chứng chỉ'))
      .finally(() => setLoading(false));
  }, []);

  const filteredCertificates = certificates.filter(certificate => (matchesSearch(search, certificate.name, certificate.code, certificate.provider)
    || (certificate.exams ?? []).some((exam: { title: string }) => matchesSearch(search, exam.title)))
    && (!filter || (progress.some(item => item.certificateId === certificate.id && (item.hasStarted || item.completionPercent > 0)) === (filter === 'started'))));

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;

  return <LearnerShell><div className="w-full">
    <div className="mb-8"><h1 className="text-[30px] font-bold text-on-surface">Luyện thi chứng chỉ</h1><p className="mt-2 text-[14px] text-on-surface-variant">Tìm theo tên chứng chỉ hoặc tên bài kiểm tra đã xuất bản. Chọn tên bài trong kết quả để mở đúng bài kiểm tra.</p></div>
    {error && <p className="rounded-xl border border-error/30 bg-error-container p-4 text-sm text-error">{error}</p>}
    {!error && !certificates.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-on-surface-variant">Chưa có chứng chỉ đang hoạt động.</p>}
    <ListTools search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} placeholder="Tìm chứng chỉ hoặc bài kiểm tra..." options={[{value:'',label:'Tất cả tiến độ'},{value:'started',label:'Đã bắt đầu học'},{value:'new',label:'Chưa bắt đầu'}]} />
    {certificates.length > 0 && filteredCertificates.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
      <p className="font-semibold text-on-surface">{filter === 'started' ? 'Chưa có chứng chỉ nào bạn đã bắt đầu học.' : filter === 'new' ? 'Bạn đã bắt đầu học tất cả chứng chỉ.' : 'Không có chứng chỉ phù hợp với bộ lọc.'}</p>
      <p className="mt-1 text-sm text-on-surface-variant">Hãy đổi từ khóa hoặc chọn tiến độ khác.</p>
      <ClearFiltersButton className="mt-4" onClick={() => { setSearch(''); setFilter(''); }} />
    </div>}
    {!!filteredCertificates.length && <PaginatedList className="grid grid-cols-1 gap-6 lg:grid-cols-2">{filteredCertificates.map((certificate) => {
      const itemProgress = progress.find((item) => item.certificateId === certificate.id);
      const percent = Math.round(itemProgress?.completionPercent ?? 0);
      const domains = (certificate.domains ?? []).map((item: any) => item.domain?.name).filter(Boolean);
      const matchedExams = search.trim() ? (certificate.exams ?? []).filter((exam: { title: string }) => matchesSearch(search, exam.title)) : [];
      return <article key={certificate.id} className="content-card relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">

        <div className="mt-2 flex items-start justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-wide text-primary">{certificate.code}</span><h2 className="mt-1 text-[20px] font-bold text-on-surface">{certificate.name}</h2><p className="mt-1 text-xs font-semibold text-on-surface-variant">{certificate.provider}</p></div></div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-on-surface-variant">{certificate.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">{domains.map((name: string) => <span key={name} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{name}</span>)}</div>
        {matchedExams.length > 0 && <div className="mt-4 rounded-xl bg-primary/5 p-3 text-sm"><p className="font-semibold text-on-surface">Bài kiểm tra phù hợp</p>{matchedExams.map((exam: { id: string; title: string }) => <Link key={exam.id} href={`/learn/certifications/${certificate.id}?tab=exams&examId=${encodeURIComponent(exam.id)}`} className="mt-2 block font-medium text-primary underline">{exam.title} → Mở bài kiểm tra</Link>)}</div>}
        <div className="mt-4"><p className="text-sm font-semibold">{itemProgress?.hasStarted ? 'Đã bắt đầu' : 'Chưa học'} · {percent}% hoàn thành</p><div role="progressbar" aria-label={`Tiến độ ${certificate.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-primary" style={{ width: `${percent}%` }} /></div></div>
        <div className="content-card-footer"><div className="content-card-actions border-t border-outline-variant pt-4"><Link href={matchedExams.length === 1 ? `/learn/certifications/${certificate.id}?tab=exams&examId=${encodeURIComponent(matchedExams[0].id)}` : `/learn/certifications/${certificate.id}`} className={`ui-button text-sm ${itemProgress?.hasStarted || percent > 0 ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'ui-button-primary'}`}>{matchedExams.length === 1 ? 'Mở bài kiểm tra' : itemProgress?.hasStarted || percent > 0 ? 'Tiếp tục ôn' : 'Xem lộ trình'}</Link></div></div>
      </article>;
    })}</PaginatedList>}
  </div></LearnerShell>;
}
