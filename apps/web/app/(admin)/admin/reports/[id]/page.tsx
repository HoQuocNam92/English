'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, progressRes] = await Promise.all<any>([
          apiClient.get(`/users/${id}`),
          apiClient.get(`/progress/learners/${id}`).catch(() => ({ data: null }))
        ]);
        
        setUser(userRes.data);
        setProgress(progressRes.data);
        
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải báo cáo tiến độ');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Báo cáo tiến độ" description="Đang tải dữ liệu..." />
        <div className="mt-6 flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <PageHeader title="Báo cáo tiến độ" description="Lỗi tải dữ liệu" />
        <div className="mt-6 rounded-2xl bg-error-container p-6 text-on-error-container">
          <p>{error || 'Không tìm thấy học viên'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Báo cáo tiến độ" description={`Học viên: ${user.email}`} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface-container border border-outline-variant/30 p-6">
          <h3 className="text-lg font-medium text-on-surface mb-4">Tổng quan tiến độ</h3>
          {progress ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-on-surface-variant block">Tổng số bài học hoàn thành</span>
                <span className="text-on-surface font-medium text-lg">{progress.completedLessons || 0}</span>
              </div>
              <div>
                <span className="text-sm text-on-surface-variant block">Điểm trung bình (ước tính)</span>
                <span className="text-on-surface font-medium text-lg">{progress.averageScore || 'N/A'}</span>
              </div>
              {progress.domains && (
                <div className="mt-4">
                  <span className="text-sm text-on-surface-variant block mb-2">Tiến độ theo lĩnh vực</span>
                  <div className="space-y-2">
                    {progress.domains.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-surface-container-high p-2 rounded">
                        <span className="text-sm">{d.name}</span>
                        <span className="text-sm font-medium">{d.completion}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Không có dữ liệu tiến độ chi tiết hoặc API không hỗ trợ xem tiến độ học viên khác.</p>
          )}
        </div>

        <div className="rounded-2xl bg-surface-container border border-outline-variant/30 p-6">
          <h3 className="text-lg font-medium text-on-surface mb-4">Hoạt động gần đây</h3>
          <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">history</span>
            <p className="text-sm">Chưa có dữ liệu hoạt động</p>
          </div>
        </div>
      </div>
    </div>
  );
}
