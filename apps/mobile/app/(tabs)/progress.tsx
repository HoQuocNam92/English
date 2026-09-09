import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import Svg, { Path } from 'react-native-svg';

export default function MobileProgressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [learnerProfile, setLearnerProfile] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.get('/progress/me'),
      api.get('/learner-profiles/me')
    ])
      .then(([progData, profData]) => {
        setProgress(progData);
        setLearnerProfile(profData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const summary = progress?.summary || {};
  const progressItems = Array.isArray(progress?.progress) ? progress.progress : [];
  const attempts = Array.isArray(progress?.recentAttempts) ? progress.recentAttempts : [];
  const lessonProgress = progressItems.filter((item: any) => item.resourceType === 'lesson');
  const completedLessons = lessonProgress.filter((item: any) => item.status === 'completed').length;
  const overallPercent = Math.round(summary.overallCompletionPercent ?? (lessonProgress.length ? lessonProgress.reduce((sum: number, item: any) => sum + (item.completionPercent ?? 0), 0) / lessonProgress.length : 0));
  const learnedCount = summary.wordsLearned ?? completedLessons;
  const testCount = attempts.length;
  const averagePercent = summary.averageScorePercent ?? (attempts.length ? attempts.reduce((sum: number, item: any) => sum + (item.scorePercent ?? 0), 0) / attempts.length : 0);
  const averageScore = (averagePercent / 10).toFixed(1);

  const certGoals = learnerProfile?.certGoals || [];
  const mainCert = certGoals[0]?.certificate?.name || 'Chưa chọn chứng chỉ';

  const heatmapData = Array.from({ length: 28 }).map((_, index) => {
    const target = new Date(); target.setHours(0, 0, 0, 0); target.setDate(target.getDate() - (27 - index));
    const count = progressItems.filter((item: any) => { const date = new Date(item.updatedAt); date.setHours(0, 0, 0, 0); return date.getTime() === target.getTime(); }).length;
    return count > 1 ? colors.primary : count === 1 ? '#c3c0ff' : '#e6e8ea';
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* TopAppBar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>IT English Pro</Text>
        <TouchableOpacity onPress={() => router.push('/calendar' as any)}><MaterialIcons name="more-vert" size={24} color={colors.primary} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tiến độ học tập</Text>
          <Text style={styles.subtitle}>Theo dõi hành trình chinh phục tiếng Anh IT của bạn.</Text>
        </View>

        {/* Overall Progress Donut Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitleCenter}>Tổng quan khóa học</Text>
          <View style={styles.chartContainer}>
            <Svg viewBox="0 0 36 36" width="100%" height="100%">
              <Path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2dfff"
                strokeWidth="3.8"
              />
              <Path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2.8"
                strokeDasharray={`${overallPercent}, 100`}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.chartTextContainer}>
              <Text style={styles.chartPercent}>{overallPercent}%</Text>
              <Text style={styles.chartLabel}>Hoàn thành</Text>
            </View>
          </View>
        </View>

        {/* Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="check-circle" size={20} color="#464555" />
              <Text style={styles.summaryTitle}>Bài đã học</Text>
            </View>
            <Text style={styles.summaryValue}>{learnedCount}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="quiz" size={20} color="#464555" />
              <Text style={styles.summaryTitle}>Bài kiểm tra</Text>
            </View>
            <Text style={styles.summaryValue}>{testCount}</Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardFull]}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="analytics" size={20} color="#464555" />
              <Text style={styles.summaryTitle}>Điểm trung bình</Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{averageScore}</Text>
          </View>
        </View>

        {/* Certification Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Tiến độ chứng chỉ</Text>
            <MaterialIcons name="workspace-premium" size={24} color={colors.outline} />
          </View>
          
          <View style={styles.certItem}>
            <View style={styles.certRow}>
              <Text style={styles.certName}>{mainCert}</Text>
              <Text style={styles.certPercentText}>{overallPercent}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${overallPercent}%` }]} />
            </View>
            <Text style={styles.certTime}>{certGoals.length ? 'Dựa trên tiến độ học tập hiện tại' : 'Chọn chứng chỉ trong hồ sơ để theo dõi'}</Text>
          </View>
        </View>

        {/* Activity Heatmap */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoạt động 30 ngày qua</Text>
          <View style={styles.heatmapGrid}>
            {heatmapData.map((color, idx) => (
              <View key={idx} style={[styles.heatmapCell, { backgroundColor: color }]} />
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  headerBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
    marginTop: 40 // safearea substitute
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  contentContainer: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 80,
    gap: spacing.lg
  },
  header: {
    marginBottom: spacing.xs
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#191c1e',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#464555',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitleCenter: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  chartContainer: {
    position: 'relative',
    width: 192,
    height: 192,
    alignSelf: 'center',
  },
  chartTextContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPercent: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  chartLabel: {
    fontSize: 12,
    color: '#464555',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryCard: {
    width: '47.5%', // approx half width with gap
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  summaryCardFull: {
    width: '100%',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#191c1e',
    marginTop: 'auto',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: spacing.md,
  },
  certItem: {
    marginBottom: spacing.md,
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  certName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
  },
  certPercentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#e6e8ea',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  certTime: {
    fontSize: 12,
    color: '#464555',
    marginTop: spacing.sm,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    height: 128,
  },
  heatmapCell: {
    width: '12%', // Roughly 7 columns
    aspectRatio: 1,
    borderRadius: 4,
    opacity: 0.8,
  }
});
