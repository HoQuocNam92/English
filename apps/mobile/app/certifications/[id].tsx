import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AppState, View } from 'react-native';
import { certificateProgressExplanation } from '../../../../packages/shared-kernel/src/lesson-presentation';
import { FeatureScreen, EmptyState } from '../../src/shared/ui/FeatureScreen';
import { Badge, Button, Tabs, Text, controlStyles } from '../../src/shared/ui/primitives';
import { api } from '../../src/shared/api/api-client';

type Tab = 'learn' | 'exams';
const kindLabels: Record<string, string> = { practice: 'Luyện tập chủ đề', domain_test: 'Kiểm tra chuyên ngành', mock_exam: 'Thi thử chứng chỉ', scenario_assessment: 'Tình huống thực tế' };
export default function CertificationDetailScreen() {
  const params = useLocalSearchParams<{ id: string; tab?: string; examId?: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(params.tab === 'exams' || params.examId ? 'exams' : 'learn');
  const [expanded, setExpanded] = useState<string[]>([]); const [showFormula, setShowFormula] = useState(false);
  const [certificate, setCertificate] = useState<any>(null); const [progress, setProgress] = useState<any>(null);
  const [studyProgress, setStudyProgress] = useState<any>(null); const [examStates, setExamStates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const sequence = useRef(0);
  useEffect(() => { if (params.tab === 'exams' || params.examId) setTab('exams'); }, [params.tab, params.examId]);
  const load = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const [catalog, activity, study] = await Promise.all([api.get<any>(`/certificates/${params.id}`), api.get<any>('/progress/me'), api.get<any>(`/certification-study/certificates/${params.id}/progress`)]);
      const cert = catalog?.data ?? catalog;
      const states = await Promise.all((cert?.exams ?? []).filter((exam: any) => exam.status === 'published').map(async (exam: any) => [exam.id, await api.get(`/exams/${exam.id}/eligibility`)]));
      if (request !== sequence.current) return;
      setCertificate(cert); setProgress(activity); setStudyProgress(study); setExamStates(Object.fromEntries(states)); setError('');
    } catch (cause: any) { if (request === sequence.current) setError(cause?.message || 'Không thể tải dữ liệu chứng chỉ.'); }
    finally { if (request === sequence.current) setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => {
    void load();
    const refresh = () => { if (AppState.currentState === 'active') void load(); };
    const subscription = AppState.addEventListener('change', refresh); const timer = setInterval(refresh, 60000);
    return () => { ++sequence.current; subscription.remove(); clearInterval(timer); };
  }, [load]));
  const activity = (progress?.certProgress ?? []).find((item: any) => item.certificateId === certificate?.id);
  const topics = studyProgress?.topics ?? [];
  const domains = (certificate?.domains ?? []).map((item: any) => ({ ...item.domain, weightPercent: item.weightPercent, topics: (item.certificationTopics ?? []).map((topic: any) => ({ ...topic, study: topics.find((entry: any) => entry.topicId === topic.id) })) }));
  const allTopics = domains.flatMap((domain: any) => domain.topics);
  const nextTopic = allTopics.find((topic: any) => topic.study?.total > 0 && topic.study.completed < topic.study.total) ?? allTopics.find((topic: any) => topic.study?.total > 0);
  const totalLessons = activity?.totalLessons ?? new Set(topics.flatMap((topic: any) => (topic.lessons ?? []).map((lesson: any) => lesson.id))).size;
  const publishedExams = (certificate?.exams ?? []).filter((exam: any) => exam.status === 'published').sort((a: any, b: any) => Number(b.id === params.examId) - Number(a.id === params.examId) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalExams = activity?.totalExams ?? publishedExams.filter((exam: any) => exam._count?.questions > 0).length;
  const completeIds = new Set((progress?.progress ?? []).filter((item: any) => item.resourceType === 'lesson' && (item.status === 'completed' || item.completionPercent >= 100)).map((item: any) => item.resourceId));
  const percent = Math.min(100, Math.max(0, Math.round(activity?.completionPercent ?? 0)));
  const openTopic = (topicId: string) => router.push(`/certifications/topics/${topicId}?certificateId=${params.id}` as any);
  return <FeatureScreen title={certificate?.name ?? 'Chi tiết chứng chỉ'} loading={loading} error={!certificate ? error : ''} onRetry={load}>
    {certificate && <View style={{ gap: 20 }}>
      {!!error && <View style={{ gap: 10 }}><Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text><Button mode="outlined" icon="refresh" onPress={load}>Thử lại</Button></View>}
      <View style={[controlStyles.card, { gap: 14 }]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Badge>{certificate.code}</Badge><Badge tone={activity?.hasStarted || percent > 0 ? 'success' : 'muted'}>{activity?.hasStarted || percent > 0 ? 'Đang ôn luyện' : 'Chưa bắt đầu'}</Badge></View>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>{certificate.name}</Text><Text>{certificate.provider}</Text>
        {!!certificate.description && <Text>{certificate.description}</Text>}
        <Text>{domains.length} chuyên ngành · {totalLessons} bài học · {totalExams} bài kiểm tra</Text>
        {nextTopic ? <Button icon="play-arrow" onPress={() => openTopic(nextTopic.id)}>{activity?.hasStarted ? 'Tiếp tục học' : 'Bắt đầu học'}</Button> : publishedExams.length > 0 ? <Button icon="assignment" onPress={() => setTab('exams')}>Làm bài kiểm tra</Button> : <Text>Nội dung đang được cập nhật.</Text>}
        <Text style={{ fontWeight: '700', fontSize: 18 }}>Tiến độ của bạn {percent}%</Text>
        <Text>Bài học: {activity?.completedLessons ?? 0}/{totalLessons}</Text><Text>Bài kiểm tra: {activity?.completedExams ?? 0}/{totalExams}</Text>
        <Text>{activity?.examAttempts ?? 0} lượt thi hoàn thành · Điểm trung bình: {activity?.avgScore == null ? 'Chưa có' : `${activity.avgScore}%`}</Text>
        <Button mode="text" icon={showFormula ? 'expand-less' : 'expand-more'} accessibilityState={{ expanded: showFormula }} onPress={() => setShowFormula(value => !value)}>Cách tính tiến độ</Button>
        {showFormula && <Text>{certificateProgressExplanation}</Text>}
      </View>
      <Tabs items={[{ value: 'learn', label: `Lộ trình học (${totalLessons})` }, { value: 'exams', label: `Bài kiểm tra (${totalExams})` }]} value={tab} onChange={value => setTab(value as Tab)} />
      {tab === 'learn' ? <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Lộ trình học</Text><Text>Chọn chuyên ngành và học lần lượt theo từng chủ đề.</Text>
        {domains.map((domain: any) => <View key={domain.id} style={[controlStyles.card, { gap: 14 }]}>
          <Button mode="outlined" icon={expanded.includes(domain.id) ? 'expand-less' : 'expand-more'} accessibilityState={{ expanded: expanded.includes(domain.id) }} onPress={() => setExpanded(current => current.includes(domain.id) ? current.filter(id => id !== domain.id) : [...current, domain.id])}>{domain.name}</Button>
          <Text>{domain.topics.length} chủ đề{Number(domain.weightPercent) > 0 ? ` · Tỷ trọng bài thi: ${domain.weightPercent}%` : ''}</Text>
          {expanded.includes(domain.id) && (domain.topics.length ? domain.topics.map((topic: any) => {
            const study = topic.study; const done = study?.total > 0 && study.completed === study.total;
            return <View key={topic.id} style={{ gap: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 14 }}><Text style={{ fontWeight: '700' }}>{topic.name}</Text><Text>{study?.total > 0 ? `${study.completed}/${study.total} bài học hoàn thành` : 'Bài học đang được cập nhật'}</Text>{done && <Badge tone="success">✓ Đã hoàn thành</Badge>}<Button icon={done ? 'replay' : 'menu-book'} mode="outlined" onPress={() => openTopic(topic.id)}>{done ? 'Ôn lại' : study?.started ? 'Học tiếp' : 'Xem chủ đề'}</Button></View>;
          }) : <Text>Chưa có chủ đề học trong chuyên ngành này.</Text>)}
        </View>)}
        {!domains.length && <EmptyState icon="menu-book" title="Chuyên ngành đang được cập nhật" detail="Bạn có thể xem các bài kiểm tra đã xuất bản." />}
        {publishedExams.length > 0 && <Button icon="assignment" mode="outlined" onPress={() => setTab('exams')}>Xem bài kiểm tra</Button>}
      </View> : <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Luyện tập và kiểm tra</Text><Text>Luyện tập sau khi học kiến thức, hoặc làm bài kiểm tra chuyên ngành và thi thử độc lập.</Text>
        {publishedExams.map((exam: any) => {
          const state = examStates[exam.id]; const attempt = state?.latestAttempt;
          const requiredLesson = state?.requiredLessonIds?.find((lessonId: string) => !completeIds.has(lessonId));
          const selected = exam.id === params.examId;
          return <View key={exam.id} style={[controlStyles.card, { gap: 12, backgroundColor: attempt ? '#ecfdf5' : '#fff', borderColor: selected ? '#3525cd' : attempt ? '#a7f3d0' : '#e2e8f0', borderWidth: selected ? 2 : 1 }]}>
            {selected && <Badge>Bài kiểm tra bạn vừa chọn</Badge>}
            <Text>{kindLabels[exam.kind] ?? 'Bài kiểm tra'}</Text><Text style={{ fontWeight: '700', fontSize: 18 }}>{exam.title}</Text>
            {attempt && <Badge tone="success">✓ Đã làm bài</Badge>}
            <Text>{exam._count?.questions ?? 0} câu hỏi · {exam.durationMinutes} phút · Đạt từ {exam.passingScorePercent}%</Text>
            <Text>Đã làm {state?.usedAttempts ?? 0}/{state?.maxAttempts ?? exam.maxAttempts} lượt</Text>
            {attempt && <Text>Kết quả gần nhất: {attempt.scorePercent == null ? 'Chờ chấm' : `${Math.round(attempt.scorePercent)}%`}</Text>}
            {!!state?.reason && <Text>{state.reason}</Text>}
            <Button icon={attempt ? 'replay' : 'play-arrow'} disabled={!state?.canStart} onPress={() => router.push(`/quiz/${exam.id}?certificateId=${params.id}` as any)}>{state?.canStart ? state.activeAttemptId ? 'Tiếp tục' : state.usedAttempts ? 'Làm lại' : 'Bắt đầu' : state?.unavailableLabel || 'Chưa thể làm bài'}</Button>
            {!state?.canStart && requiredLesson && <Button icon="menu-book" mode="outlined" onPress={() => router.push(`/lessons/${requiredLesson}?from=${encodeURIComponent(`/certifications/${params.id}?tab=exams&examId=${exam.id}`)}` as any)}>Học bài bắt buộc</Button>}
            {attempt && <Button icon="assignment" mode="outlined" onPress={() => router.push(`/test-result/${attempt.id}?certificateId=${params.id}` as any)}>Xem kết quả</Button>}
          </View>;
        })}
        {!publishedExams.length && <EmptyState icon="assignment" title="Chưa có bài kiểm tra" detail="Chứng chỉ chưa có bài kiểm tra được xuất bản." />}
      </View>}
    </View>}
  </FeatureScreen>;
}
