'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function NotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res: any = await apiClient.get('/notifications/my');
        if (res) {
          const data = res.data ?? res;
          const { notifications, unreadCount } = data.notifications ? data : { notifications: data, unreadCount: 0 };
          setNotifications(Array.isArray(notifications) ? notifications : []);
        }
      } catch (error) {
        // Fallback static data
        setNotifications([
          {
            id: 1,
            type: 'system',
            title: 'Bạn chưa học trong 3 ngày',
            description: 'Duy trì thói quen học tập để đạt kết quả tốt nhất. Hãy dành 15 phút hôm nay cho học phần Cybersecurity Basics.',
            time: '10:30 AM',
            isRead: false,
          },
          {
            id: 2,
            type: 'system',
            title: 'Có bài luyện tập mới dành cho bạn',
            description: 'AI của TechEnglish phân tích điểm yếu của bạn và đề xuất bài tập từ vựng Data Structures.',
            time: '08:15 AM',
            isRead: false,
          },
          {
            id: 3,
            type: 'lesson_complete',
            title: 'Bạn đạt 85% bài kiểm tra Networking',
            description: 'Tuyệt vời! Bạn đã vượt qua bài kiểm tra Module 3. Xem lại chi tiết để cải thiện phần Subnetting.',
            time: 'Hôm qua, 14:20',
            isRead: true,
          }
        ]);
      }
    };
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/my/read-all', {});
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const toggleRead = async (id: number) => {
    try {
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.isRead) {
        await apiClient.patch(`/notifications/my/${id}/read`, {});
      }
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface">{t.notifications.title} {unreadCount > 0 && <span className="text-primary text-xl">({unreadCount})</span>}</h1>
            <p className="text-sm md:text-base text-on-surface/70 mt-1">{t.notifications.subtitle}</p>
          </div>
          <button onClick={markAllAsRead} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">done_all</span>
            {t.notifications.markAllRead}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar / Filter Tabs */}
          <aside className="col-span-1 md:col-span-3 flex flex-col gap-2">
            <nav className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible shadow-2xs">
              <button onClick={() => setFilter('all')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold transition-colors text-left flex-shrink-0 ${filter === 'all' ? 'bg-primary/10 text-primary' : 'text-on-surface/70 hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">inbox</span>
                  <span>{t.notifications.all}</span>
                </div>
                {unreadCount > 0 && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
              <button onClick={() => setFilter('learning')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold transition-colors text-left flex-shrink-0 ${filter === 'learning' ? 'bg-primary/10 text-primary' : 'text-on-surface/70 hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">school</span>
                  <span>{t.notifications.learning}</span>
                </div>
              </button>
              <button onClick={() => setFilter('system')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold transition-colors text-left flex-shrink-0 ${filter === 'system' ? 'bg-primary/10 text-primary' : 'text-on-surface/70 hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">build</span>
                  <span>{t.notifications.system}</span>
                </div>
              </button>
            </nav>
          </aside>

          {/* Notification List Area */}
          <section className="col-span-1 md:col-span-9 flex flex-col gap-4">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-on-surface/60">{t.notifications.noNotifications}</div>
            ) : (
              <div className="flex flex-col gap-4">
                {notifications.map((notif) => (
                  <div key={notif.id} onClick={() => toggleRead(notif.id)} className={`cursor-pointer group relative bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex items-start gap-4 shadow-2xs hover:shadow-md transition-shadow duration-300 ${!notif.isRead ? 'border-l-4 border-l-primary' : 'opacity-75'}`}>
                    {!notif.isRead && (
                      <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-primary"></div>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'system' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                      <span className="material-symbols-outlined">{notif.type === 'system' ? 'info' : 'school'}</span>
                    </div>
                    <div className="flex-grow pr-6">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base md:text-lg font-bold text-on-surface">{notif.title}</h3>
                        <span className="text-xs text-on-surface/60 whitespace-nowrap ml-4">{notif.time}</span>
                      </div>
                      <p className="text-sm text-on-surface/80">{notif.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </LearnerShell>
  );
}
