import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

export default function MobileHomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  const fetchHomeData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [meRes, profRes, progRes] = await Promise.allSettled([
        api.get<any>('/auth/me'),
        api.get<any>('/learner-profiles/me'),
        api.get<any>('/progress/me'),
      ]);

      if (meRes.status === 'fulfilled') setUserData(meRes.value);
      let userProf: any = null;
      if (profRes.status === 'fulfilled') {
        userProf = profRes.value;
        setProfileData(userProf);
      }
      if (progRes.status === 'fulfilled') setProgressData(progRes.value);

      const levelCode = userProf?.level?.code;
      const lessonsUrl = levelCode ? `/lessons?limit=4&levelCode=${levelCode}` : '/lessons?limit=4';
      try {
        const lessonsRes = await api.get<any>(lessonsUrl);
        const list = lessonsRes?.data || lessonsRes || [];
        if (Array.isArray(list) && list.length > 0) {
          setLessons(list);
        } else {
          const fallback = await api.get<any>('/lessons?limit=4');
          setLessons(fallback?.data || fallback || []);
        }
      } catch {
        const fallback = await api.get<any>('/lessons?limit=4').catch(() => []);
        setLessons(fallback?.data || fallback || []);
      }
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

  const summary = progressData?.summary || progressData || {};
  const progressPercent = summary.overallCompletionPercent ?? summary.completionPercent ?? 0;
  const completedLessons = summary.completedLessons ?? progressData?.progress?.filter((p: any) => p.completedAt)?.length ?? 0;
  const totalLessons = summary.totalLessons ?? progressData?.progress?.length ?? 0;
  const firstLesson = lessons[0];
  
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.greetingTitle}>Chào {name}</Text>
              <Text style={{ fontSize: 16 }}>👋</Text>
              {profileData?.level?.name ? (
                <View style={styles.userLevelBadge}>
                  <Text style={styles.userLevelBadgeText}>{profileData.level.name}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.greetingSubtitle}>Sẵn sàng học bài mới chưa?</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {firstLesson ? (
        <View style={styles.heroCard}>
          <View style={styles.heroCardHeader}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="play-circle" size={12} color="#ffffff" />
              <Text style={styles.heroBadgeText}>{progressPercent > 0 ? 'Đang học' : 'Bài học đề xuất'}</Text>
            </View>
            {firstLesson.estimatedMinutes && (
              <Text style={styles.heroTimeText}>{firstLesson.estimatedMinutes} phút</Text>
            )}
          </View>
          <Text style={styles.heroTitle}>{firstLesson.title}</Text>
          <Text style={styles.heroSubtitle}>
            {[firstLesson.domain?.name, firstLesson.level?.name].filter(Boolean).join(' · ')}
          </Text>
          
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
            onPress={() => router.push(`/lessons/${firstLesson.id}` as any)}
          >
            <Text style={styles.heroButtonText}>{progressPercent > 0 ? 'Học tiếp ngay' : 'Bắt đầu học'}</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        ) : null}

        {/* Daily Goal card */}
        <View style={styles.dailyGoalCard}>
          <View style={styles.dailyGoalHeader}>
            <View style={styles.dailyGoalHeaderLeft}>
              <MaterialIcons name="flag" size={20} color={colors.primary} />
              <Text style={styles.dailyGoalTitle}>Tiến độ học tập</Text>
            </View>
            <View style={styles.dailyGoalBadge}>
              <Text style={styles.dailyGoalBadgeText}>{completedLessons}/{totalLessons || '?'} bài</Text>
            </View>
          </View>
          
          <View style={styles.heroProgressBarBg}>
            <View style={[styles.heroProgressBarFill, { width: totalLessons > 0 ? `${(completedLessons / totalLessons) * 100}%` : '0%' }]} />
          </View>
          
          <View style={styles.dailyGoalFooter}>
            <Text style={styles.dailyGoalDesc}>
              {completedLessons >= totalLessons && totalLessons > 0
                ? 'Bạn đã hoàn thành tất cả bài học! 🎉'
                : `Còn ${totalLessons - completedLessons} bài học cần hoàn thành`}
            </Text>
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
            <TouchableOpacity style={styles.quickPracticeCard} onPress={() => router.push('/flashcards?limit=10' as any)}>
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
  notificationButton: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    padding: spacing.sm,
    borderRadius: 20,
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
  userLevelBadge: {
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  userLevelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});


