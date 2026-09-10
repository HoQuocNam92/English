import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

export default function MobileHomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHomeData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [meRes, progRes, recRes, lessonsRes] = await Promise.allSettled([
        api.get<any>('/auth/me'),
        api.get<any>('/progress/me'),
        api.get<any>('/recommendations/my'),
        api.get<any>('/lessons?limit=4'),
      ]);

      if (meRes.status === 'fulfilled') setUserData(meRes.value);
      if (progRes.status === 'fulfilled') setProgressData(progRes.value);
      if (recRes.status === 'fulfilled') setRecommendation(recRes.value);
      if (lessonsRes.status === 'fulfilled') setLessons(lessonsRes.value?.data || lessonsRes.value || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ef4444', marginBottom: 16 }}>{error}</Text>
        <TouchableOpacity style={[styles.continueButton, { paddingHorizontal: 24 }]} onPress={fetchHomeData}>
          <Text style={styles.continueButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = userData?.displayName || 'Bạn';
  const avatarLetter = name.charAt(0).toUpperCase();
  const goalTitle = userData?.certGoals?.[0]?.certificate?.name || userData?.learnerProfile?.certGoals?.[0]?.certificate?.name || 'Chứng chỉ tiếng Anh CNTT';

  const summary = progressData?.summary || progressData || {};
  const streakDays = summary.studyStreakDays ?? summary.streak ?? (progressData?.progress?.length > 0 ? 3 : 1);
  const wordsCount = summary.wordsLearned ?? ((progressData?.progress?.filter((p: any) => p.completedAt)?.length ?? 0) * 8 || 12);
  const progressPercent = summary.overallCompletionPercent ?? summary.completionPercent ?? (progressData?.progress?.length > 0 ? 65 : 65);
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Fixed */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarBoxSmall}>
            <Text style={styles.avatarTextSmall}>{avatarLetter}</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.greetingTitle}>Chào {name}</Text>
              <Text style={{ fontSize: 16 }}>👋</Text>
            </View>
            <Text style={styles.greetingSubtitle}>Sẵn sàng học bài mới chưa?</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.streakBadge} onPress={() => router.push('/leaderboard' as any)}>
          <Text style={{ fontSize: 14 }}>🔥</Text>
          <Text style={styles.streakText}>{streakDays} ngày</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Hero Goal Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardHeader}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="play-circle" size={12} color="#ffffff" />
              <Text style={styles.heroBadgeText}>Đang học</Text>
            </View>
            <Text style={styles.heroTimeText}>Còn 15 phút</Text>
          </View>
          <Text style={styles.heroTitle}>{lessons[0]?.title || 'RESTful API Design'}</Text>
          <Text style={styles.heroSubtitle}>Chương 4: Authentication & JWT Tokens</Text>
          
          <View style={styles.heroProgressContainer}>
            <View style={styles.heroProgressLabels}>
              <Text style={styles.heroProgressLabelText}>Tiến độ khóa học</Text>
              <Text style={styles.heroProgressValueText}>{progressPercent}%</Text>
            </View>
            <View style={styles.heroProgressBarBg}>
              <View style={[styles.heroProgressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.9}
            onPress={() => router.push((lessons.length > 0 ? `/lessons/${lessons[0].id}` : '/lessons') as any)}
          >
            <Text style={styles.heroButtonText}>Học tiếp ngay</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Daily Goal card */}
        <View style={styles.dailyGoalCard}>
          <View style={styles.dailyGoalHeader}>
            <View style={styles.dailyGoalHeaderLeft}>
              <MaterialIcons name="flag" size={20} color={colors.primary} />
              <Text style={styles.dailyGoalTitle}>Mục tiêu hôm nay</Text>
            </View>
            <View style={styles.dailyGoalBadge}>
              <Text style={styles.dailyGoalBadgeText}>2/3 bài</Text>
            </View>
          </View>
          
          <View style={styles.dailyGoalProgressRow}>
            <View style={[styles.dailyGoalSegment, styles.dailyGoalSegmentActive]} />
            <View style={[styles.dailyGoalSegment, styles.dailyGoalSegmentActive]} />
            <View style={[styles.dailyGoalSegment, styles.dailyGoalSegmentInactive]} />
          </View>
          
          <View style={styles.dailyGoalFooter}>
            <Text style={styles.dailyGoalDesc}>Chỉ cần hoàn thành 1 bài nữa để giữ streak!</Text>
            <Text style={styles.dailyGoalXp}>+50 XP</Text>
          </View>
        </View>

        {/* Quick Practice */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Luyện tập nhanh</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/practice' as any)}>
              <Text style={styles.sectionActionText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickPracticeGrid}>
            <TouchableOpacity style={styles.quickPracticeCard} onPress={() => router.push('/lessons?type=vocabulary' as any)}>
              <View style={styles.quickPracticeCardHeader}>
                <View style={[styles.quickPracticeIconBox, { backgroundColor: '#eff6ff' }]}>
                  <MaterialIcons name="menu-book" size={18} color="#2563eb" />
                </View>
                <View style={[styles.quickPracticeBadge, { backgroundColor: '#eff6ff' }]}>
                  <Text style={[styles.quickPracticeBadgeText, { color: '#2563eb' }]}>10 từ</Text>
                </View>
              </View>
              <View>
                <Text style={styles.quickPracticeCardTitle}>Ôn thuật ngữ</Text>
                <Text style={styles.quickPracticeCardDesc}>3 phút ôn tập</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickPracticeCard} onPress={() => router.push('/(tabs)/practice' as any)}>
              <View style={styles.quickPracticeCardHeader}>
                <View style={[styles.quickPracticeIconBox, { backgroundColor: '#faf5ff' }]}>
                  <MaterialIcons name="quiz" size={18} color="#9333ea" />
                </View>
                <View style={[styles.quickPracticeBadge, { backgroundColor: '#faf5ff' }]}>
                  <Text style={[styles.quickPracticeBadgeText, { color: '#9333ea' }]}>5 câu</Text>
                </View>
              </View>
              <View>
                <Text style={styles.quickPracticeCardTitle}>Quiz nhanh 5p</Text>
                <Text style={styles.quickPracticeCardDesc}>Kiểm tra kiến thức</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Recommendation Card */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Đề xuất cho bạn</Text>
          <TouchableOpacity style={styles.aiCard} onPress={() => router.push((recommendation?.resourceId ? `/lessons/${recommendation.resourceId}` : '/lessons') as any)}>
            <View style={styles.aiIconBox}>
              <MaterialIcons name="psychology" size={24} color="#7C3AED" />
            </View>
            <View style={styles.aiContent}>
              <Text style={styles.aiLabel}>GỢI Ý DỰA TRÊN ĐIỂM SỐ</Text>
              <Text style={styles.aiTitle} numberOfLines={1}>{recommendation?.topic || 'Networking Fundamentals'}</Text>
              <Text style={styles.aiDesc} numberOfLines={1}>12 bài • 45 phút ôn luyện</Text>
            </View>
            <View style={styles.aiButton}>
              <Text style={styles.aiButtonText}>Học</Text>
            </View>
          </TouchableOpacity>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
    elevation: 2,
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarBoxSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  avatarTextSmall: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191c1e',
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#464555',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 80,
    gap: spacing.lg
  },
  heroCard: {
    backgroundColor: '#4F46E5', // Fallback for gradient
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  heroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
  },
  heroProgressContainer: {
    marginBottom: spacing.md,
  },
  heroProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroProgressLabelText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  heroProgressValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  heroProgressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  heroProgressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  heroButton: {
    backgroundColor: '#ffffff',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  dailyGoalCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E3E5',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  dailyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dailyGoalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dailyGoalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191c1e',
  },
  dailyGoalBadge: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dailyGoalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  dailyGoalProgressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dailyGoalSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  dailyGoalSegmentActive: {
    backgroundColor: colors.primary,
  },
  dailyGoalSegmentInactive: {
    backgroundColor: '#e6e8ea',
  },
  dailyGoalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyGoalDesc: {
    fontSize: 12,
    color: '#464555',
    flex: 1,
  },
  dailyGoalXp: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  sectionContainer: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191c1e',
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  quickPracticeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickPracticeCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 12,
    padding: spacing.sm,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  quickPracticeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickPracticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPracticeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quickPracticeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quickPracticeCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: 2,
  },
  quickPracticeCardDesc: {
    fontSize: 11,
    color: '#464555',
  },
  aiCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiContent: {
    flex: 1,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: 2,
  },
  aiDesc: {
    fontSize: 11,
    color: '#464555',
  },
  aiButton: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs
  },
  continueButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
});


