import { Text, TouchableOpacity } from '../../shared/ui/primitives';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '../../shared/ui/AppIcon';
import { api } from '../../shared/api/api-client';
import { useTheme } from '../../shared/store/theme-context';

type Attempt = { id: string; startedAt: string; scorePercent: number | null; exam?: { title: string } };
export function LearningActivities() {
  const router = useRouter();
  const { colors } = useTheme();
  const [data, setData] = useState<{ vocabCount: number; certificates: number; attempts: Attempt[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [vocabulary, certificates, progress] = await Promise.all([
        api.get<{ meta?: { total: number } }>('/vocabulary?limit=1'),
        api.get<unknown[] | { data: unknown[] }>('/certificates'),
        api.get<{ recentAttempts: Attempt[] }>('/progress/me'),
      ]);
      setData({ vocabCount: vocabulary.meta?.total ?? 0, certificates: (Array.isArray(certificates) ? certificates : certificates.data).length, attempts: progress.recentAttempts ?? [] });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải dữ liệu luyện tập.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const links: { title: string; description: string; icon: keyof typeof MaterialIcons.glyphMap; route: string }[] = [
    { title: 'Luyện từ vựng', description: `${data?.vocabCount ?? '…'} từ · Khám phá theo lĩnh vực và trình độ`, icon: 'style', route: '/flashcards/dashboard' },
    { title: 'Luyện thi chứng chỉ', description: `${data?.certificates ?? '…'} chứng chỉ · Domain, Topic và thi thử`, icon: 'workspace-premium', route: '/certifications' },
  ];
  return <View style={[s.root, { backgroundColor: colors.background }]}>
    <View style={s.header}><Text style={[s.title, { color: colors.onSurface }]}>Luyện tập</Text><Text style={{ color: colors.onSurfaceVariant }}>Chọn nội dung để tiếp tục học hôm nay.</Text></View>
    <View style={s.content}>
      {loading && !data && <ActivityIndicator color={colors.primary} />}
      {error ? <View style={s.error}><Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text><TouchableOpacity onPress={load} style={s.retry}><Text style={{ color: colors.primary }}>Thử lại</Text></TouchableOpacity></View> : null}
      {links.map(link => <TouchableOpacity key={link.route} accessibilityRole="button" onPress={() => router.push(link.route as any)} style={[s.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}><MaterialIcons name={link.icon} size={28} color={colors.primary} /><View style={s.body}><Text style={[s.cardTitle, { color: colors.onSurface }]}>{link.title}</Text><Text style={[s.description, { color: colors.onSurfaceVariant }]}>{link.description}</Text></View><MaterialIcons name="chevron-right" size={24} color={colors.outline} /></TouchableOpacity>)}
      <Text style={[s.sectionTitle, { color: colors.onSurface }]}>Hoạt động gần đây</Text>
      {data && data.attempts.length === 0 && <Text style={{ color: colors.onSurfaceVariant }}>Chưa có bài luyện thi đã hoàn thành.</Text>}
      {data?.attempts.slice(0, 5).map(attempt => <TouchableOpacity key={attempt.id} accessibilityRole="button" accessibilityLabel={`Xem kết quả ${attempt.exam?.title ?? 'bài thi'}`} onPress={() => router.push(`/test-result/${attempt.id}` as any)} style={[s.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}><View style={s.body}><Text style={[s.cardTitle, { color: colors.onSurface }]}>{attempt.exam?.title ?? 'Bài thi chứng chỉ'}</Text><Text style={[s.description, { color: colors.onSurfaceVariant }]}>{new Date(attempt.startedAt).toLocaleDateString('vi-VN')} · Xem kết quả</Text></View><Text style={{ color: colors.primary, fontWeight: '800' }}>{attempt.scorePercent == null ? 'Chờ chấm' : `${Math.round(attempt.scorePercent)}%`}</Text></TouchableOpacity>)}
    </View>
  </View>;
}
const s = StyleSheet.create({ root: {}, header: { paddingVertical: 12, gap: 8 }, title: { fontSize: 28, fontWeight: '800' }, content: { gap: 12 }, card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderWidth: 1, borderRadius: 16 }, body: { flex: 1 }, cardTitle: { fontSize: 16, fontWeight: '700' }, description: { fontSize: 13, lineHeight: 20, marginTop: 5 }, sectionTitle: { fontSize: 21, fontWeight: '800', marginTop: 16 }, error: { gap: 8 }, retry: { minHeight: 44, justifyContent: 'center' } });
