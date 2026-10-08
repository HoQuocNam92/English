import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Text, Tabs, controlStyles } from '../../../src/shared/ui/primitives';
import { FeatureScreen, EmptyState } from '../../../src/shared/ui/FeatureScreen';
import { LessonExperience } from '../../../src/features/lessons/LessonExperience';
import { api } from '../../../src/shared/api/api-client';
import { useTheme } from '../../../src/shared/store/theme-context';

export default function CertificateTopic() {
  const { id, certificateId, lessonId } = useLocalSearchParams<{ id: string; certificateId: string; lessonId?: string }>();
  const router = useRouter(); const { colors } = useTheme();
  const [topic, setTopic] = useState<any>(null); const [activeId, setActiveId] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const lock = useRef(false);
  const load = useCallback(async () => {
    try { const result: any = await api.get(`/certification-study/topics/${id}`);
      if (certificateId && result.certificate.id !== certificateId) throw new Error('Chủ đề không thuộc chứng chỉ này.');
      setTopic(result); setActiveId(previous => previous || result.lessons.find((item: any) => item.id === lessonId)?.id || result.lessons.find((lesson: any) => lesson.progress?.status !== 'completed')?.id || result.lessons[0]?.id || ''); setError('');
    } catch (cause: any) { setError(cause.message); } finally { setLoading(false); }
  }, [id, certificateId, lessonId]);
  useEffect(() => { setActiveId(''); }, [id, certificateId, lessonId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const lesson = topic?.lessons.find((item: any) => item.id === activeId);
  const completed = topic?.lessons.filter((item: any) => item.progress?.status === 'completed').length ?? 0;
  const ready = topic?.lessons.length > 0 && completed === topic.lessons.length;
  const finish = async () => {
    if (!lesson || lock.current) return; lock.current = true; setSaving(true);
    try { const progress = await api.post('/progress/me', { resourceType: 'lesson', resourceId: lesson.id, status: 'completed', completionPercent: 100 });
      setTopic((previous: any) => ({ ...previous, lessons: previous.lessons.map((item: any) => item.id === lesson.id ? { ...item, progress } : item) }));
      const next = topic.lessons.find((item: any) => item.id !== lesson.id && item.progress?.status !== 'completed'); if (next) setActiveId(next.id);
    } catch (cause: any) { setError(cause.message); } finally { lock.current = false; setSaving(false); }
  };
  return <FeatureScreen title={topic?.name ?? 'Học kiến thức chứng chỉ'} subtitle={topic?.certificate.name} loading={loading} error={!topic ? error : ''} onRetry={load}>
    {topic && <View style={{ gap: 16 }}>
      <View style={controlStyles.card}><Text style={{ fontSize: 20, fontWeight: '700' }}>{topic.name}</Text><Text>{topic.description}</Text><Text style={{ color: colors.primary }}>{completed}/{topic.lessons.length} bài học hoàn thành</Text></View>
      {!!topic.lessons.length && <Tabs items={topic.lessons.map((item: any, index: number) => ({ value: item.id, label: `${item.progress?.status === 'completed' ? '✓' : index + 1} ${item.title}` }))} value={activeId} onChange={value => { if (!saving) setActiveId(value); }} />}
      {error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
      {lesson ? <><LessonExperience lesson={lesson} /><View style={controlStyles.footer}><Button disabled={saving || lesson.progress?.status === 'completed'} onPress={finish}>{saving ? 'Đang lưu…' : lesson.progress?.status === 'completed' ? 'Đã hoàn thành bài học' : 'Hoàn thành bài học'}</Button></View></> : <EmptyState icon="menu-book" title="Chưa có bài học kiến thức" detail="Nội dung cần được biên soạn và xuất bản." />}
      <View style={[controlStyles.card, { gap: 12 }]}><Text style={{ fontWeight: '700' }}>Luyện câu hỏi</Text><Text>{ready ? 'Đã học xong kiến thức. Bắt đầu Quiz hoặc đọc lại bài học.' : 'Hoàn thành bài học của chủ đề trước khi làm Quiz.'}</Text>
        {(topic.exams ?? []).filter((exam: any) => exam._count.questions > 0).map((exam: any) => <Button key={exam.id} disabled={!ready} onPress={() => router.push(`/quiz/${exam.id}?certificateId=${topic.certificate.id}&topicId=${id}` as any)}>Làm Quiz · {exam.title} · {exam._count.questions} câu</Button>)}
        {!(topic.exams ?? []).some((exam: any) => exam._count.questions > 0) && <Text>Chưa có Quiz cho chủ đề.</Text>}
      </View>
    </View>}
  </FeatureScreen>;
}
