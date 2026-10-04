import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { api } from '../../src/shared/api/api-client';
import { progressViewModel, type ProgressPayload } from '../../../../packages/shared-kernel/src/progress';

const accent: Record<string, { background: string; foreground: string }> = {
  violet: { background: '#ede9fe', foreground: '#6d28d9' }, blue: { background: '#e0f2fe', foreground: '#0369a1' },
  fuchsia: { background: '#fae8ff', foreground: '#a21caf' }, orange: { background: '#ffedd5', foreground: '#c2410c' }, amber: { background: '#fef3c7', foreground: '#b45309' },
};

export default function MobileProgressScreen() {
 const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await api.get<ProgressPayload>('/progress/me')); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải tiến độ học tập.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const view = progressViewModel(data);

  return <View style={s.root}><StatusBar style="dark" /><View style={[s.topbar, { paddingTop: insets.top + 12 }]}><Text style={s.brand}>TechEnglish Pro</Text></View>
    {loading ? <View style={s.center}><ActivityIndicator size="large" color="#3525cd" /></View> : error ? <View style={s.center}><Text style={s.error}>{error}</Text><TouchableOpacity onPress={() => void load()} style={s.retry}><Text style={s.retryText}>Thử lại</Text></TouchableOpacity></View> : <ScrollView contentContainerStyle={s.content}>
      <View><Text style={s.eyebrow}>HÀNH TRÌNH CỦA BẠN</Text><Text style={s.heading}>Milestone học tập</Text><Text style={s.subheading}>Học đều mỗi ngày, mở khóa thành tích và chinh phục lộ trình của bạn.</Text></View>
      <View style={s.pillRow}><View style={s.pill}><Text style={s.pillIcon}>⚡</Text><View><Text style={s.pillValue}>{view.totalXp} XP</Text><Text style={s.pillLabel}>Điểm thành tích</Text></View></View><View style={s.pill}><Text style={s.pillIcon}>🔥</Text><View><Text style={s.pillValue}>{view.studyStreak} ngày</Text><Text style={s.pillLabel}>Chuỗi hiện tại</Text></View></View></View>
      <View style={s.hero}><Text style={s.heroLabel}>Tiến độ thành tích</Text><Text style={s.heroValue}>{view.unlockedCount}/{view.totalMilestones}</Text><Text style={s.heroCaption}>milestone đã được mở khóa</Text><View style={s.heroBarLabels}><Text style={s.heroLabel}>Cấp độ hành trình</Text><Text style={s.heroLabel}>{view.overallPercent}%</Text></View><View style={s.barBackground}><View style={[s.heroBar, { width: `${view.overallPercent}%` }]} /></View><Text style={s.heroFootnote}>Mỗi milestone mở khóa sẽ cộng XP và đánh dấu một cột mốc mới.</Text></View>
      <View><Text style={s.sectionHeading}>Thử thách milestone</Text><Text style={s.sectionHint}>Hoàn thành theo bất kỳ thứ tự nào phù hợp với lộ trình học của bạn.</Text>{view.milestones.length ? view.milestones.map(item => { const tone = accent[item.color] ?? accent.violet; return <View key={item.id} style={[s.milestone, { backgroundColor: tone.background }]}><View style={s.milestoneHeader}><Text style={s.milestoneIcon}>{item.icon}</Text>{item.unlocked && <Text style={s.unlocked}>✓ ĐÃ MỞ KHÓA</Text>}</View><Text style={s.milestoneTitle}>{item.title}</Text><Text style={s.milestoneDescription}>{item.description}</Text><View style={s.milestoneNumbers}><Text style={[s.milestoneCurrent, { color: tone.foreground }]}>{item.current}/{item.target}</Text><Text style={s.xp}>⚡ +{item.xp} XP</Text></View><View style={s.milestoneBarBackground}><View style={[s.milestoneBar, { width: `${item.progressPercent}%`, backgroundColor: tone.foreground }]} /></View></View>; }) : <Text style={s.empty}>Chưa có milestone nào.</Text>}</View>
      <View style={s.panel}><Text style={s.panelTitle}>Bước tiếp theo</Text><Text style={s.sectionHint}>Tiếp tục hướng học đã chọn để tăng tiến độ milestone.</Text>{view.includesVocabulary && <TouchableOpacity style={[s.nextCard, { backgroundColor: '#2563eb' }]} onPress={() => router.push('/flashcards' as never)}><Text style={s.nextIcon}>📚</Text><View style={s.nextBody}><Text style={s.nextTitle}>Học từ vựng CNTT</Text><Text style={s.nextDescription}>Tăng milestone số từ và chuỗi ngày học</Text></View><MaterialIcons name="arrow-forward" size={19} color="white" /></TouchableOpacity>}{view.includesCertification && <TouchableOpacity style={[s.nextCard, { backgroundColor: '#9333ea' }]} onPress={() => router.push('/certifications' as never)}><Text style={s.nextIcon}>🏆</Text><View style={s.nextBody}><Text style={s.nextTitle}>Luyện chứng chỉ</Text><Text style={s.nextDescription}>Làm quiz và hoàn thành domain</Text></View><MaterialIcons name="arrow-forward" size={19} color="white" /></TouchableOpacity>}</View>
      {view.includesCertification && <View style={s.panel}><Text style={s.panelTitle}>Quiz chứng chỉ gần đây</Text>{view.recentAttempts.length ? view.recentAttempts.map(attempt => <View key={attempt.id} style={s.attempt}><Text style={s.attemptIcon}>🧠</Text><View style={s.attemptBody}><Text style={s.attemptTitle} numberOfLines={1}>{attempt.exam?.title ?? 'Bài thi chứng chỉ'}</Text><Text style={s.attemptStatus}>{attempt.passed ? 'Đã đạt' : 'Đã hoàn thành'}</Text></View><Text style={s.attemptScore}>{Math.round(attempt.scorePercent ?? 0)}%</Text></View>) : <Text style={s.empty}>Chưa có quiz nào được hoàn thành.</Text>}</View>}
    </ScrollView>}
  </View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f9fb' }, topbar: { paddingTop: 48, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e3e5' }, brand: { fontSize: 19, fontWeight: '800', color: '#3525cd' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }, error: { color: '#b91c1c', textAlign: 'center' }, retry: { backgroundColor: '#3525cd', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 11 }, retryText: { color: '#fff', fontWeight: '700' },
  content: { padding: 18, gap: 22, paddingBottom: 90 }, eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 2, color: '#3525cd' }, heading: { marginTop: 5, fontSize: 29, fontWeight: '900', color: '#191c1e' }, subheading: { marginTop: 8, fontSize: 14, lineHeight: 21, color: '#464555' },
  pillRow: { flexDirection: 'row', gap: 10 }, pill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 15, padding: 11 }, pillIcon: { fontSize: 21 }, pillValue: { fontSize: 14, fontWeight: '800', color: '#191c1e' }, pillLabel: { fontSize: 10, color: '#64748b' },
  hero: { borderRadius: 22, padding: 22, backgroundColor: '#5b3ddd' }, heroLabel: { color: '#eeeaff', fontSize: 13, fontWeight: '700' }, heroValue: { marginTop: 4, fontSize: 38, fontWeight: '900', color: '#fff' }, heroCaption: { color: '#eeeaff', fontSize: 13 }, heroBarLabels: { marginTop: 28, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }, barBackground: { height: 14, backgroundColor: '#4630aa', borderRadius: 10, overflow: 'hidden' }, heroBar: { height: 14, backgroundColor: '#fcd34d', borderRadius: 10 }, heroFootnote: { marginTop: 13, color: '#eeeaff', fontSize: 11, lineHeight: 17 },
  sectionHeading: { fontSize: 20, fontWeight: '900', color: '#191c1e' }, sectionHint: { marginTop: 5, marginBottom: 12, color: '#64748b', fontSize: 12, lineHeight: 18 }, milestone: { marginTop: 11, borderRadius: 17, padding: 17, borderWidth: 1, borderColor: '#e2e8f0' }, milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, milestoneIcon: { fontSize: 29 }, unlocked: { backgroundColor: '#10b981', color: '#fff', overflow: 'hidden', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '900' }, milestoneTitle: { marginTop: 11, fontSize: 16, fontWeight: '800', color: '#191c1e' }, milestoneDescription: { marginTop: 4, color: '#464555', fontSize: 12, lineHeight: 18 }, milestoneNumbers: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' }, milestoneCurrent: { fontSize: 12, fontWeight: '800' }, xp: { color: '#92400e', fontSize: 12, fontWeight: '800' }, milestoneBarBackground: { marginTop: 8, height: 9, backgroundColor: '#fff', borderRadius: 6, overflow: 'hidden' }, milestoneBar: { height: 9, borderRadius: 6 }, empty: { padding: 16, textAlign: 'center', color: '#64748b', backgroundColor: '#f2f4f6', borderRadius: 12 },
  panel: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 17, padding: 18 }, panelTitle: { fontSize: 16, fontWeight: '800', color: '#191c1e' }, nextCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 13, marginTop: 10 }, nextIcon: { fontSize: 23 }, nextBody: { flex: 1 }, nextTitle: { fontSize: 14, fontWeight: '800', color: '#fff' }, nextDescription: { marginTop: 3, fontSize: 11, color: '#eeeaff' }, attempt: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f2f4f6', padding: 11, borderRadius: 11, marginTop: 9 }, attemptIcon: { fontSize: 20 }, attemptBody: { flex: 1 }, attemptTitle: { fontSize: 12, fontWeight: '700', color: '#191c1e' }, attemptStatus: { fontSize: 11, color: '#64748b' }, attemptScore: { fontSize: 14, fontWeight: '900', color: '#3525cd' },
});
