'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminWritingPracticePage() {
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get<any>('/writing?limit=20')
      .then(res => setSubmissions(res?.data ?? res ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Luyện viết tiếng Anh</h1>
        <p className="text-sm text-on-surface-variant mt-1">Quản lý bài luyện viết và phản hồi từ AI.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : submissions.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-[56px] text-outline block mb-4">edit_note</span>
          <h3 className="font-semibold text-on-surface text-lg mb-2">Chưa có bài luyện viết</h3>
          <p className="text-sm text-on-surface-variant">Học viên chưa nộp bài luyện viết nào.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Học viên</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Chủ đề</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Điểm AI</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ngày nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {submissions.map((s: any, i: number) => (
                <tr key={s.id ?? i} className="hover:bg-surface-container-high transition-colors">
                  <td className="p-4 text-sm text-on-surface">{s.user?.displayName ?? s.userName ?? '—'}</td>
                  <td className="p-4 text-sm text-on-surface-variant">{s.prompt ?? s.topic ?? s.title ?? '—'}</td>
                  <td className="p-4 text-sm font-semibold text-on-surface">{s.aiScore ?? s.score ?? '—'}</td>
                  <td className="p-4 text-sm text-on-surface-variant">
                    {s.submittedAt ?? s.createdAt ? new Date(s.submittedAt ?? s.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
