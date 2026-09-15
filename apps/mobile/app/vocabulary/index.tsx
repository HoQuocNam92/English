import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/shared/api/api-client';
import { EmptyState, FeatureScreen, featureStyles as s } from '../../src/shared/ui/FeatureScreen';
import { useTheme } from '../../src/shared/store/theme-context';

interface VocabularyItem {
  id: string;
  term: string;
  pronunciationIpa?: string;
  partOfSpeech?: string;
  definitionEn: string;
  definitionVi: string;
  domain?: { name: string };
  level?: { name: string };
  examples?: Array<{ sentenceEn: string; translationVi?: string }>;
}

export default function VocabularyLibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ domainCode?: string }>();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const query = new URLSearchParams({ status: 'published', limit: '100' });
      if (params.domainCode) query.set('domainCode', params.domainCode);
      if (submittedSearch) query.set('search', submittedSearch);
      const response: any = await api.get(`/vocabulary?${query.toString()}`);
      setItems(response?.data ?? response?.items ?? []);
    } catch (cause: any) {
      setError(cause?.message || 'Không thể tải kho từ vựng.');
    } finally { setLoading(false); }
  }, [params.domainCode, submittedSearch]);

  useEffect(() => { void load(); }, [load]);

  return (
    <FeatureScreen title="Kho từ vựng IT" subtitle={`${items.length} thuật ngữ đã xuất bản`} loading={loading} error={error} onRetry={load}>
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <MaterialIcons name="search" size={20} color={colors.outline} />
        <TextInput value={search} onChangeText={setSearch} onSubmitEditing={() => setSubmittedSearch(search.trim())} returnKeyType="search" placeholder="Tìm từ hoặc định nghĩa..." placeholderTextColor={colors.outline} style={[styles.searchInput, { color: colors.onSurface }]} />
        <TouchableOpacity onPress={() => setSubmittedSearch(search.trim())}><Text style={{ color: colors.primary, fontWeight: '800' }}>Tìm</Text></TouchableOpacity>
      </View>

      {!items.length ? <EmptyState icon="translate" title="Chưa có từ vựng" detail="Không tìm thấy thuật ngữ phù hợp với bộ lọc hiện tại." /> : items.map(item => (
        <TouchableOpacity key={item.id} onPress={() => router.push('/flashcards' as any)} activeOpacity={0.85} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.term, { color: colors.onSurface }]}>{item.term}</Text>
              {!!item.pronunciationIpa && <Text style={{ color: colors.primary }}>{item.pronunciationIpa}</Text>}
            </View>
            {!!item.partOfSpeech && <Text style={[styles.badge, { color: colors.primary, backgroundColor: `${colors.primary}12` }]}>{item.partOfSpeech}</Text>}
          </View>
          <Text style={[styles.definitionVi, { color: colors.onSurface }]}>{item.definitionVi}</Text>
          <Text style={[s.muted, { color: colors.onSurfaceVariant }]}>{item.definitionEn}</Text>
          {!!item.examples?.[0] && <View style={[styles.example, { borderLeftColor: colors.primary }]}><Text style={{ color: colors.onSurface, fontStyle: 'italic' }}>{item.examples[0].sentenceEn}</Text>{!!item.examples[0].translationVi && <Text style={[s.muted, { color: colors.onSurfaceVariant }]}>{item.examples[0].translationVi}</Text>}</View>}
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{item.domain?.name || 'Tổng hợp'} · {item.level?.name || 'Mọi trình độ'}</Text>
        </TouchableOpacity>
      ))}
    </FeatureScreen>
  );
}

const styles = StyleSheet.create({
  searchBox: { height: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  term: { fontSize: 19, fontWeight: '900' },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, fontSize: 11, fontWeight: '700' },
  definitionVi: { fontSize: 15, fontWeight: '700', marginTop: 10, marginBottom: 4 },
  example: { borderLeftWidth: 3, paddingLeft: 10, marginVertical: 10, gap: 3 },
});
