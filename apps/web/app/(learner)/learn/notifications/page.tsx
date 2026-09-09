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
          const { notifications } = data.notifications ? data : { notifications: data };
          if (Array.isArray(notifications) && notifications.length > 0) {
            setNotifications(notifications.map((item: any) => ({ ...item, description: item.message, time: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '' })));
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
      setNotifications([]);
    };
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/my/read-all', {});
    } catch (e) {
      console.error(e);
    }
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const toggleRead = async (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;
    
    if (!notif.isRead) {
      try {
        await apiClient.patch(`/notifications/my/${id}/read`, {});
      } catch (e) {
        console.error(e);
      }
    }
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const categoryTypes: Record<string, string[]> = {
    learning: ['lesson_complete', 'streak', 'reminder'],
    test: ['exam', 'test_result'],
    cert: ['achievement', 'certificate'],
    system: ['system', 'flash_sale'],
  };
  const visibleNotifications = filter === 'all' ? notifications : notifications.filter((item) => categoryTypes[filter]?.includes(item.type));
  const groupedNotifications = visibleNotifications.reduce((acc, notif) => {
    const created = notif.createdAt ? new Date(notif.createdAt) : new Date();
    const group = created.toDateString() === new Date().toDateString() ? 'Hôm nay' : created.toLocaleDateString('vi-VN');
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, any[]>);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <LearnerShell>
      <div className="flex flex-col">
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-[30px] font-bold text-on-surface tracking-tight">Thông báo</h1>
            <p className="text-[14px] text-on-surface-variant mt-1">Cập nhật tiến trình và hoạt động học tập của bạn.</p>
          </div>
          <button onClick={markAllAsRead} className="font-semibold text-[14px] text-primary hover:text-primary-container transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">done_all</span>
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar / Filter Tabs */}
          <aside className="col-span-1 md:col-span-3 flex flex-col gap-2">
            <nav className="bg-surface-white border border-border-subtle rounded-xl p-1 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible shadow-sm hover:shadow-md transition-shadow duration-300">
              <button onClick={() => setFilter('all')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold text-[14px] transition-colors text-left flex-shrink-0 ${filter === 'all' ? 'bg-primary-light text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">inbox</span>
                  <span>Tất cả</span>
                </div>
                {unreadCount > 0 && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
              
              <button onClick={() => setFilter('learning')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold text-[14px] transition-colors text-left flex-shrink-0 ${filter === 'learning' ? 'bg-primary-light text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">school</span>
                  <span>Học tập</span>
                </div>
              </button>

              <button onClick={() => setFilter('test')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold text-[14px] transition-colors text-left flex-shrink-0 ${filter === 'test' ? 'bg-primary-light text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">quiz</span>
                  <span>Kiểm tra</span>
                </div>
              </button>

              <button onClick={() => setFilter('cert')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold text-[14px] transition-colors text-left flex-shrink-0 ${filter === 'cert' ? 'bg-primary-light text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">workspace_premium</span>
                  <span>Chứng chỉ</span>
                </div>
              </button>

              <button onClick={() => setFilter('system')} className={`w-full flex items-center justify-between p-2 rounded-lg font-semibold text-[14px] transition-colors text-left flex-shrink-0 ${filter === 'system' ? 'bg-primary-light text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">build</span>
                  <span>Hệ thống</span>
                </div>
              </button>
            </nav>

            {/* Contextual Graphic/Ad space */}
            <div className="hidden md:block bg-gradient-to-br from-secondary-fixed to-primary-light border border-border-subtle rounded-xl p-6 mt-4">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">rocket_launch</span>
              <h3 className="font-semibold text-[14px] text-on-surface">Nâng cấp Pro</h3>
              <p className="text-[12px] text-on-surface-variant mt-1 mb-4">Mở khóa toàn bộ bài tập thực hành Networking.</p>
              <button className="w-full bg-primary text-white py-2 rounded-[10px] font-semibold text-[14px] hover:bg-primary-container transition-colors shadow-sm">
                Tìm hiểu thêm
              </button>
            </div>
          </aside>

          {/* Notification List Area */}
          <section className="col-span-1 md:col-span-9 flex flex-col gap-4">
            {Object.keys(groupedNotifications).length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">Không có thông báo nào</div>
            ) : (
              (Object.entries(groupedNotifications) as [string, any[]][]).map(([dateGroup, notifs]) => (
                <div key={dateGroup} className="mt-2 first:mt-0">
                  <h2 className="text-[12px] font-bold text-on-surface-variant mb-2 ml-2 uppercase tracking-wider">{dateGroup}</h2>
                  <div className="flex flex-col gap-2">
                    {notifs.map((notif) => {
                      let bgClass = "bg-surface-white";
                      let borderClass = "border-border-subtle";
                      let iconBg = "bg-surface-container-high";
                      let iconColor = "text-on-surface-variant";
                      let iconName = "notifications";
                      let leftLine = null;

                      if (notif.type === 'warning') {
                        borderClass = "border-error-container";
                        iconBg = "bg-error-container";
                        iconColor = "text-on-error-container";
                        iconName = "warning";
                        leftLine = <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-error rounded-r-full"></div>;
                      } else if (notif.type === 'ai_recommendation') {
                        bgClass = "bg-ai-accent";
                        borderClass = "border-secondary";
                        iconBg = "bg-secondary-fixed";
                        iconColor = "text-secondary";
                        iconName = "auto_awesome";
                        leftLine = <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-secondary rounded-r-full"></div>;
                      } else if (notif.type === 'success') {
                        iconBg = "bg-tertiary-fixed";
                        iconColor = "text-tertiary";
                        iconName = "emoji_events";
                      } else if (notif.type === 'info') {
                        iconName = "menu_book";
                      }

                      return (
                        <div key={notif.id} onClick={() => toggleRead(notif.id)} className={`group relative cursor-pointer ${bgClass} border ${borderClass} rounded-xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-300 ${notif.isRead ? 'opacity-75' : ''}`}>
                          {leftLine}
                          
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                            <span className={`material-symbols-outlined ${iconColor}`}>{iconName}</span>
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-[14px] text-on-surface">{notif.title}</h3>
                              <span className="text-[12px] text-on-surface-variant whitespace-nowrap ml-4">{notif.time}</span>
                            </div>
                            <p className="text-[14px] text-on-surface-variant leading-relaxed">
                              {notif.description}
                            </p>
                            
                            {/* Action Button for Unread/Actionable */}
                            {notif.actionText && (
                              <div className="mt-2">
                                {notif.type === 'warning' ? (
                                  <button className="text-[12px] font-semibold text-primary hover:text-primary-container transition-colors">
                                    {notif.actionText}
                                  </button>
                                ) : (
                                  <button className="bg-surface-white border border-border-subtle text-on-surface font-semibold text-[12px] py-1.5 px-3 rounded-[10px] hover:bg-surface-container-low transition-colors shadow-sm">
                                    {notif.actionText}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Score Snippet */}
                            {notif.score && (
                              <div className="mt-2 bg-surface-container-low rounded-lg p-2 flex items-center gap-4 w-max border border-border-subtle">
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                                  <span className="text-[12px] font-semibold">Đạt</span>
                                </div>
                                <div className="w-[1px] h-4 bg-outline-variant"></div>
                                <span className="text-[12px] text-on-surface-variant">Điểm: {notif.score}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            
            <div className="mt-6 flex justify-center">
              <button className="bg-transparent border border-border-subtle text-on-surface font-semibold text-[14px] py-2 px-8 rounded-[10px] hover:bg-surface-container-low transition-colors">
                Xem thêm thông báo
              </button>
            </div>
          </section>
        </div>
      </div>
    </LearnerShell>
  );
}
