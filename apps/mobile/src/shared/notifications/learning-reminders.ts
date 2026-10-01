import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api } from '../api/api-client';

const STORAGE_KEY = 'learning_reminder_notification_id';

function getNotifications() {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return null; // expo-notifications not available in Expo Go SDK 53+
  }
  return require('expo-notifications') as typeof import('expo-notifications');
}

export async function scheduleLearningReminder(time: string | null) {
  if (!Device.isDevice || Platform.OS === 'web') return false;

  const Notifications = getNotifications();
  if (!Notifications) return false;

  const previousId = await AsyncStorage.getItem(STORAGE_KEY);
  if (previousId) await Notifications.cancelScheduledNotificationAsync(previousId).catch(() => undefined);
  if (!time) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  }

  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('learning-reminders', {
      name: 'Nhắc lịch học', importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const [hour, minute] = time.split(':').map(Number);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: { title: 'Đến giờ học rồi!', body: 'Mở TechEnglish Pro để hoàn thành mục tiêu hôm nay.', data: { route: '/(tabs)/home' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: 'learning-reminders' },
  });
  await AsyncStorage.setItem(STORAGE_KEY, identifier);

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    if (typeof token.data === 'string') {
      await api.post('/notifications/subscriptions', { token: token.data, platform: Platform.OS === 'ios' ? 'ios' : 'android' });
    }
  } catch {
    // Lịch nhắc cục bộ vẫn hoạt động khi chưa có google-services.json/APNs.
  }
  return true;
}

