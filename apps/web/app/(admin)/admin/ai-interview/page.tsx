'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminAiInterviewPage() {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get<any>('/interview?limit=20')
      .then(res => setSessions(res?.data ?? res ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Phỏng vấn AI</h1>
        <p className="text-sm text-on-surface-variant mt-1">Quản lý các phiên phỏng vấn luyện tập với AI.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-[56px] text-outline block mb-4">smart_toy</span>
          <h3 className="font-semibold text-on-surface text-lg mb-2">Chưa có phiên phỏng vấn nào</h3>
          <p className="text-sm text-on-surface-variant">Học viên chưa thực hiện phỏng vấn AI.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Học viên</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Vị trí</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Điểm</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {sessions.map((s: any, i: number) => (
                <tr key={s.id ?? i} className="hover:bg-surface-container-high transition-colors">
                  <td className="p-4 text-sm text-on-surface">{s.user?.displayName ?? s.userName ?? '—'}</td>
                  <td className="p-4 text-sm text-on-surface-variant">{s.position ?? s.role ?? s.topic ?? '—'}</td>
                  <td className="p-4 text-sm font-semibold text-on-surface">{s.score ?? s.totalScore ?? '—'}</td>
                  <td className="p-4 text-sm text-on-surface-variant">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '—'}
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
