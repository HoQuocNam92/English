'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
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
    <div>
      <PageHeader title="Quản lý Thông báo" description="Gửi thông báo hệ thống hoặc thông báo cho học viên cụ thể" />
      
      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-4">Tạo thông báo mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Loại thông báo</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full border p-2 rounded">
                  <option value="system">Hệ thống (system)</option>
                  <option value="lesson_complete">Hoàn thành bài học (lesson_complete)</option>
                  <option value="streak">Chuỗi ngày (streak)</option>
                  <option value="flash_sale">Flash Sale (flash_sale)</option>
                  <option value="achievement">Thành tựu (achievement)</option>
                  <option value="reminder">Nhắc nhở (reminder)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nội dung</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={3} className="w-full border p-2 rounded"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">User ID (Tùy chọn, để trống = broadcast)</label>
                <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action URL (Tùy chọn)</label>
                <input type="text" value={actionUrl} onChange={e => setActionUrl(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold">Gửi thông báo</button>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-4">Danh sách thông báo</h2>
            {loading ? (
              <p>Đang tải...</p>
            ) : notifications.length === 0 ? (
              <p>Chưa có thông báo nào.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 border rounded shadow-sm relative">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-md">{n.title}</h3>
                      <button onClick={() => handleDelete(n.id)} className="text-red-500 text-sm hover:underline">Xóa</button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    <div className="mt-2 text-xs text-gray-500 flex gap-4">
                      <span>Loại: {n.type}</span>
                      <span>Target: {n.userId ? n.userId : 'Tất cả (Broadcast)'}</span>
                      <span>Ngày: {new Date(n.createdAt).toLocaleString()}</span>
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
