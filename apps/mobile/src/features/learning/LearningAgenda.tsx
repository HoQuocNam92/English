import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Text, Button, Tabs, controlStyles } from '../../shared/ui/primitives';
import { api } from '../../shared/api/api-client';
import { mobileRoute } from '../../shared/navigation';
import { useTheme } from '../../shared/store/theme-context';

export function LearningAgenda() {
  const [agenda, setAgenda] = useState<any>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today'); const router = useRouter(); const { colors } = useTheme();
  const load = useCallback(async () => { setLoading(true); try { setAgenda(await api.get('/progress/me/agenda')); setError(''); } catch (cause: any) { setError(cause.message); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  if (!agenda?.configured && !loading && !error) return null;
  return <View style={[controlStyles.card, { gap: 14 }]}>
<Text style={{ fontSize: 20, fontWeight: '700' }}>Kế hoạch học tập</Text><Button onPress={() => router.push('/learning-plan' as any)}>Xem lộ trình 4 tuần</Button>
    <Tabs items={[{ value: 'today', label: 'Hôm nay' }, { value: 'month', label: 'Tháng này' }, { value: 'year', label: 'Năm nay' }]} value={period} onChange={setPeriod} />
    {loading && <ActivityIndicator color={colors.primary} />}
    {error ? <><Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text><Button onPress={load}>Thử lại</Button></> : agenda && !loading && <>
      <Text>{period === 'today' ? `${agenda.dailyMinutes} phút mỗi ngày · ${agenda.level.name}` : agenda[period].label}</Text>
      {period === 'today' ? <>{agenda.tasks.map((task: any) => <View key={task.id} style={[controlStyles.card, { gap: 8 }]}><Text style={{ fontWeight: '700' }}>{task.title}</Text><Text style={{ color: colors.onSurfaceVariant }}>{task.reason}</Text><View style={controlStyles.footer}><Button disabled={task.status === 'done'} onPress={() => router.push(mobileRoute(task.href) as any)}>{task.status === 'done' ? 'Đã hoàn thành' : task.action}</Button></View></View>)}{!agenda.tasks.length && <Text>Đã hoàn thành các mục tiêu hôm nay.</Text>}</> : <>{agenda[period].metrics.map((metric: any) => <View key={metric.label} style={{ gap: 6 }}><Text>{metric.label}: {metric.current}/{metric.target} {metric.unit}</Text><View style={{ height: 6, backgroundColor: colors.surfaceContainer, borderRadius: 3 }}><View style={{ height: 6, width: `${Math.min(100, metric.target ? metric.current / metric.target * 100 : 0)}%`, backgroundColor: colors.primary, borderRadius: 3 }} /></View></View>)}{period === 'month' && <Text>{agenda.month.focus}</Text>}{period === 'year' && agenda.year.certificates.map((cert: any) => <Button key={cert.href} onPress={() => router.push(mobileRoute(cert.href) as any)}>{cert.name}</Button>)}</>}
      {agenda.retestSuggested && <Button onPress={() => router.push('/placement-test' as any)}>Kiểm tra lại trình độ</Button>}
    </>}
  </View>;
}
