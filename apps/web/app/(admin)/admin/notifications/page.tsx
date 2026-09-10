'use client';

import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [type, setType] = React.useState('system');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [actionUrl, setActionUrl] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/notifications?page=1&limit=50');
      setNotifications(res.notifications || []);
    } catch (e: any) {
      console.error(e);
      setError('Lỗi khi tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await apiClient.post('/notifications', {
        type,
        title,
        message,
        userId: userId || undefined,
        actionUrl: actionUrl || undefined,
      });
      setSuccess('Tạo thông báo thành công');
      setTitle('');
      setMessage('');
      setUserId('');
      setActionUrl('');
      fetchNotifications();
    } catch (e: any) {
      setError('Lỗi khi tạo thông báo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      alert('Lỗi khi xóa thông báo');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Quản lý Thông báo</h1>
        <p className="text-sm text-on-surface-variant">Gửi thông báo hệ thống hoặc thông báo cho học viên cụ thể</p>
      </div>
      
      {error && <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-sm font-semibold border border-error/20">{error}</div>}
      {success && <div className="mb-6 p-4 rounded-xl bg-[#e6f4ea] text-[#137333] text-sm font-semibold border border-[#ceead6]">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">add_alert</span>
              Tạo thông báo mới
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Loại thông báo</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)} 
                  className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                >
                  <option value="system">Hệ thống (system)</option>
                  <option value="lesson_complete">Hoàn thành bài học (lesson_complete)</option>
                  <option value="streak">Chuỗi ngày (streak)</option>
                  <option value="achievement">Thành tựu (achievement)</option>
                  <option value="reminder">Nhắc nhở (reminder)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Tiêu đề</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  placeholder="Nhập tiêu đề..."
                  className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Nội dung</label>
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  required 
                  rows={4} 
                  placeholder="Nhập nội dung thông báo..."
                  className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">User ID <span className="text-on-surface-variant font-normal">(Tùy chọn)</span></label>
                <input 
                  type="text" 
                  value={userId} 
                  onChange={e => setUserId(e.target.value)} 
                  placeholder="Để trống = Gửi tất cả"
                  className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Action URL <span className="text-on-surface-variant font-normal">(Tùy chọn)</span></label>
                <input 
                  type="text" 
                  value={actionUrl} 
                  onChange={e => setActionUrl(e.target.value)} 
                  placeholder="https://..."
                  className="w-full border border-outline-variant rounded-lg p-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Gửi thông báo
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6 h-full">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
              Danh sách thông báo
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 border border-outline-variant rounded-xl bg-surface-container-low animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">notifications_off</span>
                <p className="text-sm font-semibold">Chưa có thông báo nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n.id} className="p-5 border border-outline-variant rounded-xl bg-white hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-base text-on-surface">{n.title}</h3>
                      <button 
                        onClick={() => handleDelete(n.id)} 
                        className="text-error hover:bg-error-container p-1.5 rounded-lg transition-colors flex-shrink-0"
                        title="Xóa thông báo"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-2 whitespace-pre-wrap">{n.message}</p>
                    
                    <div className="mt-4 pt-4 border-t border-outline-variant flex flex-wrap gap-3 text-xs font-semibold">
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">label</span>
                        {n.type}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">group</span>
                        {n.userId ? n.userId : 'Tất cả (Broadcast)'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
