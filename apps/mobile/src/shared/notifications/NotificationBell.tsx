import { View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useNotificationHistory } from './NotificationHistoryProvider';
import { MaterialIcons } from '../ui/AppIcon';
import { Text, TouchableOpacity } from '../ui/primitives';

export function NotificationBell() {
  const { items } = useNotificationHistory(); const router = useRouter();
  const pathname = usePathname();
  const unread = items.filter(item => !item.read).length;
  return <TouchableOpacity accessibilityLabel={`Thông báo${unread ? `, ${unread} chưa đọc` : ''}`} onPress={() => { if (pathname !== '/notifications') router.push('/notifications' as any); }} style={{ width: 48, height: 48, alignItems: 'center', backgroundColor: '#e0edff', borderRadius: 24 }}>
    <MaterialIcons name="notifications-none" size={26} color="#2563eb" />
    {unread > 0 && <View style={{ position: 'absolute', top: 1, right: 0, borderRadius: 12, backgroundColor: '#b91c1c', paddingHorizontal: 5 }}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{unread > 99 ? '99+' : unread}</Text></View>}
  </TouchableOpacity>;
}
