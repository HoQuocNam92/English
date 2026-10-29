import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationHistory } from '../src/shared/notifications/NotificationHistoryProvider';
import { mobileNotificationRoute } from '../src/shared/navigation';
import { EmptyState, FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Text, Button, TouchableOpacity, controlStyles } from '../src/shared/ui/primitives';

export default function NotificationsScreen() {
  const { items, loaded, error, markRead } = useNotificationHistory(); const router = useRouter();
  const unread = items.filter(item => !item.read).length;
  return <FeatureScreen title="Thông báo" loading={!loaded}><View style={{ gap: 16 }}>
    <Text>{unread} thông báo chưa đọc</Text>
    {unread > 0 && <View style={controlStyles.footer}><Button onPress={() => void markRead()}>Đọc tất cả</Button></View>}
    {!!error && <Text accessibilityRole="alert">{error}</Text>}
    {!items.length && <EmptyState icon="notifications-none" title="Chưa có thông báo nào" detail="Nhắc học và thông báo nhận được sẽ xuất hiện tại đây." />}
    {items.map(item => <TouchableOpacity key={item.id} accessibilityLabel={`${item.read ? '' : 'Chưa đọc: '}${item.title}. ${item.message}`} onPress={() => { void markRead(item.id); router.push(mobileNotificationRoute(item.href) as any); }} style={[controlStyles.card, { gap: 8, backgroundColor: item.read ? '#fff' : '#eef2ff' }]}>
      <Text style={{ fontWeight: '700', color: '#17213a' }}>{item.read ? '' : '● '}{item.title}</Text><Text>{item.message}</Text><Text style={{ color: '#59657c', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
    </TouchableOpacity>)}
    <Text style={{ fontSize: 12, color: '#59657c' }}>Lưu tối đa 100 thông báo gần nhất trên thiết bị này.</Text>
  </View></FeatureScreen>;
}
