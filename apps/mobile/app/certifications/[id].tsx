import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/shared/store/theme-context';
import { api } from '../../src/shared/api/api-client';

type Tab = 'learn' | 'exam';
type TopicStatus = 'done' | 'current' | 'todo';

interface Topic {
  name: string;
  status: TopicStatus;
  practiceExamId?: string;
  questionCount: number;
}

interface Domain {
  id: string;
  number: number;
  name: string;
  progress: number;
  weightPercent: number;
  topics: Topic[];
}

const TABS: { id: Tab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'learn', label: 'Học', icon: 'menu-book' },
  { id: 'exam', label: 'Thi thử', icon: 'assignment' },
];

export default function CertificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; code?: string; name?: string; progress?: string }>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('learn');
  const [expandedDomains, setExpandedDomains] = useState<number[]>([]);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get<any>(`/certificates/${params.id}`), api.get<any>('/progress/me')])
      .then(([certificateResult, progressResult]) => {
        const cert = (certificateResult as any)?.data ?? certificateResult;
        setCertificateData(cert);
        setProgressData(progressResult);
        setExpandedDomains((cert?.domains ?? []).slice(0, 2).map((_: any, index: number) => index + 1));
      })
      .catch((cause) => setError(cause?.message || 'Không thể tải dữ liệu chứng chỉ'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const domains: Domain[] = useMemo(() => (certificateData?.domains ?? []).map((item: any, index: number) => {
    const domain = item.domain;
    const topics = (item.certificationTopics ?? []).map((topic: any) => {
      const practiceExam = (certificateData?.exams ?? []).find((exam: any) => exam.kind === 'practice' && (exam.topics ?? []).includes(topic.code));
      return { name: topic.name, status: 'todo' as const, practiceExamId: practiceExam?.id, questionCount: Number(topic._count?.questions ?? 0) };
    });
    return { id: domain.id, number: index + 1, name: domain.name, weightPercent: Number(item.weightPercent ?? 0), progress: 0, topics };
  }), [certificateData]);

  const certificate = useMemo(() => ({
    name: certificateData?.name || params.name || 'Chứng chỉ',
    code: certificateData?.code || params.code || '',
    provider: certificateData?.provider || '',
    description: certificateData?.description || 'Luyện tiếng Anh chuyên ngành theo nội dung chứng chỉ.',
    progress: Math.round((progressData?.certProgress ?? []).find((item: any) => item.certificateId === certificateData?.id)?.completionPercent ?? (Number(params.progress) || 0)),
  }), [certificateData, params.code, params.name, params.progress, progressData]);

  const certProgress = (progressData?.certProgress ?? []).find((item: any) => item.certificateId === certificateData?.id);
  const attempts = (progressData?.recentAttempts ?? []).filter((item: any) => certificateData?.exams?.some((exam: any) => exam.id === item.examId));

  const toggleDomain = (number: number) => {
    setExpandedDomains((current) => current.includes(number)
      ? current.filter((value) => value !== number)
      : [...current, number]);
  };

  const openQuiz = (topic: Topic) => {
    if (!topic.practiceExamId) return;
    router.push(`/quiz/${topic.practiceExamId}` as any);
  };

  if (loading) return <View style={[styles.screen, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (error || !certificateData) return <View style={[styles.screen, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}><Text style={{ color: colors.error }}>{error || 'Không tìm thấy chứng chỉ'}</Text></View>;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.topBar, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Quay lại">
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]} numberOfLines={1}>Chi tiết chứng chỉ</Text>
        <TouchableOpacity style={styles.iconButton} accessibilityLabel="Lưu chứng chỉ">
          <MaterialIcons name="bookmark-border" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.hero, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.border }]}>
          <View style={styles.identityRow}>
            <View style={styles.awsLogo}><Text style={styles.awsLogoText}>aws</Text></View>
            <View style={styles.identityText}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: colors.primaryContainer }]}><Text style={[styles.badgeText, { color: colors.primary }]}>{certificate.progress > 0 ? 'ĐANG ÔN LUYỆN' : 'CHƯA BẮT ĐẦU'}</Text></View>
                <Text style={[styles.code, { color: colors.onSurfaceVariant }]}>{certificate.code}</Text>
              </View>
              <Text style={[styles.title, { color: colors.onSurface }]}>{certificate.name}</Text>
            </View>
          </View>
          <Text style={[styles.heroDescription, { color: colors.onSurfaceVariant }]}>{certificate.description}</Text>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.onSurface }]}>Tiến độ tổng thể</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{certificate.progress}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
            <View style={[styles.progressFill, { width: `${certificate.progress}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressCaption, { color: colors.onSurfaceVariant }]}>{certProgress?.examAttempts ?? 0} lượt thi đã hoàn thành</Text>
        </View>

        <View style={[styles.tabs, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.border }]}>
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <TouchableOpacity key={item.id} style={styles.tab} onPress={() => setTab(item.id)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
                <MaterialIcons name={item.icon} size={19} color={active ? colors.primary : colors.onSurfaceVariant} />
                <Text style={[styles.tabText, { color: active ? colors.primary : colors.onSurfaceVariant }]}>{item.label}</Text>
                {active && <View style={[styles.activeLine, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.content}>
          {tab === 'learn' && (
            <LearnContent
              colors={colors}
              expandedDomains={expandedDomains}
              onToggle={toggleDomain}
              onOpenQuiz={openQuiz}
              domains={domains}
              certProgress={certProgress}
            />
          )}
          {tab === 'exam' && <ExamContent colors={colors} exams={certificateData.exams ?? []} attempts={attempts} router={router} />}
        </View>
      </ScrollView>
    </View>
  );
}

function LearnContent({ colors, expandedDomains, onToggle, onOpenQuiz, domains, certProgress }: any) {
  return (
    <View>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR LEARNING PATH</Text>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Lộ trình theo nội dung kỳ thi</Text>
      <Text style={[styles.sectionDescription, { color: colors.onSurfaceVariant }]}>Chọn một Topic để làm bài luyện nhanh.</Text>

      <View style={styles.domainList}>
        {domains.map((domain: Domain) => {
          const expanded = expandedDomains.includes(domain.number);
          return (
            <View key={domain.number} style={[styles.domainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.domainHeader} onPress={() => onToggle(domain.number)} activeOpacity={0.75}>
                <View style={[styles.domainNumber, { backgroundColor: colors.primaryContainer }]}><Text style={[styles.domainNumberText, { color: colors.primary }]}>{domain.number}</Text></View>
                <View style={styles.domainMeta}>
                  <View style={styles.domainTitleRow}>
                    <Text style={[styles.domainTitle, { color: colors.onSurface }]} numberOfLines={2}>Domain {domain.number} — {domain.name}</Text>
                    <Text style={[styles.domainPercent, { color: colors.primary }]}>{domain.progress}%</Text>
                  </View>
                  <View style={styles.miniProgressRow}>
                    <View style={[styles.miniTrack, { backgroundColor: colors.surfaceContainerHigh }]}><View style={[styles.miniFill, { width: `${domain.progress}%`, backgroundColor: colors.primary }]} /></View>
                    <Text style={[styles.weight, { color: colors.onSurfaceVariant }]}>{domain.weightPercent}% bài thi</Text>
                  </View>
                </View>
                <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={22} color={colors.onSurfaceVariant} />
              </TouchableOpacity>

              {expanded && (
                <View style={[styles.topicList, { borderTopColor: colors.border }]}>
                  {domain.topics.map((topic: Topic) => (
                    <View key={topic.name} style={[styles.topicRow, { borderBottomColor: colors.border }]}>
                      <View style={[styles.topicStatus, { borderColor: colors.outlineVariant, backgroundColor: 'transparent' }]}>
                        <View style={[styles.statusDot, { backgroundColor: colors.outline }]} />
                      </View>
                      <View style={[styles.topicTextWrap]}>
                        <Text style={[styles.topicName, { color: colors.onSurface }]}>{topic.name}</Text>
                        <Text style={[styles.topicMeta, { color: colors.onSurfaceVariant }]}>Từ vựng · {topic.questionCount} câu Quiz</Text>
                      </View>
                      <TouchableOpacity disabled={!topic.practiceExamId} onPress={() => onOpenQuiz(topic)} style={[styles.topicQuizButton, { backgroundColor: topic.practiceExamId ? colors.primary : colors.surfaceContainerLow }]}>
                        <MaterialIcons name="play-arrow" size={16} color={topic.practiceExamId ? '#fff' : colors.onSurfaceVariant} />
                        <Text style={[styles.topicQuizText, { color: topic.practiceExamId ? '#fff' : colors.onSurfaceVariant }]}>Quiz</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        {!domains.length && <Text style={[styles.sectionDescription, { color: colors.onSurfaceVariant }]}>Chứng chỉ chưa được cấu hình Domain.</Text>}
      </View>
      <View style={[styles.practiceCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}>
        <View style={styles.practiceText}><Text style={[styles.practiceTitle, { color: colors.onSurface }]}>Kết quả thực tế</Text><Text style={[styles.practiceDetail, { color: colors.onSurfaceVariant }]}>{certProgress?.examAttempts ?? 0} lượt thi · Điểm TB {certProgress?.avgScore == null ? '—' : `${certProgress.avgScore}%`}</Text></View>
      </View>
    </View>
  );
}



function ExamContent({ colors, exams, attempts, router }: any) {
  const mockExams = exams.filter((exam: any) => exam.kind === 'mock_exam');
  return (
    <View>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>MOCK EXAMS</Text>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Mô phỏng kỳ thi thật</Text>
      <Text style={[styles.sectionDescription, { color: colors.onSurfaceVariant }]}>Không gợi ý, không dịch và không hiển thị từ vựng trong khi thi.</Text>
      <View style={styles.examList}>
        {mockExams.map((exam: any) => {
          const attempt = attempts.find((item: any) => item.examId === exam.id);
          return (
          <View key={exam.id} style={[styles.examCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.examIcon, { backgroundColor: attempt ? colors.primary : colors.surfaceContainerLow }]}>
              <MaterialIcons name={attempt ? 'emoji-events' : 'assignment'} size={25} color={attempt ? '#fff' : colors.primary} />
            </View>
            <View style={styles.examInfo}>
              <Text style={[styles.examTitle, { color: colors.onSurface }]}>{exam.title}</Text>
              <Text style={[styles.examMeta, { color: colors.onSurfaceVariant }]}>{exam._count?.questions ?? 0} câu hỏi · {exam.durationMinutes} phút</Text>
              {attempt && <Text style={[styles.examScore, { color: colors.primary }]}>Điểm: {Math.round(attempt.scorePercent ?? 0)}%</Text>}
            </View>
            <TouchableOpacity onPress={() => router.push(attempt ? `/test-result/${attempt.id}` : `/quiz/${exam.id}`)} style={[styles.examButton, { backgroundColor: attempt ? colors.surfaceContainerLow : colors.primary, borderColor: colors.primary }]}>
              <Text style={[styles.examButtonText, { color: attempt ? colors.primary : '#fff' }]}>{attempt ? 'Xem lại' : 'Bắt đầu'}</Text>
            </TouchableOpacity>
          </View>
        );})}
        {!mockExams.length && <Text style={[styles.sectionDescription, { color: colors.onSurfaceVariant }]}>Chưa có đề thi thử.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1 },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  hero: { padding: 18, borderBottomWidth: 1 },
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  awsLogo: { width: 52, height: 52, borderRadius: 13, backgroundColor: '#ff9900', alignItems: 'center', justifyContent: 'center' },
  awsLogoText: { color: '#232f3e', fontSize: 19, fontWeight: '900' },
  identityText: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  code: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 21, lineHeight: 27, fontWeight: '800', letterSpacing: -0.3 },
  heroDescription: { fontSize: 13, lineHeight: 19, marginTop: 12 },
  progressHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18, marginBottom: 7 },
  progressLabel: { fontSize: 13, fontWeight: '700' },
  progressValue: { fontSize: 21, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  progressCaption: { fontSize: 11, marginTop: 6 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, zIndex: 10 },
  tab: { flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative' },
  tabText: { fontSize: 13, fontWeight: '700' },
  activeLine: { height: 3, borderRadius: 2, position: 'absolute', left: 18, right: 18, bottom: 0 },
  content: { padding: 16 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  sectionDescription: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  domainList: { gap: 12, marginTop: 18 },
  domainCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  domainHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  domainNumber: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  domainNumberText: { fontSize: 14, fontWeight: '800' },
  domainMeta: { flex: 1 },
  domainTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  domainTitle: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  domainPercent: { fontSize: 13, fontWeight: '800' },
  miniProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  miniTrack: { flex: 1, height: 5, borderRadius: 99, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 99 },
  weight: { fontSize: 10 },
  topicList: { borderTopWidth: 1, paddingHorizontal: 14 },
  topicRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  mutedTopic: { opacity: 0.72 },
  topicStatus: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  topicTextWrap: { flex: 1, paddingVertical: 9 },
  topicName: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
  topicMeta: { fontSize: 10, marginTop: 3 },
  continueText: { fontSize: 10, fontWeight: '800' },
  topicQuizButton: { minWidth: 64, height: 34, paddingHorizontal: 10, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  topicQuizText: { fontSize: 11, fontWeight: '800' },
  practiceCard: { minHeight: 82, borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  practiceText: { flex: 1 },
  practiceTitle: { fontSize: 15, fontWeight: '700' },
  practiceDetail: { fontSize: 12, marginTop: 4 },
  examList: { gap: 12, marginTop: 18 },
  examCard: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  examIcon: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  examInfo: { flex: 1 },
  examTitle: { fontSize: 14, fontWeight: '800' },
  examMeta: { fontSize: 11, marginTop: 4 },
  examScore: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  examButton: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  examButtonText: { fontSize: 11, fontWeight: '800' },
});
