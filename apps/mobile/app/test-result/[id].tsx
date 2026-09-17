import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { safeText } from '../../src/shared/utils/safeText';
import Svg, { Circle } from 'react-native-svg';

interface AttemptResult {
  id: string;
  score: number;
  isPassed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  exam: { title: string; passingScorePercent: number };
  questionsSnapshot?: any[];
}

export default function MobileTestResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get<AttemptResult>(`/exams/attempts/${id}`);
        const data = (res as any).data || res;
        setResult(data);
      } catch (error) {
        console.error('Failed to fetch test result', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchResult();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: '#464555' }}>Đang tải kết quả...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#191c1e' }}>Không tìm thấy kết quả</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/(tabs)/practice')}>
          <Text style={styles.backHomeText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate SVG attributes
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  // Calculate score relative to 10
  const scoreBase10 = (result.score / 100) * 10;
  const percent = scoreBase10 / 10;
  const strokeDashoffset = circumference - percent * circumference;
  
  const isPassed = result.isPassed;
  const primaryColor = isPassed ? '#16a34a' : '#ba1a1a';
  const bgColor = isPassed ? '#dcfce7' : '#ffdad6';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.replace('/(tabs)/practice')}>
          <MaterialIcons name="close" size={24} color="#464555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IT English Pro</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score Section */}
        <View style={styles.scoreSection}>
          <View style={styles.circleWrapper}>
            <View style={[styles.circleGlow, { backgroundColor: bgColor }]} />
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle
                cx={radius + strokeWidth / 2}
                cy={radius + strokeWidth / 2}
                r={radius}
                fill="transparent"
                stroke="#eceef0"
                strokeWidth={strokeWidth}
              />
              <Circle
                cx={radius + strokeWidth / 2}
                cy={radius + strokeWidth / 2}
                r={radius}
                fill="transparent"
                stroke={primaryColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.scoreTextWrapper}>
              <Text style={[styles.scoreValue, { color: primaryColor }]}>{scoreBase10.toFixed(1)}</Text>
              <Text style={styles.scoreMax}>/ 10</Text>
            </View>
          </View>
          
          <Text style={styles.statusTitle}>{isPassed ? 'Tuyệt vời!' : 'Cần cố gắng!'}</Text>
          <Text style={styles.statusSubtitle}>
            {isPassed ? 'Bạn đã hoàn thành bài kiểm tra với kết quả rất tốt.' : 'Bạn chưa đạt điểm yêu cầu. Hãy ôn tập và thử lại nhé.'}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoCard}>
            <MaterialIcons name="check-circle" size={28} color="#16a34a" />
            <Text style={styles.bentoValue}>{result.correctAnswersCount}</Text>
            <Text style={styles.bentoLabel}>Câu đúng</Text>
          </View>
          <View style={styles.bentoCard}>
            <MaterialIcons name="cancel" size={28} color="#ba1a1a" />
            <Text style={styles.bentoValue}>{result.incorrectAnswersCount}</Text>
            <Text style={styles.bentoLabel}>Câu sai</Text>
          </View>
        </View>

        {/* Details Section Example (Mocked visually as we don't have topic data directly) */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Thông tin bài thi</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="description" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Tên bài thi</Text>
              <Text style={styles.detailValue}>{safeText(result.exam?.title, 'Bài thi')}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="rule" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Điểm đạt yêu cầu</Text>
              <Text style={styles.detailValue}>{(result.exam?.passingScorePercent || 70) / 10} / 10</Text>
            </View>
          </View>
        </View>

        {/* Inline Answer Review */}
        {result.questionsSnapshot && result.questionsSnapshot.length > 0 && (
          <View style={styles.reviewSection}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Xem lại đáp án chi tiết</Text>
            </View>
            {result.questionsSnapshot.map((q: any, idx: number) => {
              const selectedIds = Array.isArray(q.userSelectedOptionIds) ? q.userSelectedOptionIds : [];
              const selectedOpts = q.options?.filter((o: any) => selectedIds.includes(o.id || o.key)) ?? [];
              const correctOpts = q.options?.filter((o: any) => o.isCorrect) ?? [];
              const isCorrect = Boolean(q.isUserCorrect);

              return (
                <View key={q.id || idx} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewBadge, { backgroundColor: isCorrect ? '#dcfce7' : '#ffdad6' }]}>
                      <MaterialIcons name={isCorrect ? 'check' : 'close'} size={14} color={isCorrect ? '#16a34a' : '#ba1a1a'} />
                      <Text style={[styles.reviewBadgeText, { color: isCorrect ? '#16a34a' : '#ba1a1a' }]}>
                        {isCorrect ? 'Đúng' : 'Sai'}
                      </Text>
                    </View>
                    <Text style={styles.reviewQNum}>Câu #{idx + 1}</Text>
                  </View>

                  <Text style={styles.reviewPrompt}>{q.prompt}</Text>

                  <View style={styles.reviewAnswers}>
                    <View style={styles.reviewAnswerRow}>
                      <Text style={styles.reviewAnswerLabel}>Bạn đã chọn:</Text>
                      <Text style={[styles.reviewAnswerValue, { color: isCorrect ? '#16a34a' : '#ba1a1a' }]}>
                        {selectedOpts.length ? selectedOpts.map((o: any) => o.text).join(', ') : 'Không chọn'}
                      </Text>
                    </View>
                    <View style={styles.reviewAnswerRow}>
                      <Text style={styles.reviewAnswerLabel}>Đáp án đúng:</Text>
                      <Text style={[styles.reviewAnswerValue, { color: '#16a34a' }]}>
                        {correctOpts.length ? correctOpts.map((o: any) => o.text).join(', ') : '—'}
                      </Text>
                    </View>
                  </View>

                  {q.explanation ? (
                    <View style={styles.reviewExplanation}>
                      <Text style={styles.reviewExplanationLabel}>💡 Giải thích:</Text>
                      <Text style={styles.reviewExplanationText}>{q.explanation}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions Fixed */}
      <View style={styles.bottomFixedArea}>
        <TouchableOpacity 
          style={styles.btnPrimary} 
          onPress={() => router.replace('/(tabs)/practice')}
        >
          <Text style={styles.btnPrimaryText}>Quay lại luyện tập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    backgroundColor: '#f7f9fb',
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    marginTop: 20
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 160
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl
  },
  circleWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  circleGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 80,
    opacity: 0.5,
    // Note: react native blur requires specific properties, omitting for simplicity, using solid light background
  },
  scoreTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -1
  },
  scoreMax: {
    fontSize: 14,
    fontWeight: '700',
    color: '#777587',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#191c1e',
    marginTop: spacing.md,
    textAlign: 'center'
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#464555',
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  bentoCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  bentoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#191c1e'
  },
  bentoLabel: {
    fontSize: 12,
    color: '#464555'
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  detailsHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    backgroundColor: '#f2f4f6'
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e'
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e8ea',
    gap: spacing.md
  },
  detailContent: {
    flex: 1
  },
  detailLabel: {
    fontSize: 12,
    color: '#464555',
    marginBottom: 2
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e'
  },
  bottomFixedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f7f9fb', // Matches background
    padding: spacing.md,
    paddingBottom: 32, // safe area
    borderTopWidth: 1,
    borderTopColor: '#c7c4d8',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    color: '#464555',
    fontSize: 15,
    fontWeight: '600'
  },
  backHomeBtn: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8
  },
  backHomeText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  // Answer Review styles
  reviewSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  reviewItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e8ea',
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reviewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewQNum: {
    fontSize: 11,
    color: '#777587',
    fontWeight: '600',
  },
  reviewPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191c1e',
    lineHeight: 20,
  },
  reviewAnswers: {
    backgroundColor: '#f2f4f6',
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  reviewAnswerRow: {
    gap: 2,
  },
  reviewAnswerLabel: {
    fontSize: 10,
    color: '#777587',
  },
  reviewAnswerValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewExplanation: {
    backgroundColor: '#f3e8ff',
    borderRadius: 8,
    padding: spacing.sm,
    gap: 4,
  },
  reviewExplanationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  reviewExplanationText: {
    fontSize: 12,
    color: '#191c1e',
    lineHeight: 18,
  },
});
