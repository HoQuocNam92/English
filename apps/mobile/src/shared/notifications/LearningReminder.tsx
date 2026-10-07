import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppState, View } from 'react-native';
import { api } from '../api/api-client';
import { useAuth } from '../store/auth-context';
import { useTheme } from '../store/theme-context';
import { Button, Text, controlStyles } from '../ui/primitives';

type Reminder = { id: string; title: string; body: string };

export function LearningReminder() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    setReminder(null);
    setError('');
    if (!user) return;
    let active = true;
    let busy = false;
    const load = async () => {
      if (busy || (AppState.currentState && AppState.currentState !== 'active')) return;
      busy = true;
      try {
        const pending = await api.get<Reminder[]>('/notifications/pending');
        if (active) setReminder(pending[0] ?? null);
      } catch {
        // Keep the current reminder and retry when the app is active again.
      } finally { busy = false; }
    };
    void load();
    const timer = setInterval(() => void load(), 30000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void load();
    });
    return () => {
      active = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [user?.id]));

  const dismiss = async (startLearning = false) => {
    if (!reminder || saving) return;
    setSaving(true);
    setError('');
    try {
      await api.patch(`/notifications/${reminder.id}/read`, {});
      setReminder(null);
      if (startLearning) router.push('/(tabs)/learning');
    } catch {
      setError('Chưa đóng được nhắc học. Vui lòng thử lại.');
    } finally { setSaving(false); }
  };

  if (!reminder) return null;
  return <View style={[controlStyles.card, { gap: 12, borderColor: colors.primary }]}>
    <Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: colors.onSurface }}>{reminder.title}</Text>
    <Text style={{ color: colors.onSurfaceVariant }}>{reminder.body}</Text>
    {error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
    <View style={controlStyles.footer}>
      <Button disabled={saving} onPress={() => void dismiss(true)}>Học ngay</Button>
      <Button disabled={saving} onPress={() => void dismiss()}>Đóng nhắc học</Button>
    </View>
  </View>;
}
