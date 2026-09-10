import { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { EmptyState, FeatureScreen, featureStyles as s } from '../../src/shared/ui/FeatureScreen';

export default function FlashcardsScreen() {
  const { colors } = useTheme(); const [cards, setCards] = useState<any[]>([]); const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const raw: any = await api.get('/vocabulary?status=published&limit=100'); setCards(raw.items ?? raw.data ?? raw ?? []); } catch (e: any) { setError(e.message || 'Không thể tải flashcard.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]); const card = cards[index];
  const move = (step: number) => { setIndex(v => (v + step + cards.length) % cards.length); setFlipped(false); };
  return <FeatureScreen title="Flashcards" subtitle={cards.length ? `${index + 1}/${cards.length}` : 'Ôn từ vựng'} loading={loading} error={error} onRetry={load}>
    {!card ? <EmptyState icon="style" title="Chưa có flashcard" detail="Kho từ vựng chưa có nội dung đã xuất bản." /> : <><TouchableOpacity activeOpacity={0.9} onPress={() => setFlipped(v => !v)} style={[s.card, { minHeight: 330, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><MaterialIcons name={flipped ? 'translate' : 'record-voice-over'} size={42} color={colors.primary} /><Text style={{ fontSize: flipped ? 20 : 31, fontWeight: '900', color: colors.onSurface, textAlign: 'center', marginTop: 20 }}>{flipped ? card.definitionVi : card.term}</Text><Text style={[s.muted, { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 12 }]}>{flipped ? card.definitionEn : card.pronunciationIpa || 'Chạm để xem nghĩa'}</Text>{flipped && card.examples?.[0] ? <Text style={{ color: colors.primary, marginTop: 20, textAlign: 'center', fontStyle: 'italic' }}>{card.examples[0].sentenceEn}</Text> : null}</TouchableOpacity><View style={[s.row, { justifyContent: 'space-between' }]}><TouchableOpacity onPress={() => move(-1)} style={[s.button, { backgroundColor: colors.surface }]}><Text style={{ color: colors.onSurface }}>← Trước</Text></TouchableOpacity><TouchableOpacity onPress={() => setFlipped(v => !v)} style={[s.button, { backgroundColor: colors.primary }]}><Text style={{ color: '#fff', fontWeight: '800' }}>Lật thẻ</Text></TouchableOpacity><TouchableOpacity onPress={() => move(1)} style={[s.button, { backgroundColor: colors.surface }]}><Text style={{ color: colors.onSurface }}>Sau →</Text></TouchableOpacity></View></>}
  </FeatureScreen>;
}
