import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import * as Speech from 'expo-speech';
import { api } from '../../src/shared/api/api-client';
import { FeatureScreen } from '../../src/shared/ui/FeatureScreen';
import { FilterSelect } from '../../src/shared/ui/FilterSelect';
import { Text, Button, TextInput, controlStyles } from '../../src/shared/ui/primitives';

type Word = { id: string; term: string; pronunciationIpa?: string; partOfSpeech?: string; definitionVi?: string; definitionEn?: string; studyStatus?: string; examples?: { sentenceEn: string; translationVi?: string }[] };
export default function Words() {
  const params = useLocalSearchParams<{ domainCode?: string; levelCode?: string; sourceLessonId?: string }>(); const router = useRouter();
  const [words, setWords] = useState<Word[]>([]); const [title, setTitle] = useState('Danh sách từ vựng');
  const [stats, setStats] = useState<{ total: number; remembered: number; needsReview: number; newCount: number } | null>(null);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0); const [limit, setLimit] = useState('20');
  const [query, setQuery] = useState(''); const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
  useEffect(() => { setPage(1); }, [params.domainCode, params.levelCode, params.sourceLessonId]);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError('');
    const load = async () => {
      try {
        let resultWords: Word[]; let pageCount: number; let count: number;
        if (params.sourceLessonId) {
          const [lesson, session] = await Promise.all([api.get<{ title: string }>(`/lessons/${encodeURIComponent(params.sourceLessonId)}`), api.get<{ words: Word[] }>(`/vocab-study/session?sourceLessonId=${encodeURIComponent(params.sourceLessonId)}&onlyNew=false`)]);
          if (!active) return;
          const all = session.words ?? [];
          setTitle(lesson.title); setStats({ total: all.length, remembered: all.filter(word => word.studyStatus === 'mastered').length, needsReview: all.filter(word => word.studyStatus === 'learning').length, newCount: all.filter(word => word.studyStatus === 'new').length });
          const filtered = all.filter(word => `${word.term} ${word.definitionVi ?? ''} ${word.definitionEn ?? ''}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
          count = filtered.length; pageCount = Math.max(1, Math.ceil(count / Number(limit))); resultWords = filtered.slice((page - 1) * Number(limit), page * Number(limit));
        } else {
          const qs = new URLSearchParams({ status: 'published', limit, page: String(page), search });
          if (params.domainCode) qs.set('domainCode', params.domainCode); if (params.levelCode) qs.set('levelCode', params.levelCode);
          const result = await api.get<{ data: Word[]; meta?: { totalPages?: number; total?: number } }>(`/vocabulary?${qs}`);
          if (!active) return;
          setTitle('Danh sách từ vựng'); setStats(null); resultWords = result.data ?? []; pageCount = Math.max(1, result.meta?.totalPages ?? 1); count = result.meta?.total ?? resultWords.length;
        }
        if (active) { setWords(resultWords); setPages(pageCount); setTotal(count); if (page > pageCount) setPage(pageCount); }
      } catch (cause: any) { if (active) setError(cause.message || 'Không thể tải từ vựng.'); }
      finally { if (active) setLoading(false); }
    };
    void load(); return () => { active = false; };
  }, [params.domainCode, params.levelCode, params.sourceLessonId, page, search, limit, retry]));
  const study = (mode?: string) => router.push({ pathname: '/flashcards', params: { ...params, ...(mode ? { mode } : {}) } } as any);
  return <FeatureScreen title={title} loading={false}><View style={{ gap: 12 }}>
    {stats && <View style={[controlStyles.card, { gap: 6 }]}><Text>{stats.total} từ trong bộ</Text><Text>Đã nhớ: {stats.remembered} · Cần ôn tập: {stats.needsReview} · Chưa học: {stats.newCount}</Text></View>}
    <View style={{ flexDirection: 'row', gap: 8 }}><TextInput accessibilityLabel="Tìm từ vựng" value={query} onChangeText={setQuery} placeholder="Tìm từ vựng" style={{ flex: 1, minWidth: 0 }} /><Button onPress={() => { setSearch(query); setPage(1); }}>Tìm</Button></View>
    <Button onPress={() => study()}>Học từ vựng</Button><Button mode="outlined" onPress={() => study('review')}>Ôn tập đến hạn</Button>{params.sourceLessonId && <Button mode="outlined" onPress={() => study('quiz')}>Kiểm tra từ đã học</Button>}
    <FilterSelect label="Số từ mỗi trang" value={limit} onChange={value => { setLimit(value); setPage(1); }} items={['10', '20', '30', '40'].map(value => ({ value, label: value }))} />
    {error ? <><Text accessibilityRole="alert">{error}</Text><Button onPress={() => setRetry(value => value + 1)}>Thử lại</Button></> : loading ? <Text>Đang tải…</Text> : words.map(word => <View key={word.id} style={[controlStyles.card, { gap: 8 }]}>
      <Text style={{ fontWeight: '700', fontSize: 18 }}>{word.term}</Text><Text>{word.pronunciationIpa} {word.partOfSpeech}</Text><Text>{word.definitionVi}</Text><Text selectable>{word.definitionEn}</Text>
      {!!word.studyStatus && <Text>{word.studyStatus === 'mastered' ? 'Đã nhớ' : word.studyStatus === 'learning' ? 'Đang học' : 'Chưa học'}</Text>}
      {word.examples?.map((example, index) => <View key={index} style={{ gap: 4 }}><Text selectable>{example.sentenceEn}</Text>{!!example.translationVi && <Text>{example.translationVi}</Text>}</View>)}
      <Button mode="outlined" onPress={() => { Speech.stop(); Speech.speak(word.term, { language: 'en-US' }); }}>Phát âm</Button>
      {word.studyStatus && word.studyStatus !== 'new' && <Button mode="outlined" onPress={() => router.push({ pathname: '/flashcards', params: { mode: 'preview', vocabularyId: word.id } } as any)}>Xem lại flashcard</Button>}
    </View>)}
    {!loading && !error && !words.length && <Text>Không có từ phù hợp.</Text>}
    <Text>{total} từ phù hợp</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={loading || page <= 1} onPress={() => setPage(value => value - 1)}>Trước</Button><Text>{page}/{pages}</Text><Button disabled={loading || page >= pages} onPress={() => setPage(value => value + 1)}>Sau</Button></View>
  </View></FeatureScreen>;
}
