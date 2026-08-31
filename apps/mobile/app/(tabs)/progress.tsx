import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

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
  const streakDays = summary.studyStreakDays ?? 0;
  const streakHours = ((summary.totalStudyMinutes || 0) / 60).toFixed(1);
  const readinessPercent = summary.averageScorePercent ?? 0;
  const readinessTarget = learnerProfile?.certGoals?.[0]?.certificate?.name ?? 'Chứng chỉ mục tiêu';
  const readinessScore = summary.averageScorePercent ?? 0;

  const domainSkills = learnerProfile?.domains?.map((d: any, index: number) => {
    const domainProgress = progress?.progress?.find((p: any) => p.domainId === d.domain?.id) || {};
    const colorsList = ['#4f46e5', '#16a34a', '#0284c7', '#7c3aed', '#d97706'];
    return {
      name: d.domain?.name || 'Unknown',
      percent: domainProgress.completionPercent || 0,
      color: colorsList[index % colorsList.length]
    };
  }) || [];

  const recentTests = progress?.recentAttempts?.map((t: any) => ({
    id: t.id,
    title: t.exam?.title || 'Bài kiểm tra',
    meta: `${new Date(t.submittedAt).toLocaleDateString('vi-VN')} · ${t.totalQuestions || 0} câu · Làm trong ${t.exam?.durationMinutes || 0} phút`,
    scoreText: `${t.scorePercent || 0}% Đạt` // Simplification for now, UI just needs a string
  })) || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tiến độ học tập</Text>
        <Text style={styles.subtitle}>Theo dõi mức độ thành thạo và năng lực thi chứng chỉ.</Text>
      </View>

      {/* Streak Banner */}
      <View style={styles.streakCard}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakTitle}>Chuỗi {streakDays} Ngày liên tiếp</Text>
            <Text style={styles.streakSub}>Học ít nhất 15 phút mỗi ngày</Text>
          </View>
        </View>
        <View style={styles.hoursBadge}>
          <Text style={styles.hoursText}>{streakHours} Giờ</Text>
        </View>
      </View>

      {/* Target Cert Readiness Card */}
      <View style={styles.certCard}>
        <View style={styles.certHeader}>
          <Text style={styles.certLabel}>Độ sẵn sàng thi chứng chỉ</Text>
          <Text style={styles.certPercent}>{readinessPercent}%</Text>
        </View>
        <Text style={styles.certName}>{readinessTarget}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${readinessPercent}%` }]} />
        </View>
        <Text style={styles.certAdvice}>
          💡 Điểm trung bình thi thử của bạn là <Text style={styles.boldText}>{readinessScore}%</Text> (vượt chuẩn đỗ 70%). Bạn đã sẵn sàng đăng ký thi thật!
        </Text>
      </View>

      {/* Domain Proficiency */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Mức độ thành thạo theo chuyên ngành</Text>
        <View style={styles.skillsList}>
          {domainSkills.length > 0 ? domainSkills.map((s: any) => (
            <View key={s.name} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{s.name}</Text>
                <Text style={styles.skillPercent}>{s.percent}%</Text>
              </View>
              <View style={styles.skillBar}>
                <View style={[styles.skillBarFill, { width: `${s.percent}%`, backgroundColor: s.color }]} />
              </View>
            </View>
          )) : <Text style={{color: colors.mutedText}}>Chưa có dữ liệu chuyên ngành.</Text>}
        </View>
      </View>

      {/* Test History CTA */}
      <TouchableOpacity 
        style={[styles.sectionCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md }]}
        onPress={() => router.push('/test-history' as any)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="assignment" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Lịch sử thi & Bảng điểm chi tiết</Text>
            <Text style={{ fontSize: 12, color: colors.mutedText, marginTop: 2 }}>Xem lại tất cả kết quả bài thi và đáp án từng câu</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: 50,
    paddingBottom: 40,
    gap: spacing.lg
  },
  header: {
    gap: spacing.xs
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18
  },
  streakCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#ffedd5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  streakEmoji: {
    fontSize: 32
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9a3412'
  },
  streakSub: {
    fontSize: 11,
    color: '#c2410c'
  },
  hoursBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9a3412'
  },
  certCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  certLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase'
  },
  certPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  certName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginVertical: spacing.xs,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  certAdvice: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16,
    marginTop: 4
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.md
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  },
  skillsList: {
    gap: spacing.md
  },
  skillItem: {
    gap: 4
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  skillName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text
  },
  skillPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text
  },
  skillBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 3
  },
  historyList: {
    gap: spacing.sm
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#f8fafc',
    borderRadius: 10
  },
  historyLeft: {
    flex: 1,
    marginRight: spacing.sm
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  historyMeta: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2
  },
  scoreBadgePass: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  scorePassText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d'
  },
  boldText: {
    fontWeight: '700',
    color: colors.text
  }
});
