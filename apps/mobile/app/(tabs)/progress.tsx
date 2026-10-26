import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, AppState, View } from 'react-native';
import { api } from '../../src/shared/api/api-client';
import { FeatureScreen } from '../../src/shared/ui/FeatureScreen';
import { Text, Button, controlStyles } from '../../src/shared/ui/primitives';
import { learningReport, type LearningReportPayload, type CourseReportPayload } from '../../../../packages/shared-kernel/src/learning-report';

export default function MobileProgressScreen() {
  const [data, setData] = useState<LearningReportPayload | null>(null);
  const [course, setCourse] = useState<CourseReportPayload | null>(null);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(''); const [courseError, setCourseError] = useState('');
  const request = useRef(0); const router = useRouter();
  const load = useCallback(async () => {
    const current = ++request.current; setRefreshing(true);
    const [progress, path] = await Promise.allSettled([api.get<LearningReportPayload>('/progress/me'), api.get<CourseReportPayload>('/progress/me/learning-path')]);
    if (current !== request.current) return;
    if (progress.status === 'fulfilled') { setData(progress.value); setError(''); }
    else setError(progress.reason?.message || 'Không thể tải tiến độ.');
    if (path.status === 'fulfilled') { setCourse(path.value); setCourseError(''); }
    else { setCourse(null); setCourseError('Không thể tải kết quả của cấp hiện tại.'); }
    setLoading(false); setRefreshing(false);
  }, []);
  useFocusEffect(useCallback(() => {
    void load(); const subscription = AppState.addEventListener('change', state => { if (state === 'active') void load(); });
    const timer = setInterval(() => { if (AppState.currentState === 'active') void load(); }, 60000);
    return () => { ++request.current; subscription.remove(); clearInterval(timer); };
  }, [load]));
  const report = data ? learningReport(data, course) : null;
  return <FeatureScreen title="Tiến độ học tập" embedded loading={loading} error={!data ? error : ''} onRetry={load}><View style={{ gap: 20 }}>
    <Text>Tổng hợp bài đã học, từ vựng và kết quả kiểm tra của bạn.</Text>
    <Button icon="route" onPress={() => router.push('/learning-plan' as any)}>Đến lộ trình</Button>
    <Button icon="refresh" mode="outlined" disabled={refreshing} onPress={load}>{refreshing ? 'Đang làm mới…' : 'Làm mới tiến độ'}</Button>
    {!!courseError && <Text accessibilityRole="alert">{courseError}</Text>}
    {!!data && !!error && <Text accessibilityRole="alert">{error}</Text>}
    {refreshing && <ActivityIndicator />}
    {report && <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{[{ label: 'Bài đã hoàn thành', value: report.completedLessons }, { label: 'Bài đang học', value: report.inProgressLessons }, { label: 'Từ đã học', value: report.studiedWords }].map(metric => <View key={metric.label} style={[controlStyles.card, { flexGrow: 1, flexBasis: 140, gap: 8 }]}><Text style={{ fontSize: 13 }}>{metric.label}</Text><Text style={{ fontSize: 30, fontWeight: '800', color: '#3525cd' }}>{metric.value}</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Tích lũy qua các cấp</Text></View>)}</View>
      {!!report.domains.length && <View style={{ gap: 14 }}><Text style={{ fontSize: 21, fontWeight: '800' }}>Kết quả cấp {report.levelName}</Text><Text>Tỷ lệ bài đã học và kết quả tổng kết được ghi nhận riêng.</Text>{report.domains.map(domain => <View key={domain.id} style={[controlStyles.card, { gap: 12 }]}><Text style={{ fontWeight: '800', fontSize: 18 }}>{domain.name}</Text><Text>{domain.completedLessons}/{domain.totalLessons} bài đã học · {domain.percent}%</Text><View accessible accessibilityRole="progressbar" accessibilityLabel={`Bài đã học: ${domain.name}`} accessibilityValue={{ min: 0, max: 100, now: domain.percent }} style={{ height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: '#e2e8f0' }}><View style={{ height: 8, borderRadius: 4, width: `${domain.percent}%`, backgroundColor: '#3525cd' }} /></View><Text style={{ fontWeight: '700', color: domain.state === 'complete' ? '#047857' : '#475569' }}>{domain.resultLabel}</Text>{domain.assessment && <Text>Điểm tổng kết: {domain.assessment.scorePercent == null ? 'Chưa có' : `${Math.round(domain.assessment.scorePercent)}%`} · Mức đạt {domain.assessment.passingScorePercent}%</Text>}</View>)}</View>}
      {!!report.certificates.length && <View style={{ gap: 12 }}><Text style={{ fontSize: 21, fontWeight: '800' }}>Tiến độ chứng chỉ</Text>{report.certificates.map(cert => <View key={cert.certificateId} style={[controlStyles.card, { gap: 10 }]}><Text style={{ fontWeight: '700' }}>{cert.certificateName}</Text><Text>{cert.completedLessons}/{cert.totalLessons} bài đã học · {cert.examAttempts} lượt thi đã hoàn thành</Text><Text>Điểm trung bình: {cert.avgScore == null ? 'Chưa có' : `${cert.avgScore}%`}</Text></View>)}</View>}
      <View style={[controlStyles.card, { gap: 14 }]}><Text style={{ fontSize: 21, fontWeight: '800' }}>Bài học gần đây</Text>{report.activities.length ? report.activities.map(item => <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, gap: 5 }}><Button mode="outlined" onPress={() => router.push(`/lessons/${item.resourceId ?? item.id}` as any)}>{item.title ?? 'Bài học'} · Xem lại bài</Button><View style={{ alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: item.status === 'completed' || item.completionPercent >= 100 ? '#dbeafe' : '#f1f5f9' }}><Text style={{ color: item.status === 'completed' || item.completionPercent >= 100 ? '#1e40af' : '#475569', fontWeight: '600' }}>{item.status === 'completed' || item.completionPercent >= 100 ? 'Đã hoàn thành' : 'Đang học'}</Text></View><Text style={{ fontSize: 12, color: '#64748b' }}>{item.completedAt || item.updatedAt ? new Date(item.completedAt ?? item.updatedAt!).toLocaleDateString('vi-VN') : 'Chưa có ngày ghi nhận'}</Text></View>) : <Text>Bạn chưa có hoạt động học bài được ghi nhận.</Text>}</View>
      {!!report.recentAttempts.length && <View style={[controlStyles.card, { gap: 14 }]}><Text style={{ fontSize: 21, fontWeight: '800' }}>Bài luyện chứng chỉ gần đây</Text>{report.recentAttempts.map(attempt => <View key={attempt.id} style={{ gap: 6 }}><Text style={{ fontWeight: '700' }}>{attempt.exam?.title ?? 'Bài kiểm tra'}</Text><Button mode="outlined" style={{ minHeight: 44, width: 144, alignSelf: 'flex-start' }} onPress={() => router.push(`/test-result/${attempt.id}` as any)}>Xem kết quả</Button><Text>{attempt.passed ? 'Đã đạt' : 'Chưa đạt'} · {attempt.scorePercent == null ? '—' : `${Math.round(attempt.scorePercent)}%`}</Text></View>)}</View>}
    </>}
  </View></FeatureScreen>;
}
