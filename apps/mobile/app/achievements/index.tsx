import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { EmptyState, FeatureScreen, featureStyles as s } from '../../src/shared/ui/FeatureScreen';

export default function AchievementsScreen() {
  const { colors } = useTheme(); const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); try { const raw: any = await api.get('/leaderboard/streaks/me'); setData(raw.data ?? raw); setError(''); } catch (e: any) { setError(e.message || 'Không thể tải thành tích.'); } finally { setLoading(false); } }, []); useEffect(() => { load(); }, [load]);
  const badges = data?.badges ?? data?.userBadges ?? [];
  return <FeatureScreen title="Thành tích" subtitle="Chuỗi học và huy hiệu của bạn" loading={loading} error={error} onRetry={load}><View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>{[["local-fire-department", data?.currentStreak ?? data?.streak ?? 0, 'Ngày liên tiếp'], ['stars', data?.totalExpPoints ?? data?.exp ?? 0, 'Điểm EXP'], ['emoji-events', data?.rank ?? '—', 'Xếp hạng']].map(([icon, value, label]) => <View key={String(label)} style={[s.card, { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><MaterialIcons name={icon as any} size={28} color={colors.primary} /><Text style={{ fontSize: 21, fontWeight: '900', color: colors.onSurface, marginTop: 6 }}>{String(value)}</Text><Text style={{ fontSize: 11, textAlign: 'center', color: colors.onSurfaceVariant }}>{label}</Text></View>)}</View><Text style={[s.cardTitle, { color: colors.onSurface, marginBottom: 12 }]}>Huy hiệu đã đạt</Text>{!badges.length ? <EmptyState icon="military-tech" title="Chưa có huy hiệu" detail="Hoàn thành bài học và duy trì chuỗi học để mở khóa." /> : badges.map((badge: any) => <View key={badge.id ?? badge.badgeCode} style={[s.card, s.row, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><MaterialIcons name="military-tech" size={36} color={colors.primary} /><View style={{ flex: 1 }}><Text style={[s.cardTitle, { color: colors.onSurface }]}>{badge.badgeName ?? badge.name}</Text><Text style={[s.muted, { color: colors.onSurfaceVariant }]}>{badge.description}</Text></View></View>)}</FeatureScreen>;
}
