import { Text, Button, ListTools, Badge, controlStyles } from '../../src/shared/ui/primitives';
import { FeatureScreen, EmptyState } from '../../src/shared/ui/FeatureScreen';
import { useCallback, useRef, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { api } from '../../src/shared/api/api-client';
import { matchesFilterOption } from '../../src/shared/utils/filter-options';

type Certificate = { id: string; code: string; name: string; provider: string; description?: string; domains?: { domain?: { id: string; name: string } }[]; exams?: { id: string; title: string }[] };
export default function MobileCertificationsScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('');
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const changeSearch = (value: string) => { setSearch(value); setExpandedResults({}); };
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const sequence = useRef(0);
  const load = useCallback(async () => {
    const request = ++sequence.current; setError('');
    try {
      const [catalog, activity] = await Promise.all([api.get<any>('/certificates?activeOnly=true'), api.get<any>('/progress/me')]);
      if (request !== sequence.current) return;
      setCertificates(catalog?.data ?? catalog ?? []); setProgress(activity?.certProgress ?? []);
    } catch (cause: any) { if (request === sequence.current) setError(cause?.message || 'Không thể tải danh sách chứng chỉ.'); }
    finally { if (request === sequence.current) setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); return () => { ++sequence.current; }; }, [load]));
  const started = (certificateId: string) => progress.some(item => item.certificateId === certificateId && (item.hasStarted || item.completionPercent > 0));
  const filtered = certificates.filter(cert => (matchesFilterOption(`${cert.name} ${cert.code} ${cert.provider}`, search) || (cert.exams ?? []).some(exam => matchesFilterOption(exam.title, search))) && (!filter || started(cert.id) === (filter === 'started')));
  const open = (cert: Certificate, examId?: string) => router.push({ pathname: '/certifications/[id]', params: { id: cert.id, ...(examId ? { tab: 'exams', examId } : {}) } } as any);
  return <FeatureScreen title="Luyện thi chứng chỉ" embedded={embedded} loading={loading} error={error} onRetry={load}>
    <ListTools search={search} onSearch={changeSearch} placeholder="Tìm chứng chỉ hoặc bài kiểm tra…" filters={[{ value: '', label: 'Tất cả tiến độ' }, { value: 'started', label: 'Đã bắt đầu học' }, { value: 'new', label: 'Chưa bắt đầu' }]} value={filter} onFilter={setFilter} />
    <View style={{ gap: 16 }}>{filtered.map(cert => {
      const percent = Math.round(progress.find(item => item.certificateId === cert.id)?.completionPercent ?? 0);
      const matchedExams = search.trim() ? (cert.exams ?? []).filter(exam => matchesFilterOption(exam.title, search)) : [];
      return <View key={cert.id} style={[controlStyles.card, { gap: 14 }]}>
        <Text style={{ fontSize: 13, color: '#3525cd', fontWeight: '700' }}>{cert.code}</Text>
        <Text accessibilityRole="header" style={{ fontSize: 21, fontWeight: '700' }}>{cert.name}</Text>
        <Text>{cert.provider}</Text>
        {!!cert.description && <Text>{cert.description}</Text>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(cert.domains ?? []).map(item => item.domain && <Badge key={item.domain.id}>{item.domain.name}</Badge>)}</View>
        {matchedExams.length > 0 && <View style={{ gap: 10 }}><Text style={{ fontWeight: '700' }}>Bài kiểm tra phù hợp</Text>{(expandedResults[cert.id] ? matchedExams : matchedExams.slice(0, 3)).map(exam => <Button key={exam.id} mode="outlined" icon="assignment" onPress={() => open(cert, exam.id)}>{exam.title}</Button>)}{matchedExams.length > 3 && <Button mode="text" onPress={() => setExpandedResults(previous => ({ ...previous, [cert.id]: !previous[cert.id] }))}>{expandedResults[cert.id] ? 'Thu gọn' : `Xem thêm ${matchedExams.length - 3} bài kiểm tra`}</Button>}</View>}
        <Text>{started(cert.id) ? 'Đã bắt đầu' : 'Chưa học'} · {percent}% hoàn thành</Text>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }} style={{ height: 8, borderRadius: 4, backgroundColor: '#e2e8f0', overflow: 'hidden' }}><View style={{ height: 8, width: `${percent}%`, backgroundColor: '#047857' }} /></View>
        <Button style={started(cert.id) ? { backgroundColor: '#047857' } : undefined} icon="route" onPress={() => open(cert, matchedExams.length === 1 ? matchedExams[0].id : undefined)}>{matchedExams.length === 1 ? 'Mở bài kiểm tra' : started(cert.id) ? 'Tiếp tục ôn' : 'Xem lộ trình'}</Button>
      </View>;
    })}
    {!filtered.length && <EmptyState icon="workspace-premium" title={certificates.length ? filter === 'started' ? 'Bạn chưa bắt đầu chứng chỉ nào' : 'Không có chứng chỉ phù hợp' : 'Chưa có chứng chỉ đang hoạt động'} detail={certificates.length ? 'Thử đổi từ khóa hoặc xóa bộ lọc để xem các chứng chỉ khác.' : 'Chứng chỉ sẽ xuất hiện tại đây khi được xuất bản.'} />}</View>
  </FeatureScreen>;
}
