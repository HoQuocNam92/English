import { VocabularyActivity } from '../../src/features/vocabulary/VocabularyActivity';
import { VocabularyRecommendations } from '../../src/features/vocabulary/VocabularyRecommendations';
import { matchesFilterOption } from '../../src/shared/utils/filter-options';
import { ClearFiltersButton } from '../../src/shared/ui/ClearFiltersButton';
import { Button, Tabs } from '../../src/shared/ui/primitives';
import { Text, TextInput, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { EmptyState, FeatureScreen } from '../../src/shared/ui/FeatureScreen';

type Taxonomy = { code: string; name: string };
type Word = { id: string; domain?: Taxonomy; level?: Taxonomy };
type Group = { id: string; domain: Taxonomy; level: Taxonomy; count: number };
type Dashboard = { stats: { learned: number; remembered: number; needsReview: number }; studyingLessons?: { id: string; title: string; totalWords: number; needsReviewCount: number; domain?: Taxonomy }[] };

export default function VocabularyDashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter(); const pathname = usePathname(); const exploring = pathname.endsWith('/explore');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [stats, firstPage] = await Promise.all([
        api.get<Dashboard>('/vocab-study/dashboard'),
        api.get<{ data: Word[]; meta?: { totalPages?: number } }>('/vocabulary?status=published&limit=100&page=1'),
      ]);
      const words = [...firstPage.data];
      for (let page = 2; page <= (firstPage.meta?.totalPages ?? 1); page++) {
        const response = await api.get<{ data: Word[] }>(`/vocabulary?status=published&limit=100&page=${page}`);
        words.push(...response.data);
      }
      const grouped = new Map<string, Group>();
      for (const word of words) {
        if (!word.domain || !word.level) continue;
        const id = `${word.domain.code}:${word.level.code}`;
        const existing = grouped.get(id);
        if (existing) existing.count++;
        else grouped.set(id, { id, domain: word.domain, level: word.level, count: 1 });
      }
      setDashboard(stats); setGroups([...grouped.values()]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải danh mục từ vựng.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const domains = useMemo(() => [...new Map(groups.map(group => [group.domain.code, group.domain])).values()], [groups]);
  const levels = useMemo(() => [...new Map(groups.map(group => [group.level.code, group.level])).values()], [groups]);
  const filtered = groups.filter(group => (!domain || group.domain.code === domain) && (!level || group.level.code === level) && matchesFilterOption(`${group.domain.name} ${group.level.name}`, search));
  const chips = (label: string, items: Taxonomy[], selected: string, select: (value: string) => void) => <View style={s.section}>
    <Text style={[s.label, { color: colors.onSurface }]}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{[{ code: '', name: 'Tất cả' }, ...items].map(item => <TouchableOpacity key={item.code} accessibilityRole="button" accessibilityState={{ selected: item.code === selected }} onPress={() => select(item.code)} style={[s.chip, { borderColor: colors.outlineVariant, backgroundColor: item.code === selected ? colors.primary : colors.surfaceContainerLowest }]}><Text style={{ color: item.code === selected ? colors.onPrimary : colors.onSurface }}>{item.name}</Text></TouchableOpacity>)}</ScrollView>
  </View>;
  return <FeatureScreen title="Từ vựng CNTT" subtitle="Học từ mới, ôn tập và khám phá chuyên ngành" loading={loading} error={error} onRetry={load}>
    <View style={s.section}><Tabs items={[{value:'studying',label:'Đang học'},{value:'explore',label:'Khám phá'}]} value={exploring ? 'explore' : 'studying'} onChange={value => router.push((value === 'explore' ? '/flashcards/explore' : '/flashcards/dashboard') as any)}/>
      {!exploring && <><View style={s.stats}>{([['Đã học', dashboard?.stats.learned], ['Đã nhớ', dashboard?.stats.remembered], ['Đến hạn ôn', dashboard?.stats.needsReview]] as const).map(([label, value]) => <TouchableOpacity key={label} onPress={() => router.push((label === 'Đến hạn ôn' ? '/flashcards?mode=review' : label === 'Đã nhớ' ? '/flashcards/history?period=all&rating=mastered' : '/flashcards/history?period=all') as any)} style={[s.stat, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}><Text style={[s.number, { color: colors.primary }]}>{value ?? 0}</Text><Text style={[s.statLabel, { color: colors.onSurfaceVariant }]}>{label}</Text></TouchableOpacity>)}</View>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/flashcards' as any)} style={[s.action, { backgroundColor: colors.primary }]}><MaterialIcons name="add-circle-outline" size={24} color="#fff" /><Text style={s.actionText}>Học từ mới hôm nay</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/flashcards?mode=review' as any)} style={[s.action, { backgroundColor: colors.primaryContainer }]}><MaterialIcons name="schedule" size={24} color={colors.primary} /><Text style={[s.actionText, { color: colors.onPrimaryContainer }]}>Ôn tập đến hạn ({dashboard?.stats.needsReview ?? 0})</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/flashcards/history' as any)} style={s.history}><Text style={[s.label, { color: colors.primary }]}>Xem từ đã học và lịch sử →</Text></TouchableOpacity>
      <VocabularyActivity />
      {!!dashboard?.studyingLessons?.length && <View style={s.section}><Text style={[s.heading, { color: colors.onSurface }]}>Bộ từ đang học ({dashboard.studyingLessons.length})</Text>{dashboard.studyingLessons.map(item => <View key={item.id} style={[s.group, { flexDirection: 'column', alignItems: 'stretch', backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}><Text style={[s.label, { color: colors.onSurface }]}>{item.title}</Text><Text>{item.totalWords} từ · {item.domain?.name || 'CNTT'} · Cần ôn tập: {item.needsReviewCount}</Text>{item.needsReviewCount > 0 && <Button onPress={() => router.push({ pathname: '/flashcards', params: { mode: 'review', sourceLessonId: item.id } } as any)}>Ôn ({item.needsReviewCount})</Button>}<Button mode="outlined" onPress={() => router.push({ pathname: '/flashcards/words', params: { sourceLessonId: item.id } } as any)}>{item.needsReviewCount > 0 ? 'Chi tiết' : 'Học tiếp'}</Button></View>)}</View>}
      <Button onPress={() => router.push('/flashcards?mode=quiz' as any)}>Kiểm tra từ đã học</Button>
      <Button onPress={() => router.push('/flashcards/explore' as any)}>Khám phá từ vựng</Button></>}
      <VocabularyRecommendations />
      {exploring && <><Text style={[s.heading, { color: colors.onSurface }]}>Khám phá từ vựng</Text>
      <TextInput accessibilityLabel="Tìm chuyên ngành hoặc trình độ" placeholder="Tìm chuyên ngành hoặc trình độ…" placeholderTextColor={colors.outline} value={search} onChangeText={setSearch} style={[s.search, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]} />
      {chips('Chuyên ngành', domains, domain, setDomain)}
      {chips('Trình độ', levels, level, setLevel)}
      <ClearFiltersButton onPress={() => { setSearch(''); setDomain(''); setLevel(''); }} />
      <Text style={{ color: colors.onSurfaceVariant }}>{filtered.length} nhóm từ vựng</Text>
      {filtered.map(group => <TouchableOpacity key={group.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/flashcards/words', params: { domainCode: group.domain.code, levelCode: group.level.code } } as any)} style={[s.group, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]}><View style={{ flex: 1 }}><Text style={[s.label, { color: colors.onSurface }]}>{group.domain.name}</Text><Text style={[s.groupMeta, { color: colors.onSurfaceVariant }]}>{group.level.name} · {group.count} từ</Text></View><MaterialIcons name="chevron-right" size={24} color={colors.primary} /></TouchableOpacity>)}
      {!filtered.length && <EmptyState icon="search-off" title="Không có nhóm từ phù hợp" detail="Thử đổi chuyên ngành, trình độ hoặc từ khóa tìm kiếm." />}</>}
    </View>
  </FeatureScreen>;
}
const s = StyleSheet.create({
  section: { gap: 12 }, stats: { flexDirection: 'row', gap: 8 }, stat: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 5 }, number: { fontSize: 25, fontWeight: '800' }, statLabel: { fontSize: 12, textAlign: 'center' },
  action: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, borderRadius: 12 }, actionText: { fontSize: 15, fontWeight: '700', color: '#fff', flexShrink: 1 }, history: { minHeight: 44, justifyContent: 'center' },
  heading: { fontSize: 19, fontWeight: '800', marginTop: 12 }, label: { fontSize: 14, fontWeight: '700' }, heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 }, day: { width: 16, height: 16, borderRadius: 3 },
  search: { minHeight: 48, padding: 12, borderWidth: 1, borderRadius: 12, fontSize: 15 }, chips: { gap: 8 }, chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderRadius: 24 }, group: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1 }, groupMeta: { marginTop: 6, fontSize: 13 },
});
