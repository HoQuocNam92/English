import { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { EmptyState, FeatureScreen, featureStyles as s } from '../../src/shared/ui/FeatureScreen';

export default function NotificationsScreen() {
  const { colors } = useTheme(); const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); try { const raw: any = await api.get('/notifications/my'); setItems(raw.notifications ?? raw.data?.notifications ?? []); setError(''); } catch (e: any) { setError(e.message || 'Không thể tải thông báo.'); } finally { setLoading(false); } }, []); useEffect(() => { load(); }, [load]);
  const read = async (id: string) => { await api.patch(`/notifications/my/${id}/read`, {}); setItems(v => v.map(n => n.id === id ? { ...n, isRead: true } : n)); };
  const readAll = async () => { await api.patch('/notifications/my/read-all', {}); setItems(v => v.map(n => ({ ...n, isRead: true }))); };
  return <FeatureScreen title="Thông báo" subtitle={`${items.filter(x => !x.isRead).length} chưa đọc`} loading={loading} error={error} onRetry={load}><TouchableOpacity onPress={readAll} style={[s.button, { backgroundColor: colors.primary, marginBottom: 14 }]}><Text style={{ color: '#fff', fontWeight: '800' }}>Đánh dấu tất cả đã đọc</Text></TouchableOpacity>{!items.length ? <EmptyState icon="notifications-none" title="Chưa có thông báo" detail="Thông báo mới sẽ xuất hiện tại đây." /> : items.map(item => <TouchableOpacity key={item.id} onPress={() => read(item.id)} style={[s.card, { backgroundColor: item.isRead ? colors.surface : `${colors.primary}15`, borderColor: item.isRead ? colors.outlineVariant : colors.primary }]}><View style={[s.row, { justifyContent: 'space-between' }]}><Text style={[s.cardTitle, { color: colors.onSurface, flex: 1 }]}>{item.title}</Text>{!item.isRead ? <View style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: colors.primary }} /> : null}</View><Text style={[s.muted, { color: colors.onSurfaceVariant }]}>{item.message}</Text><Text style={{ color: colors.outline, fontSize: 11, marginTop: 8 }}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text></TouchableOpacity>)}</FeatureScreen>;
}
