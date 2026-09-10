import { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { EmptyState, FeatureScreen, featureStyles as s } from '../../src/shared/ui/FeatureScreen';

export default function ReadingLabScreen() {
  const router = useRouter(); const { colors } = useTheme();
  const [items, setItems] = useState<any[]>([]); const [categories, setCategories] = useState<any[]>([]); const [domainId, setDomainId] = useState(''); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const q = new URLSearchParams({ limit: '30', ...(domainId ? { domainId } : {}), ...(search.trim() ? { search: search.trim() } : {}) }); const [articles, cats]: any[] = await Promise.all([api.get(`/reading-lab/articles?${q}`), api.get('/reading-lab/categories')]); setItems(articles.items ?? articles.data?.items ?? []); setCategories(cats.data ?? cats ?? []); } catch (e: any) { setError(e.message || 'Không thể tải Reading Lab.'); } finally { setLoading(false); } }, [domainId, search]);
  useEffect(() => { load(); }, [load]);
  return <FeatureScreen title="Reading Lab" subtitle="Luyện đọc tài liệu tiếng Anh công nghệ" loading={loading} error={error} onRetry={load}>
    <View style={[s.row, { borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 }]}><MaterialIcons name="search" size={20} color={colors.outline} /><TextInput value={search} onChangeText={setSearch} onSubmitEditing={load} placeholder="Tìm bài đọc..." placeholderTextColor={colors.outline} style={{ flex: 1, color: colors.onSurface, paddingVertical: 12 }} /></View>
    <View style={[s.row, { flexWrap: 'wrap', marginBottom: 12 }]}><TouchableOpacity onPress={() => setDomainId('')} style={[s.chip, { backgroundColor: !domainId ? colors.primary : colors.surface }]}><Text style={{ color: !domainId ? '#fff' : colors.onSurface }}>Tất cả</Text></TouchableOpacity>{categories.map(c => <TouchableOpacity key={c.id} onPress={() => setDomainId(c.id)} style={[s.chip, { backgroundColor: domainId === c.id ? colors.primary : colors.surface }]}><Text style={{ color: domainId === c.id ? '#fff' : colors.onSurface }}>{c.name}</Text></TouchableOpacity>)}</View>
    {!items.length ? <EmptyState icon="article" title="Chưa có bài đọc" detail="Không tìm thấy bài phù hợp với bộ lọc hiện tại." /> : items.map(item => <TouchableOpacity key={item.id} onPress={() => router.push(`/lessons/${item.id}` as any)} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Text style={[s.cardTitle, { color: colors.onSurface }]}>{item.title}</Text><Text style={[s.muted, { color: colors.onSurfaceVariant }]} numberOfLines={3}>{item.summary}</Text><Text style={{ color: colors.primary, fontWeight: '700', marginTop: 10 }}>{item.domain?.name} · {item.estimatedMinutes} phút</Text></TouchableOpacity>)}
  </FeatureScreen>;
}
