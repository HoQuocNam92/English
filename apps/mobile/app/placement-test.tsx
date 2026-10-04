import { PlacementPlan } from '../src/features/learning/PlacementPlan';
import { Text, TouchableOpacity } from '../src/shared/ui/primitives';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../src/shared/api/api-client';
import { useTheme } from '../src/shared/store/theme-context';
import { EmptyState, FeatureScreen } from '../src/shared/ui/FeatureScreen';

type Question = { id: string; prompt: string; context?: string; options: { id: string; key: string; text: string }[] };
type Result = { correct: number; total: number; percent: number; levelName: string; plan?: any; domainScores?: any[]; review?: any[] };

export default function PlacementTestScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { colors } = useTheme();
  const [assessmentId, setAssessmentId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const [result, setResult] = useState<Result | null>(null);
  const destination = next === '/flashcards' || (typeof next === 'string' && /^\/certifications\/[^/?#]+$/.test(next)) ? next : '/(tabs)/home';
  const finish = () => router.replace(destination as any);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get<{ assessmentId: string; data: Question[] }>('/placement-test');
      setAssessmentId(response.assessmentId); setQuestions(response.data); setAnswers({}); setIndex(0);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải bài kiểm tra.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const submit = async () => {
    if (busy.current || !questions.length || questions.some(q => !answers[q.id])) return;
    busy.current = true; setSubmitting(true); setSubmitError('');
    try {
      setResult(await api.post<Result>('/placement-test/submit', {
        assessmentId,
        answers: questions.map(q => ({ questionId: q.id, optionId: answers[q.id] })),
      }));
    } catch (cause) { setSubmitError(cause instanceof Error ? cause.message : 'Không thể chấm bài. Vui lòng thử lại.'); }
    finally { busy.current = false; setSubmitting(false); }
  };
  const question = questions[index];
  const button = (label: string, action: () => void, disabled = false) => <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={action} style={[s.button, { backgroundColor: colors.primary, opacity: disabled ? 0.45 : 1 }]}><Text style={s.buttonText}>{label}</Text></TouchableOpacity>;
  return <FeatureScreen title="Kiểm tra trình độ" subtitle="Khoảng 5 phút · Điều chỉnh lộ trình học" loading={loading} error={error} onRetry={load}>
    {result ? <View style={s.section}>
      <PlacementPlan result={result} />
      {button('Bắt đầu học', finish)}
    </View> : !question ? <><EmptyState icon="school" title="Chưa có câu hỏi xếp trình độ" detail="Bạn vẫn có thể bắt đầu học theo trình độ đã chọn." />{button('Bắt đầu học', finish)}</> : <View style={s.section}>
      <Text style={[s.copy, { color: colors.primary }]}>Câu {index + 1}/{questions.length} · Đã trả lời {Object.keys(answers).length}/{questions.length}</Text>
      <View style={s.numbers}>{questions.map((q, i) => <TouchableOpacity key={q.id} disabled={submitting} accessibilityLabel={`Câu ${i + 1}${answers[q.id] ? ', đã trả lời' : ''}`} onPress={() => setIndex(i)} style={[s.number, { borderColor: i === index ? colors.primary : colors.outlineVariant, backgroundColor: answers[q.id] ? colors.primaryContainer : colors.surface }]}><Text style={{ color: colors.onSurface }}>{i + 1}</Text></TouchableOpacity>)}</View>
      {question.context ? <Text style={[s.context, { backgroundColor: colors.surfaceContainer, color: colors.onSurfaceVariant }]}>{question.context}</Text> : null}
      <Text style={[s.title, { color: colors.onSurface }]}>{question.prompt}</Text>
      {question.options.map(option => <TouchableOpacity key={option.id} accessibilityRole="radio" accessibilityState={{ checked: answers[question.id] === option.id }} disabled={submitting} onPress={() => setAnswers(previous => ({ ...previous, [question.id]: option.id }))} style={[s.option, { borderColor: answers[question.id] === option.id ? colors.primary : colors.outlineVariant, backgroundColor: answers[question.id] === option.id ? colors.primaryContainer : colors.surfaceContainerLowest }]}><Text style={[s.copy, { color: colors.onSurface }]}>{option.key}. {option.text}</Text></TouchableOpacity>)}
      {submitError ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{submitError}</Text> : null}
      <View style={s.navigation}>{index > 0 && button('Câu trước', () => setIndex(index - 1), submitting)}{index < questions.length - 1 && button('Câu tiếp', () => setIndex(index + 1), submitting)}</View>
      {button(submitting ? 'Đang chấm bài…' : 'Nộp bài và xem kết quả', () => void submit(), submitting || questions.some(q => !answers[q.id]))}
    </View>}
  </FeatureScreen>;
}
const s = StyleSheet.create({
  section: { gap: 16 }, title: { fontSize: 21, fontWeight: '800', lineHeight: 29 }, copy: { fontSize: 15, lineHeight: 23 },
  context: { padding: 16, borderRadius: 12, lineHeight: 22 }, option: { padding: 16, borderRadius: 12, borderWidth: 2, minHeight: 52 },
  numbers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, number: { minWidth: 44, minHeight: 44, borderWidth: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, button: { minHeight: 48, borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
