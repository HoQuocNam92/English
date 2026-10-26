import { LearningTrail } from './LearningTrail';
import { buildLearningTrail } from '../../../../../packages/shared-kernel/src/learning-trail';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, AppState, View } from 'react-native';
import { Text, Button, controlStyles } from '../../shared/ui/primitives';
import { api } from '../../shared/api/api-client';
import { mobileRoute } from '../../shared/navigation';
import { ContinuationPlans } from './ContinuationPlans';

export function LearningPathJourney({ full = false, refreshKey = 0, onAvailability }: { full?: boolean; refreshKey?: number; onAvailability?: (available: boolean) => void }) {
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const sequence = useRef(0);
  const router = useRouter();
  const open = (href: string) => router.push(mobileRoute(href) as any);
  const load = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const result: any = await api.get('/progress/me/learning-path');
      if (request !== sequence.current) return;
      setPath(result.configured ? result : null); onAvailability?.(result.configured); setError('');
    } catch (cause: any) { if (request === sequence.current) setError(cause.message || 'Không thể tải lộ trình.'); }
    finally { if (request === sequence.current) setLoading(false); }
  }, [onAvailability]);
  useFocusEffect(useCallback(() => {
    void load();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void load(); });
    return () => { ++sequence.current; subscription.remove(); };
  }, [load, refreshKey]));
  const advance = async () => {
    if (saving || !path?.canAdvance) return;
    setSaving(true); setError('');
    try {
      const result = await api.post('/progress/me/learning-path/advance', { fromLevelCode: path.level.code });
      ++sequence.current; setPath(result);
    } catch (cause: any) { await load(); setError(cause.message); }
    finally { setSaving(false); }
  };
  if (loading) return <ActivityIndicator accessibilityLabel="Đang tải lộ trình" />;
  if (!path) return error ? <View><Text accessibilityRole="alert">{error}</Text><Button onPress={load}>Thử lại</Button></View> : null;
  const practiceStep = buildLearningTrail(path.domains).next;
  const domain = path.domains.find((item: any) => item.state !== 'complete');
  return <View style={{ gap: 16 }}>
    <View style={[controlStyles.card, { gap: 12 }]}>
      <Text style={{ fontSize: 21, fontWeight: '800' }}>Lộ trình · {path.level.name}</Text>
      <Text>Bạn đã học {path.completedLessons}/{path.totalLessons} bài học trong tổng số {path.domains.length} chuyên ngành đã chọn. Để chuyển cấp, hãy hoàn thành bài học và đạt điểm yêu cầu của bài tổng kết ở từng ngành.</Text>
      {!!error && <Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text>}
      {domain && <View style={{ gap: 14, padding: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 18 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>{domain.nextLesson ? 'TIẾP TỤC HỌC' : 'BÀI TỔNG KẾT'}</Text>
        <Text style={{ fontSize: 19, fontWeight: '800' }}>{domain.name}</Text>
        {!domain.available ? <Text>Chuỗi bài đang được bổ sung. Bạn có thể ôn từ hoặc khám phá bài khác.</Text> : domain.nextLesson ? <><Text>{domain.nextLesson.title}</Text><Button onPress={() => open(domain.nextLesson.href)}>Học bài tiếp theo</Button></> : domain.assessment ? <>
          {domain.state === 'review_needed' && <Text style={{ alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: '700' }}>Cần củng cố</Text>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ flex: 1, minWidth: 100, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, backgroundColor: '#fff', gap: 4 }}><Text style={{ fontSize: 12, color: '#64748b' }}>Kết quả gần nhất</Text><Text style={{ fontSize: 25, fontWeight: '800' }}>{domain.assessment.scorePercent == null ? 'Chưa làm' : `${Math.round(domain.assessment.scorePercent)}%`}</Text></View>
            <View style={{ flex: 1, minWidth: 100, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, backgroundColor: '#fff', gap: 4 }}><Text style={{ fontSize: 12, color: '#64748b' }}>Mục tiêu đạt</Text><Text style={{ fontSize: 25, fontWeight: '800', color: '#3525cd' }}>{domain.assessment.passingScorePercent}%</Text></View>
          </View>
          <Text>{domain.state === 'review_needed' ? 'Ôn phần chưa vững rồi làm lại khi bạn sẵn sàng.' : 'Bạn đã học đủ bài. Làm tổng kết để kiểm tra mức hiểu.'}</Text>
          <Button onPress={() => open(domain.assessment.href)}>{domain.state === 'review_needed' ? 'Làm lại tổng kết' : 'Làm tổng kết'}</Button><Button mode="outlined" onPress={() => open(domain.lessons[0].href)}>Ôn lại bài học</Button>
        </> : <Text>Bài tổng kết đang được bổ sung; chưa thể chuyển cấp.</Text>}
      </View>}
      {practiceStep?.kind === 'review' && <View style={{ padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#ddd6fe', backgroundColor: '#f5f3ff', gap: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#3525cd' }}>LUYỆN TẬP BỔ SUNG</Text><Text style={{ fontSize: 19, fontWeight: '800' }}>{practiceStep.title}</Text><Text>Ôn thuật ngữ bằng flashcards để nhớ chắc hơn trước khi tiếp tục.</Text><Button mode="outlined" onPress={() => open(practiceStep.href)}>Luyện từ vừa học</Button>
      </View>}
      {path.allCompleted && <Text style={{ color: '#047857', fontWeight: '700' }}>Đã học đủ bài và đạt tổng kết {path.level.name}.</Text>}
      {path.canAdvance && path.nextLevel && <Button disabled={saving} onPress={() => Alert.alert('Xác nhận chuyển cấp', `Học tiếp ${path.nextLevel.name}? Lịch sử học tập được giữ lại, các bài mới bắt đầu theo tiến độ riêng.`, [{ text: 'Ở lại ôn tập', style: 'cancel' }, { text: 'Xác nhận chuyển cấp', onPress: () => void advance() }])}>{saving ? 'Đang chuyển…' : `Học tiếp ${path.nextLevel.name}`}</Button>}
      {path.allCompleted && !path.finalLevel && !path.nextLevel && <Text>Nội dung cấp tiếp theo đang được bổ sung.</Text>}
      {practiceStep?.kind !== 'review' && <Button mode="outlined" onPress={() => open('/learn/flashcards')}>Ôn flashcards</Button>}
      {!full && <Button onPress={() => open('/learn/plan')}>Xem toàn bộ lộ trình</Button>}
    </View>
    {path.allCompleted && path.finalLevel && <ContinuationPlans />}
    {full && <LearningTrail domains={path.domains} />}

  </View>;
}
