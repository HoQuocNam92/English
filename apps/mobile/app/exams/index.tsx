import { useState, useEffect, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';

const DOMAIN_OPTIONS = [
  { label: 'Tất cả lĩnh vực', code: 'all' },
  { label: 'Software', code: 'SOFTWARE_ENG' },
  { label: 'Cloud', code: 'CLOUD' },
  { label: 'Security', code: 'CYBERSEC' },
  { label: 'DevOps', code: 'DEVOPS' },
  { label: 'Data', code: 'DATA_ENG' },
  { label: 'Networking', code: 'NETWORKING' },
];

const LEVEL_OPTIONS = ['Tất cả cấp độ', 'Beginner', 'Intermediate', 'Advanced'];

export default function MobileExamsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ domainCode?: string }>();
  const { colors: themeColors } = useTheme();

  const [exams, setExams] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>(params.domainCode || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả cấp độ');

  // Warning modal state
  const [warningExam, setWarningExam] = useState<any | null>(null);

  useEffect(() => {
    fetchExamsData();
  }, []);

  const fetchExamsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [examsRes, progressRes, lessonsRes]: any = await Promise.allSettled([
        api.get<any>('/exams?limit=100&status=published'),
        api.get<any>('/progress/me'),
        api.get<any>('/lessons?limit=100&status=published'),
      ]);

      const rawExams = examsRes.status === 'fulfilled' ? (examsRes.value?.data ?? examsRes.value ?? []) : [];
      setExams(Array.isArray(rawExams) ? rawExams : []);

      if (progressRes.status === 'fulfilled') {
        setProgressData(progressRes.value);
      }

      if (lessonsRes.status === 'fulfilled') {
        const rawLessons = lessonsRes.value?.data ?? lessonsRes.value ?? [];
        setLessons(Array.isArray(rawLessons) ? rawLessons : []);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  // Readiness Calculation for each exam
  const examReadinessMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!exams.length) return map;

    const certProgressList = progressData?.certProgress || [];
    const lessonProgressList = (progressData?.progress || []).filter((p: any) => p.resourceType === 'lesson');
    const completedLessonIds = new Set(
      lessonProgressList
        .filter((p: any) => p.status === 'completed' || (p.completionPercent ?? 0) >= 70)
        .map((p: any) => p.resourceId)
    );
    const overallPercent = Math.round(progressData?.summary?.overallCompletionPercent ?? 0);

    exams.forEach((exam: any) => {
      let readiness = 0;
      let evaluated = false;

      // 1. By certificate
      if (exam.certificateId) {
        const certProg = certProgressList.find((cp: any) => cp.certificateId === exam.certificateId);
        if (certProg && typeof certProg.completionPercent === 'number') {
          readiness = Math.round(certProg.completionPercent);
          evaluated = true;
        }
      }

      // 2. By domain
      if (!evaluated && exam.domainId) {
        const domainLessons = lessons.filter(
          (l: any) => l.domainId === exam.domainId || l.domain?.id === exam.domainId || l.domain?.code === exam.domain?.code
        );
        if (domainLessons.length > 0) {
          const completedCount = domainLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
          readiness = Math.round((completedCount / domainLessons.length) * 100);
          evaluated = true;
        }
      }

      if (!evaluated) {
        readiness = overallPercent > 0 ? overallPercent : 50;
      }

      map.set(exam.id, readiness);
    });

    return map;
  }, [exams, progressData, lessons]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = exam.title?.toLowerCase().includes(q);
        const matchDesc = exam.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      // Domain
      if (selectedDomain !== 'all') {
        const examDomainCode = exam.domain?.code || exam.domainCode;
        if (examDomainCode !== selectedDomain) return false;
      }

      // Level
      if (selectedLevel !== 'Tất cả cấp độ') {
        const examLevelName = exam.level?.name || exam.level?.code || '';
        if (!examLevelName.toLowerCase().includes(selectedLevel.toLowerCase())) return false;
      }

      return true;
    });
  }, [exams, search, selectedDomain, selectedLevel]);

  const handleExamClick = (exam: any) => {
    const readiness = examReadinessMap.get(exam.id) ?? 0;
    if (readiness < 70) {
      setWarningExam({ ...exam, readiness });
    } else {
      router.push(`/quiz/${exam.id}` as any);
    }
  };

  const handleConfirmStartExam = () => {
    if (!warningExam) return;
    const targetId = warningExam.id;
    setWarningExam(null);
    router.push(`/quiz/${targetId}` as any);
  };

  const handleReviewLessonsFirst = () => {
    if (!warningExam) return;
    const domainCode = warningExam.domain?.code;
    setWarningExam(null);
    if (domainCode) {
      router.push(`/lessons?domainCode=${domainCode}` as any);
    } else {
      router.push('/lessons' as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={[styles.headerBar, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={themeColors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.onSurface }]}>Đề thi &amp; Kiểm tra</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={[styles.screenTitle, { color: themeColors.onSurface }]}>Ngân hàng đề thi</Text>
          <Text style={[styles.screenSubtitle, { color: themeColors.onSurfaceVariant }]}>
            Làm bài thi trắc nghiệm theo chuyên ngành hoặc luyện thi chứng chỉ với hệ thống đánh giá năng lực.
          </Text>
        </View>

        {/* Search Box */}
        <View style={[styles.searchBox, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.border }]}>
          <MaterialIcons name="search" size={20} color={themeColors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.onSurface }]}
            placeholder="Tìm kiếm bài thi..."
            placeholderTextColor={themeColors.outline}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={18} color={themeColors.onSurfaceVariant} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Domain Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {DOMAIN_OPTIONS.map((opt) => {
            const isSelected = selectedDomain === opt.code;
            return (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : themeColors.surfaceContainerLow,
                    borderColor: isSelected ? colors.primary : themeColors.border,
                  },
                ]}
                onPress={() => setSelectedDomain(opt.code)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#ffffff' : themeColors.onSurfaceVariant },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Level Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipRow, { marginTop: 8 }]}>
          {LEVEL_OPTIONS.map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.filterChipSmall,
                  {
                    backgroundColor: isSelected ? themeColors.surfaceContainerHigh : themeColors.surfaceContainerLowest,
                    borderColor: isSelected ? colors.primary : themeColors.border,
                  },
                ]}
                onPress={() => setSelectedLevel(lvl)}
              >
                <Text
                  style={[
                    styles.filterChipSmallText,
                    { color: isSelected ? colors.primary : themeColors.onSurfaceVariant, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Exams List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.onSurfaceVariant }]}>Đang tải danh sách bài thi...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={48} color={themeColors.error} />
            <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchExamsData}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredExams.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="quiz" size={48} color={themeColors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: themeColors.onSurfaceVariant }]}>Không tìm thấy bài thi phù hợp.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredExams.map((exam) => {
              const readiness = examReadinessMap.get(exam.id) ?? 0;
              const isReady = readiness >= 70;
              const badgeBg = isReady ? '#ecfdf5' : readiness >= 40 ? '#fffbeb' : '#fff1f2';
              const badgeText = isReady ? '#047857' : readiness >= 40 ? '#b45309' : '#be123c';
              const badgeBorder = isReady ? '#a7f3d0' : readiness >= 40 ? '#fde68a' : '#fecdd3';
              const badgeIcon = isReady ? 'check-circle' : readiness >= 40 ? 'schedule' : 'warning-amber';

              return (
                <TouchableOpacity
                  key={exam.id}
                  style={[
                    styles.examCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    },
                  ]}
                  onPress={() => handleExamClick(exam)}
                  activeOpacity={0.85}
                >
                  {/* Card Header */}
                  <View style={styles.examCardHeader}>
                    <View style={styles.domainLevelTags}>
                      <View style={[styles.tagBadge, { backgroundColor: themeColors.surfaceContainerLow }]}>
                        <Text style={[styles.tagBadgeText, { color: colors.primary }]}>
                          {exam.domain?.name || 'IT'}
                        </Text>
                      </View>
                      {exam.level?.name ? (
                        <View style={[styles.tagBadge, { backgroundColor: themeColors.surfaceContainer }]}>
                          <Text style={[styles.tagBadgeText, { color: themeColors.onSurfaceVariant }]}>
                            {exam.level.name}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Readiness Badge */}
                    <View style={[styles.readinessBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                      <MaterialIcons name={badgeIcon as any} size={13} color={badgeText} />
                      <Text style={[styles.readinessBadgeText, { color: badgeText }]}>
                        {readiness}% Sẵn sàng
                      </Text>
                    </View>
                  </View>

                  {/* Title & Description */}
                  <Text style={[styles.examTitle, { color: themeColors.onSurface }]}>{exam.title}</Text>
                  <Text style={[styles.examDesc, { color: themeColors.onSurfaceVariant }]} numberOfLines={2}>
                    {exam.description || 'Bài kiểm tra đánh giá toàn diện kiến thức kỹ thuật.'}
                  </Text>

                  {/* Meta & Button Row */}
                  <View style={[styles.examMetaRow, { borderTopColor: themeColors.border }]}>
                    <View style={styles.metaItemsGroup}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="schedule" size={15} color={themeColors.onSurfaceVariant} />
                        <Text style={[styles.metaText, { color: themeColors.onSurfaceVariant }]}>
                          {exam.durationMinutes || 30} phút
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="format-list-numbered" size={15} color={themeColors.onSurfaceVariant} />
                        <Text style={[styles.metaText, { color: themeColors.onSurfaceVariant }]}>
                          {exam.questionCount || 20} câu hỏi
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.startBtn, { backgroundColor: isReady ? colors.primary : themeColors.surfaceContainerHigh }]}>
                      <Text style={[styles.startBtnText, { color: isReady ? '#ffffff' : themeColors.onSurface }]}>
                        {isReady ? 'Bắt đầu' : 'Vào thi'}
                      </Text>
                      <MaterialIcons name="arrow-forward" size={15} color={isReady ? '#ffffff' : themeColors.onSurface} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Readiness Warning Modal */}
      <Modal
        visible={!!warningExam}
        transparent
        animationType="fade"
        onRequestClose={() => setWarningExam(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <View style={styles.modalIconBox}>
              <MaterialIcons name="warning" size={36} color="#d97706" />
            </View>

            <Text style={[styles.modalTitle, { color: themeColors.onSurface }]}>
              Chưa đạt độ sẵn sàng khuyến nghị
            </Text>

            <Text style={[styles.modalMessage, { color: themeColors.onSurfaceVariant }]}>
              Độ sẵn sàng của bạn với bài thi <Text style={{ fontWeight: '700' }}>"{warningExam?.title}"</Text> hiện là <Text style={{ fontWeight: '700', color: '#d97706' }}>{warningExam?.readiness}%</Text>.
              {'\n\n'}
              Hệ thống khuyến nghị bạn nên hoàn thành ít nhất <Text style={{ fontWeight: '700' }}>70% bài học</Text> cùng chuyên ngành trước khi làm bài để đạt kết quả tốt nhất.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalReviewBtn, { backgroundColor: colors.primary }]}
                onPress={handleReviewLessonsFirst}
                activeOpacity={0.8}
              >
                <MaterialIcons name="auto-stories" size={18} color="#ffffff" />
                <Text style={styles.modalReviewBtnText}>Ôn luyện bài học trước</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalContinueBtn, { borderColor: themeColors.border }]}
                onPress={handleConfirmStartExam}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalContinueBtnText, { color: themeColors.onSurfaceVariant }]}>
                  Vẫn làm bài thi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginTop: 40,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  introBox: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipSmallText: {
    fontSize: 12,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  examCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  domainLevelTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  readinessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  readinessBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  examDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  examMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  metaItemsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    width: '100%',
    gap: 10,
  },
  modalReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalReviewBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalContinueBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContinueBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
