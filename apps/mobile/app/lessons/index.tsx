import { Text } from '../../src/shared/ui/primitives';
import { Searchbar, SegmentedButtons, Card, Portal, Dialog, Button as PaperButton, ActivityIndicator, TouchableRipple } from 'react-native-paper';
import { FeatureScreen, EmptyState } from '../../src/shared/ui/FeatureScreen';
import { filterLessons, type LessonProfile } from '../../../../packages/shared-kernel/src/lesson-catalog';
import { FilterSelect } from '../../src/shared/ui/FilterSelect';
import { Button, Tabs } from '../../src/shared/ui/primitives';
import { LearningActivities } from '../../src/features/learning/LearningActivities';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/shared/api/api-client';

const TYPES: Record<string, { label: string; detail: string; action: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  terminology: { label: 'Thuật ngữ chuyên ngành', detail: 'Định nghĩa, ngữ cảnh và cách dùng', action: 'Khám phá thuật ngữ', icon: 'translate' },
  technical_reading: { label: 'Đọc hiểu kỹ thuật', detail: 'Tài liệu, ý chính và câu hỏi đọc hiểu', action: 'Bắt đầu đọc', icon: 'article' },
  api_documentation: { label: 'Tài liệu API', detail: 'Endpoint, request, response và lỗi', action: 'Phân tích API', icon: 'api' },
  system_design: { label: 'System Design', detail: 'Yêu cầu, kiến trúc và đánh đổi', action: 'Phân tích thiết kế', icon: 'account-tree' },
  case_study: { label: 'Case study thực tế', detail: 'Bối cảnh, nhiệm vụ và giải pháp', action: 'Xử lý tình huống', icon: 'work' },
};
export default function LessonList({ embedded = false }: { embedded?: boolean }) {
  const { height: windowHeight } = useWindowDimensions();
  const router = useRouter(); const params = useLocalSearchParams<{domainCode?: string; type?: string}>();
  const [profile, setProfile] = useState<LessonProfile | null>(null); const [scope, setScope] = useState('path'); const [domainCode, setDomainCode] = useState(params.domainCode || ''); const [certificateId, setCertificateId] = useState(''); const [vocabulary, setVocabulary] = useState('all');
  const [items,setItems]=useState<any[]>([]); const [query,setQuery]=useState(''); const [type,setType]=useState(params.type && TYPES[params.type] ? params.type : ''); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(() => { setType(params.type && TYPES[params.type] ? params.type : ''); }, [params.type]);
  const load=async()=>{setLoading(true);setError('');try{
 const [learner, results] = await Promise.all([api.get<LessonProfile>('/learner-profiles/me'), Promise.all(Object.keys(TYPES).map(async lessonType => {
  const all: any[] = []; let pages = 1;
  for (let page=1; page<=pages; page++) { const qs = new URLSearchParams({ limit:'100',status:'published',type:lessonType,page:String(page) }); const response = await api.get<any>(`/lessons?${qs}`); all.push(...(response.data ?? response ?? [])); pages = response.meta?.totalPages ?? 1; }
  return all;
 }))]); setProfile(learner); setItems(results.flat());
 }catch(e:any){setError(e.message??'Không thể tải bài học');}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const filtered=useMemo(()=>filterLessons(items.filter(item => TYPES[item.type] && (!type || item.type === type)),profile,{ query, scope, domainCode, certificateId, vocabulary }),[items,profile,query,type,scope,domainCode,certificateId,vocabulary]);
 const domains = [...new Map(items.filter(item => item.domain).map(item => [item.domain.code, item.domain])).values()];
 const certificates = [...new Map(items.flatMap(item => item.certificates ?? []).map(link => [link.certificate.id, link.certificate])).values()];
 const words = [...new Map(items.flatMap(item => item.vocabularies ?? []).map(link => [link.vocabulary.id, link.vocabulary])).values()];
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = Number(Boolean(domainCode)) + Number(Boolean(certificateId)) + Number(vocabulary !== 'all');
  const resetFilters = () => { setDomainCode(''); setCertificateId(''); setVocabulary('all'); };
  return <FeatureScreen title="Bài học" subtitle="Kiến thức công nghệ, từng bước mỗi ngày" embedded={embedded}>
    <Searchbar accessibilityLabel="Tìm bài học" placeholder="Tìm chủ đề bạn muốn học…" value={query} onChangeText={setQuery} style={s.search} inputStyle={{ fontSize: 15, minHeight: 52 }} />
    <View style={s.scope}><SegmentedButtons value={scope} onValueChange={setScope} buttons={[{ value: 'path', label: 'Lộ trình của tôi' }, { value: 'all', label: 'Tất cả bài học' }]} /></View>
    <View style={s.categoryHeader}><Text style={s.eyebrow}>KHÁM PHÁ CHUYÊN ĐỀ</Text><PaperButton mode="text" icon="tune-variant" onPress={() => setFiltersOpen(true)} compact labelStyle={{ fontSize: 14 }}>Bộ lọc{activeFilters ? ` (${activeFilters})` : ''}</PaperButton></View>
    <Tabs value={type} onChange={setType} items={[{ value: '', label: 'Tất cả' }, ...Object.entries(TYPES).map(([value, item]) => ({ value, label: item.label }))]} />
    {activeFilters > 0 && <View style={s.filterSummary}><Text style={s.secondary}>{activeFilters} bộ lọc đang áp dụng</Text><PaperButton mode="text" compact onPress={resetFilters}>Xóa bộ lọc</PaperButton></View>}
    {scope === 'path' && <TouchableRipple onPress={() => router.push('/profile/edit' as any)} style={s.pathHint} borderless><View style={s.hintRow}><MaterialIcons name="route" size={20} color="#6054c8" /><Text style={s.hintText}>Nội dung phù hợp với mục tiêu của bạn</Text><MaterialIcons name="chevron-right" size={20} color="#6054c8" /></View></TouchableRipple>}
    <View style={s.sectionHeader}><View style={{ flex: 1 }}><Text accessibilityRole="header" style={s.sectionTitle}>{type ? TYPES[type].label : 'Khám phá bài học'}</Text><Text style={s.secondary}>{loading ? 'Đang tìm bài học…' : `${filtered.length} bài học phù hợp`}</Text></View><View style={s.countBadge}><MaterialIcons name="auto-stories" size={22} color="#6054c8" /></View></View>
    {type && <Text style={s.trackDetail}>{TYPES[type].detail}</Text>}
    {loading ? <ActivityIndicator style={{ marginVertical: 40 }} /> : error ? <View style={s.state}><Text accessibilityRole="alert" style={{ color: '#ba1a1a' }}>{error}</Text><Button onPress={() => void load()}>Thử lại</Button></View> : <View style={s.cards}>
      {filtered.map(x => <Card key={x.id} mode="outlined" style={s.card} onPress={() => router.push(`/lessons/${x.id}` as any)} accessibilityLabel={`Học bài ${x.title}`}>
        <Card.Content style={{ gap: 14, padding: 20 }}>
          <View style={s.cardTop}><View style={s.icon}><MaterialIcons name={TYPES[x.type].icon} size={24} color="#6054c8" /></View><View style={{ flex: 1, minWidth: 0 }}><Text style={s.category}>{TYPES[x.type].label}</Text><Text style={s.secondary}>{x.domain?.name || 'Chuyên ngành CNTT'}</Text></View></View>
          <Text style={s.title}>{x.title}</Text>
          {x.summary ? <Text numberOfLines={3} style={s.summary}>{x.summary}</Text> : null}
          <View style={s.metaRow}>{x.level?.name ? <View style={s.level}><Text style={s.levelText}>{x.level.name}</Text></View> : null}<View style={s.duration}><MaterialIcons name="schedule" size={16} color="#59657c" /><Text style={s.secondary}>{x.estimatedMinutes || 15} phút</Text></View></View>
          {Boolean(x.keyConcepts?.length) && <View style={s.concepts}>{x.keyConcepts?.slice(0, 3).map((concept: string, index: number) => <View key={`${index}-${concept}`} style={s.concept}><Text style={s.conceptText}>{concept}</Text></View>)}</View>}
          <View style={s.cardFooter}><Text style={s.action}>{TYPES[x.type].action}</Text><View style={s.arrow}><MaterialIcons name="arrow-forward" size={20} color="#6054c8" /></View></View>
        </Card.Content>
      </Card>)}
      {!filtered.length && <View style={s.state}><EmptyState icon="search" title="Chưa tìm thấy bài học" detail="Thử từ khóa khác hoặc mở rộng bộ lọc để khám phá thêm nội dung." />{activeFilters > 0 && <Button mode="outlined" onPress={resetFilters}>Xóa bộ lọc</Button>}{scope === 'path' && <Button onPress={() => setScope('all')}>Xem tất cả bài học</Button>}</View>}
    </View>}
    {!type && scope === 'all' && <View style={{ marginTop: 28 }}><LearningActivities /></View>}
    <Portal><Dialog visible={filtersOpen} onDismiss={() => setFiltersOpen(false)} style={s.dialog}>
      <Dialog.Title>Lọc bài học</Dialog.Title>
      <Dialog.ScrollArea style={{ maxHeight: windowHeight * 0.5, paddingHorizontal: 0 }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.filterFields}>
        <FilterSelect label="Lĩnh vực" value={domainCode} onChange={setDomainCode} items={[{ value: '', label: 'Tất cả lĩnh vực' }, ...domains.map(domain => ({ value: domain.code, label: domain.name }))]} />
        <FilterSelect label="Chứng chỉ" value={certificateId} onChange={setCertificateId} items={[{ value: '', label: 'Tất cả chứng chỉ' }, ...certificates.map(cert => ({ value: cert.id, label: cert.name }))]} />
        <FilterSelect label="Từ vựng" value={vocabulary} onChange={setVocabulary} items={[{ value: 'all', label: 'Tất cả từ vựng' }, { value: 'with', label: 'Có từ vựng' }, { value: 'without', label: 'Không có từ vựng' }, ...words.map(word => ({ value: word.id, label: word.term }))]} />
      </ScrollView></Dialog.ScrollArea>
      <Dialog.Actions style={{ padding: 16, gap: 8, flexWrap: 'wrap' }}><Button mode="text" onPress={resetFilters}>Đặt lại</Button><Button onPress={() => setFiltersOpen(false)}>Xem kết quả</Button></Dialog.Actions>
    </Dialog></Portal>
  </FeatureScreen>;
}
const s = StyleSheet.create({
  search: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e4e8f1' }, scope: { marginTop: 20, marginBottom: 12 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, color: '#59657c', flexShrink: 1 },
  pathHint: { backgroundColor: '#eeecff', borderRadius: 14, marginTop: 16, overflow: 'hidden' }, hintRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }, hintText: { flex: 1, fontSize: 14, color: '#5146a5' },
  filterSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', paddingTop: 8 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28, marginBottom: 18 }, sectionTitle: { fontSize: 23, fontWeight: '700', color: '#17213a', marginBottom: 4 }, countBadge: { padding: 12, borderRadius: 14, backgroundColor: '#eeecff' },
  cards: { gap: 16 }, card: { borderColor: '#e4e8f1', borderRadius: 22, backgroundColor: '#ffffff', overflow: 'hidden' }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#eeecff', alignItems: 'center', justifyContent: 'center' }, category: { fontSize: 14, fontWeight: '600', color: '#6054c8', marginBottom: 2 }, title: { fontSize: 19, fontWeight: '700', color: '#17213a', lineHeight: 28 }, summary: { fontSize: 15, lineHeight: 23, color: '#59657c' }, secondary: { fontSize: 13, color: '#59657c' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }, level: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#f0f2f8' }, levelText: { fontSize: 13, fontWeight: '600', color: '#59657c' }, duration: { flexDirection: 'row', alignItems: 'center', gap: 5 }, concepts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, concept: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f7f8fc', maxWidth: '100%' }, conceptText: { fontSize: 13, color: '#59657c' }, cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: '#eef0f5', paddingTop: 14 }, action: { flex: 1, fontSize: 15, color: '#6054c8', fontWeight: '700' }, arrow: { borderRadius: 12, padding: 8, backgroundColor: '#eeecff' },
  trackDetail: { fontSize: 15, color: '#59657c', marginBottom: 16 }, state: { alignItems: 'center', gap: 12, paddingVertical: 24 }, dialog: { backgroundColor: '#f7f8fc', borderRadius: 24 }, filterFields: { gap: 12, padding: 20 },
});
