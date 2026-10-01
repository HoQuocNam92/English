import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { FeatureScreen, EmptyState } from '../../src/shared/ui/FeatureScreen';

const PERIODS = [['day', 'Hôm nay'], ['month', 'Tháng này'], ['year', 'Năm nay'], ['all', 'Tất cả']] as const;
const RATINGS = [['all', 'Mọi mức'], ['easy', 'Dễ'], ['medium', 'Trung bình'], ['hard', 'Khó'], ['mastered', 'Đã biết']] as const;

export default function FlashcardHistoryScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState('month');
  const [rating, setRating] = useState('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const result = await api.get<any[]>(`/vocab-study/history?period=${period}&rating=${rating}`);
      setItems(Array.isArray(result) ? result : []);
    } catch (cause: any) { setError(cause?.message || 'Không thể tải từ đã học.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [period, rating]);

  return <FeatureScreen title="Từ đã học" subtitle="Lọc theo thời gian và độ khó" loading={false} error={error} onRetry={load}>
    <Text style={[styles.label, { color: colors.onSurface }]}>Thời gian</Text>
    <View style={styles.chips}>{PERIODS.map(([value, label]) => <TouchableOpacity key={value} onPress={() => setPeriod(value)} style={[styles.chip, { borderColor: colors.outlineVariant }, period === value && { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={[styles.chipText, { color: period === value ? '#fff' : colors.onSurfaceVariant }]}>{label}</Text></TouchableOpacity>)}</View>
    <Text style={[styles.label, { color: colors.onSurface }]}>Độ khó gần nhất</Text>
    <View style={styles.chips}>{RATINGS.map(([value, label]) => <TouchableOpacity key={value} onPress={() => setRating(value)} style={[styles.chip, { borderColor: colors.outlineVariant }, rating === value && { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={[styles.chipText, { color: rating === value ? '#fff' : colors.onSurfaceVariant }]}>{label}</Text></TouchableOpacity>)}</View>
    {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : items.length === 0 ? <EmptyState icon="filter-alt-off" title="Không có từ phù hợp" detail="Hãy đổi bộ lọc hoặc hoàn thành một phiên học mới." /> : <View style={styles.list}>{items.map(item => <View key={item.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><View style={styles.wordIcon}><MaterialIcons name="translate" size={20} color={colors.primary} /></View><View style={styles.content}><Text style={[styles.term, { color: colors.onSurface }]} numberOfLines={1}>{item.vocabulary?.term}</Text><Text style={[styles.definition, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{item.vocabulary?.definitionVi}</Text></View><View style={styles.meta}><Text style={[styles.rating, { color: colors.primary }]}>{item.lastRating === 'easy' ? 'Dễ' : item.lastRating === 'medium' ? 'Trung bình' : item.lastRating === 'hard' ? 'Khó' : item.lastRating === 'mastered' ? 'Đã biết' : 'Đã học'}</Text><Text style={[styles.date, { color: colors.outline }]}>{item.lastReviewAt ? new Date(item.lastReviewAt).toLocaleDateString('vi-VN') : ''}</Text></View></View>)}</View>}
  </FeatureScreen>;
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontSize: 12, fontWeight: '700' },
  list: { gap: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderRadius: 12 },
  wordIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0 }, term: { fontSize: 14, fontWeight: '800' }, definition: { fontSize: 12, marginTop: 2 },
  meta: { alignItems: 'flex-end' }, rating: { fontSize: 11, fontWeight: '800' }, date: { fontSize: 10, marginTop: 3 },
});
