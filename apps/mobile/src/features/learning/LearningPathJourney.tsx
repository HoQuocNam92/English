import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, AppState, View } from 'react-native';
import { Text, Button, controlStyles } from '../../shared/ui/primitives';
import { api } from '../../shared/api/api-client';
import { mobileRoute } from '../../shared/navigation';
import { buildWeeklyStudySchedule } from '../../../../../packages/shared-kernel/src/weekly-study-schedule';
import { ContinuationPlans } from './ContinuationPlans';

export function LearningPathJourney({ full = false, refreshKey = 0, onAvailability }: { full?: boolean; refreshKey?: number; onAvailability?: (available: boolean) => void }) {
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
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
      ++sequence.current; setPath(result); setExpanded({});
    } catch (cause: any) { await load(); setError(cause.message); }
    finally { setSaving(false); }
  };
  if (loading) return <ActivityIndicator accessibilityLabel="Đang tải lộ trình" />;
  if (!path) return error ? <View><Text accessibilityRole="alert">{error}</Text><Button onPress={load}>Thử lại</Button></View> : null;
  const domain = path.domains.find((item: any) => item.state !== 'complete');
  const schedule = buildWeeklyStudySchedule(path.domains, path.dailyMinutes);
  return <View style={{ gap: 16 }}>
    <View style={[controlStyles.card, { gap: 12 }]}>
      <Text style={{ fontSize: 21, fontWeight: '800' }}>Lộ trình · {path.level.name}</Text>
      <Text>{path.completedLessons}/{path.totalLessons} bài cốt lõi đã học. Hoàn thành cấp cần học đủ bài và đạt tổng kết của mọi ngành đã chọn.</Text>
      {!!error && <Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text>}
      {domain && <><Text style={{ fontWeight: '700' }}>{domain.name}</Text>{!domain.available ? <Text>Chuỗi bài đang được bổ sung. Bạn có thể ôn từ hoặc khám phá bài khác.</Text> : domain.nextLesson ? <><Text>{domain.nextLesson.title}</Text><Button onPress={() => open(domain.nextLesson.href)}>Học bài tiếp theo</Button></> : domain.assessment ? <><Text>{domain.state === 'review_needed' ? `Kết quả gần nhất: ${Math.round(domain.assessment.scorePercent ?? 0)}%. Ôn lại và làm lại tổng kết.` : 'Đã học đủ bài. Làm tổng kết để kiểm tra mức hiểu.'} Mức đạt: {domain.assessment.passingScorePercent}%.</Text><Button onPress={() => open(domain.assessment.href)}>{domain.state === 'review_needed' ? 'Làm lại tổng kết' : 'Làm tổng kết'}</Button><Button mode="outlined" onPress={() => open(domain.lessons[0].href)}>Ôn lại bài học</Button></> : <Text>Bài tổng kết đang được bổ sung; chưa thể chuyển cấp.</Text>}</>}
      {path.allCompleted && <Text style={{ color: '#047857', fontWeight: '700' }}>Đã học đủ bài và đạt tổng kết {path.level.name}.</Text>}
      {path.canAdvance && path.nextLevel && <Button disabled={saving} onPress={() => Alert.alert('Xác nhận chuyển cấp', `Học tiếp ${path.nextLevel.name}? Lịch sử học tập được giữ lại, các bài mới bắt đầu theo tiến độ riêng.`, [{ text: 'Ở lại ôn tập', style: 'cancel' }, { text: 'Xác nhận chuyển cấp', onPress: () => void advance() }])}>{saving ? 'Đang chuyển…' : `Học tiếp ${path.nextLevel.name}`}</Button>}
      {path.allCompleted && !path.finalLevel && !path.nextLevel && <Text>Nội dung cấp tiếp theo đang được bổ sung.</Text>}
      <Button mode="outlined" onPress={() => open('/learn/flashcards')}>Ôn flashcards</Button>
      {!full && <Button onPress={() => open('/learn/plan')}>Xem lộ trình theo tuần và ngày</Button>}
    </View>
    {path.allCompleted && path.finalLevel && <ContinuationPlans />}
    {full && <View style={{ gap: 14 }}>
      <Text style={{ fontSize: 21, fontWeight: '800' }}>Lộ trình theo tuần</Text>
      <Text>{schedule.weeks.length} tuần · {schedule.days.length} ngày học · {path.totalLessons} chủ đề/bài học · {schedule.budget} phút/ngày dự kiến.</Text>
      <Text>Mỗi tuần tối đa 7 ngày học; tuần cuối có thể ngắn hơn. Bài dài chia nhiều buổi. Chỉ ghi nhận hoàn thành khi học xong cả bài.</Text>
      {schedule.next && <Text style={{ fontWeight: '700', color: '#3525cd' }}>Tiếp theo: Tuần {schedule.next.week} · Ngày {schedule.next.dayOfWeek} · {schedule.next.title}</Text>}
      {schedule.weeks.map(week => {
        const visible = expanded[week.week] ?? (schedule.next ? week.week >= schedule.next.week : week.week === 1);
        return <View key={week.week} style={[controlStyles.card, { gap: 12 }]}>
          <Button mode="outlined" accessibilityState={{ expanded: visible }} onPress={() => setExpanded(value => ({ ...value, [week.week]: !visible }))}>Tuần {week.week} · {week.days.length} ngày · {week.topics} chủ đề {visible ? '−' : '+'}</Button>
          {visible && week.days.map(day => <View key={day.id} style={[controlStyles.card, { gap: 10, padding: 14, borderColor: day.completed ? '#6ee7b7' : '#ddd6fe' }]}>
            <Text style={{ fontWeight: '800', color: '#3525cd' }}>Ngày {day.dayOfWeek} · {day.domain}</Text>
            <Text style={{ fontWeight: '700' }}>{day.title}{day.parts > 1 ? ` · Buổi ${day.part}/${day.parts}` : ''}</Text>
            <Text>{day.assessment ? `Ôn lại các chủ đề rồi làm tổng kết. Mức đạt ${day.passingScore}%. Thời lượng hiển thị trước khi bắt đầu.` : `1 chủ đề · ${day.words} từ liên kết trong cả bài · ${day.minutes} phút trong ngày này. ${day.part === 1 ? 'Đọc nội dung và xem ví dụ.' : 'Tiếp tục cùng bài và ôn thuật ngữ.'}`}</Text>
            <Text>{day.completed ? day.assessment ? 'Đã đạt tổng kết' : 'Bài đã hoàn thành' : day.ready ? 'Chưa hoàn thành bài' : 'Học đủ bài của ngành này trước'}</Text>
            {day.ready && <Button onPress={() => open(day.href)}>{day.completed ? 'Ôn lại' : day.assessment ? 'Làm tổng kết' : 'Mở bài học'}</Button>}
          </View>)}
        </View>;
      })}
    </View>}
  </View>;
}
