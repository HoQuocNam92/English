import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationHistory } from '../src/shared/notifications/NotificationHistoryProvider';
import { mobileNotificationRoute } from '../src/shared/navigation';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Text, Button, TouchableOpacity, controlStyles } from '../src/shared/ui/primitives';

export default function NotificationsScreen() {
  const { items, loaded, error, markRead } = useNotificationHistory(); const router = useRouter();
  const unread = items.filter(item => !item.read).length;
  return <FeatureScreen title="Thông báo" loading={!loaded}><View style={{ gap: 16 }}>
    {!!items.length && <Text>{unread} thông báo chưa đọc</Text>}
    {unread > 0 && <View style={controlStyles.footer}><Button onPress={() => void markRead()}>Đọc tất cả</Button></View>}
    {!!error && <Text accessibilityRole="alert">{error}</Text>}
    {!items.length && <View style={{ paddingVertical: 48, alignItems: 'center' }}><Text>Chưa có thông báo</Text></View>}
    {items.map(item => <TouchableOpacity key={item.id} accessibilityLabel={`${item.read ? '' : 'Chưa đọc: '}${item.title}. ${item.message}`} onPress={() => { void markRead(item.id); router.push(mobileNotificationRoute(item.href) as any); }} style={[controlStyles.card, { gap: 8, backgroundColor: item.read ? '#fff' : '#eef2ff' }]}>
      <Text style={{ fontWeight: '700', color: '#17213a' }}>{item.read ? '' : '● '}{item.title}</Text><Text>{item.message}</Text><Text style={{ color: '#59657c', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
    </TouchableOpacity>)}
  </View></FeatureScreen>;
}
