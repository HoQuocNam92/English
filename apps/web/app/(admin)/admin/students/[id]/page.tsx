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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, profileRes] = await Promise.all<any>([
          apiClient.get(`/users/${id}`),
          apiClient.get(`/learner-profiles/${id}`).catch(() => ({ data: null }))
        ]);
        setUser(userRes.data);
        setProfile(profileRes.data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu học viên');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const toggleStatus = async () => {
    try {
      setToggling(true);
      if (user?.status === 'active') {
        await apiClient.patch(`/users/${id}/suspend`, {});
        setUser({ ...user, status: 'suspended' });
      } else {
        await apiClient.patch(`/users/${id}/activate`, {});
        setUser({ ...user, status: 'active' });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thay đổi trạng thái');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Chi tiết học viên" description="Đang tải dữ liệu..." />
        <div className="mt-6 flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <PageHeader title="Chi tiết học viên" description="Lỗi tải dữ liệu" />
        <div className="mt-6 rounded-2xl bg-error-container p-6 text-on-error-container">
          <p>{error || 'Không tìm thấy học viên'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Chi tiết học viên" description={user.email} />
        <button 
          onClick={toggleStatus}
          disabled={toggling}
          className={`px-4 py-2 rounded-full font-medium ${
            user.status === 'active' 
              ? 'bg-error text-on-error hover:bg-error/90' 
              : 'bg-primary text-on-primary hover:bg-primary/90'
          }`}
        >
          {toggling ? 'Đang xử lý...' : user.status === 'active' ? 'Đình chỉ' : 'Kích hoạt'}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface-container border border-outline-variant/30 p-6">
          <h3 className="text-lg font-medium text-on-surface mb-4">Thông tin cá nhân</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-on-surface-variant block">Email</span>
              <span className="text-on-surface">{user.email}</span>
            </div>
            <div>
              <span className="text-sm text-on-surface-variant block">Trạng thái</span>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                user.status === 'active' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'
              }`}>
                {user.status}
              </span>
            </div>
            <div>
              <span className="text-sm text-on-surface-variant block">Trạng thái Onboarding</span>
              <span className="text-on-surface">{user.onboardingCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container border border-outline-variant/30 p-6">
          <h3 className="text-lg font-medium text-on-surface mb-4">Hồ sơ học tập</h3>
          {profile ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-on-surface-variant block">Trình độ</span>
                <span className="text-on-surface">{profile.level?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-on-surface-variant block">Lĩnh vực quan tâm</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.domains?.length ? profile.domains.map((d: any) => (
                    <span key={d.domain?.id} className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-xs">
                      {d.domain?.name}
                    </span>
                  )) : <span>Không có</span>}
                </div>
              </div>
              <div>
                <span className="text-sm text-on-surface-variant block">Mục tiêu hàng tuần (phút)</span>
                <span className="text-on-surface">{profile.weeklyStudyTargetMinutes || 0}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Chưa có hồ sơ học tập</p>
          )}
        </div>
      </div>
    </div>
  );
}
