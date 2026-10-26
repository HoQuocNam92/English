import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Text, Badge, Tabs, controlStyles } from '../../../src/shared/ui/primitives';
import { FeatureScreen, EmptyState } from '../../../src/shared/ui/FeatureScreen';
import { LessonExperience } from '../../../src/features/lessons/LessonExperience';
import { api } from '../../../src/shared/api/api-client';

export default function CertificateTopic() {
  const { id, certificateId, lessonId } = useLocalSearchParams<{ id: string; certificateId?: string; lessonId?: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState<any>(null); const [activeId, setActiveId] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const lock = useRef(false); const sequence = useRef(0); const startRequests = useRef(new Map<string, Promise<unknown>>());
  const load = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const result: any = await api.get(`/certification-study/topics/${id}`);
      if (certificateId && result.certificate.id !== certificateId) throw new Error('Chủ đề không thuộc chứng chỉ này.');
      const exams = await Promise.all((result.exams ?? []).map(async (exam: any) => ({ ...exam, eligibility: await api.get(`/exams/${exam.id}/eligibility`) })));
      if (request !== sequence.current) return;
      setTopic({ ...result, exams });
      setActiveId(previous => result.lessons.some((item: any) => item.id === previous) ? previous : result.lessons.find((item: any) => item.id === lessonId)?.id || result.lessons.find((item: any) => item.progress?.status !== 'completed')?.id || result.lessons[0]?.id || '');
      setError('');
    } catch (cause: any) { if (request === sequence.current) setError(cause?.message ?? 'Không thể tải chủ đề.'); }
    finally { if (request === sequence.current) setLoading(false); }
  }, [id, certificateId, lessonId]);
  useEffect(() => { setActiveId(''); setTopic(null); setLoading(true); }, [id, certificateId, lessonId]);
  useFocusEffect(useCallback(() => { void load(); return () => { ++sequence.current; }; }, [load]));
  const lesson = topic?.lessons.find((item: any) => item.id === activeId);
  const completed = topic?.lessons.filter((item: any) => item.progress?.status === 'completed').length ?? 0;
  useEffect(() => {
    if (!lesson || lesson.progress) return;
    let active = true; const resourceId = lesson.id;
    const started = api.post('/progress/me', { resourceType: 'lesson', resourceId, status: 'in_progress', completionPercent: 0 });
    startRequests.current.set(resourceId, started);
    void started.then(progress => { if (active) setTopic((previous: any) => previous ? { ...previous, lessons: previous.lessons.map((item: any) => item.id === resourceId && !item.progress ? { ...item, progress } : item) } : previous); }).catch(() => { /* Completion can retry the progress write. */ });
    return () => { active = false; };
  }, [lesson?.id]);
  const finish = async () => {
    if (!lesson || lock.current || lesson.progress?.status === 'completed') return;
    lock.current = true; setSaving(true); setError('');
    try {
      await startRequests.current.get(lesson.id)?.catch(() => undefined);
      const progress = await api.post('/progress/me', { resourceType: 'lesson', resourceId: lesson.id, status: 'completed', completionPercent: 100 });
      setTopic((previous: any) => ({ ...previous, lessons: previous.lessons.map((item: any) => item.id === lesson.id ? { ...item, progress } : item) }));
      await load();
      const next = topic.lessons.find((item: any) => item.id !== lesson.id && item.progress?.status !== 'completed');
      if (next) setActiveId(next.id);
    } catch (cause: any) { setError(cause?.message ?? 'Chưa lưu được tiến độ. Vui lòng thử lại.'); }
    finally { lock.current = false; setSaving(false); }
  };
  return <FeatureScreen title={topic?.name ?? 'Học kiến thức chứng chỉ'} subtitle={topic?.certificate.name} loading={loading} error={!topic ? error : ''} onRetry={load}>
    {topic && <View style={{ gap: 16 }}>
      <View style={[controlStyles.card, { gap: 10 }]}><Text style={{ fontSize: 20, fontWeight: '700' }}>{topic.name}</Text>{!!topic.description && <Text>{topic.description}</Text>}<Text style={{ color: '#3525cd' }}>{completed}/{topic.lessons.length} bài học hoàn thành</Text></View>
      {!!topic.lessons.length && <Tabs items={topic.lessons.map((item: any, index: number) => ({ value: item.id, label: `${item.progress?.status === 'completed' ? '✓' : index + 1} ${item.title}` }))} value={activeId} onChange={value => { if (!saving) setActiveId(value); }} />}
      {!!error && <Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text>}
      {lesson ? <><LessonExperience lesson={lesson} /><View style={controlStyles.footer}>{lesson.progress?.status === 'completed' ? <Badge tone="success">✓ Đã hoàn thành bài học</Badge> : <Button icon="check-circle" disabled={saving} onPress={finish}>{saving ? 'Đang lưu…' : 'Hoàn thành bài học'}</Button>}</View></> : <EmptyState icon="menu-book" title="Chưa có bài học kiến thức" detail="Nội dung đang được bổ sung." />}
      <View style={[controlStyles.card, { gap: 12 }]}><Text style={{ fontWeight: '700', fontSize: 18 }}>Luyện câu hỏi</Text><Text>{topic.lessons.length > 0 && completed === topic.lessons.length ? 'Đã học xong kiến thức. Làm bài luyện tập hoặc đọc lại phần cần củng cố.' : 'Hoàn thành kiến thức của chủ đề trước khi làm bài luyện tập.'}</Text>
        {(topic.exams ?? []).filter((exam: any) => exam._count.questions > 0).map((exam: any) => {
          const state = exam.eligibility; const attempt = state?.latestAttempt;
          return <View key={exam.id} style={{ gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: attempt ? '#a7f3d0' : '#e2e8f0', backgroundColor: attempt ? '#ecfdf5' : '#fff' }}>
            <Text style={{ fontWeight: '700' }}>{exam.title}</Text><Text>{exam._count.questions} câu hỏi</Text>
            {attempt && <Badge tone="success">✓ Đã làm bài</Badge>}
            {!!state?.reason && <Text>{state.reason}</Text>}
            <Button icon={attempt ? 'replay' : 'play-arrow'} disabled={!state?.canStart} onPress={() => router.push(`/quiz/${exam.id}?certificateId=${topic.certificate.id}&topicId=${id}` as any)}>{state?.canStart ? state.activeAttemptId ? 'Tiếp tục' : attempt ? 'Làm lại' : 'Làm bài luyện tập' : state?.unavailableLabel || 'Chưa thể làm bài'}</Button>
            {attempt && <Button mode="outlined" icon="assignment" onPress={() => router.push(`/test-result/${attempt.id}?certificateId=${topic.certificate.id}&topicId=${id}` as any)}>Xem kết quả</Button>}
          </View>;
        })}
        {!(topic.exams ?? []).some((exam: any) => exam._count.questions > 0) && <Text>Chưa có bài luyện tập cho chủ đề.</Text>}
      </View>
    </View>}
  </FeatureScreen>;
}
