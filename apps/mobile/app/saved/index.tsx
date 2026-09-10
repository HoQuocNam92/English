import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { EmptyState, FeatureScreen, featureStyles as s } from '../../src/shared/ui/FeatureScreen';

export default function SavedVocabularyScreen() {
  const { colors } = useTheme(); const [items, setItems] = useState<any[]>([]); const [notes, setNotes] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); try { const raw: any = await api.get('/ai-chat/saved-vocabulary'); const list = raw.items ?? raw.data ?? raw ?? []; setItems(list); setNotes(Object.fromEntries(list.map((x: any) => [x.id, x.note ?? '']))); setError(''); } catch (e: any) { setError(e.message || 'Không thể tải từ đã lưu.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const saveNote = async (id: string) => { try { await api.post(`/ai-chat/saved-vocabulary/${id}/note`, { note: notes[id] || '' }); Alert.alert('Đã lưu', 'Ghi chú đã được cập nhật.'); } catch (e: any) { Alert.alert('Lỗi', e.message); } };
  return <FeatureScreen title="Từ đã lưu" subtitle="Từ vựng do AI Coach gợi ý" loading={loading} error={error} onRetry={load}>{!items.length ? <EmptyState icon="bookmark-border" title="Chưa lưu từ nào" detail="Bạn có thể lưu từ khi học cùng AI Coach." /> : items.map(item => <View key={item.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Text style={[s.cardTitle, { color: colors.onSurface }]}>{item.term}{item.pronunciation ? ` · ${item.pronunciation}` : ''}</Text><Text style={[s.muted, { color: colors.onSurfaceVariant }]}>{item.meaningVi}</Text>{item.example ? <Text style={{ color: colors.primary, fontStyle: 'italic', marginTop: 8 }}>{item.example}</Text> : null}<TextInput value={notes[item.id]} onChangeText={v => setNotes(n => ({ ...n, [item.id]: v }))} placeholder="Thêm ghi chú..." placeholderTextColor={colors.outline} style={{ color: colors.onSurface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 9, padding: 10, marginTop: 12 }} /><TouchableOpacity onPress={() => saveNote(item.id)} style={[s.button, { backgroundColor: colors.primary, marginTop: 8 }]}><Text style={{ color: '#fff', fontWeight: '700' }}>Lưu ghi chú</Text></TouchableOpacity></View>)}</FeatureScreen>;
}
