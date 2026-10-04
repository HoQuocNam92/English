import { LearningAgenda } from '../../src/features/learning/LearningAgenda';
import { mobileRoute } from '../../src/shared/navigation';
import { Text, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

export default function MobileHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [journey, setJourney] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const fetchHomeData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [meRes, profRes, progRes, journeyRes, recommendationsRes, certificatesRes] = await Promise.allSettled([
        api.get<any>('/auth/me'),
        api.get<any>('/learner-profiles/me'),
        api.get<any>('/progress/me'),
        api.get<any>('/learner-profiles/me/journey'),
        api.get<any>('/recommendations/me'),
        api.get<any>('/certificates'),
      ]);

      if (meRes.status === 'rejected') throw meRes.reason;
      if (meRes.status === 'fulfilled') setUserData(meRes.value);
      setProfileData(profRes.status === 'fulfilled' ? profRes.value : null);
      setProgressData(progRes.status === 'fulfilled' ? progRes.value : null);
      setJourney(journeyRes.status === 'fulfilled' ? journeyRes.value : null);
      if (recommendationsRes.status === 'fulfilled') {
        const items = recommendationsRes.value?.recommendations ?? [];
        setRecommendations(Array.isArray(items) ? items.filter((item: any) => item.type !== 'lesson') : []);
      }
      if (certificatesRes.status === 'fulfilled') {
        const items = certificatesRes.value?.data || certificatesRes.value || [];
        setCertificates(Array.isArray(items) ? items : []);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchHomeData();
  }, []));

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

  const certificateGoalId = profileData?.certGoals?.[0]?.certificate?.id;
  const firstCertificate = certificates.find((item: any) => item.id === certificateGoalId);
  const certificateProgress = (progressData?.certProgress || []).find((item: any) => item.certificateId === firstCertificate?.id);
  const progressPercent = Math.min(100, Math.max(0, Math.round(certificateProgress?.completionPercent ?? certificateProgress?.avgScore ?? 0)));
  const journeyConfigured = journey?.configured === true;
  const smartPath = journey?.targets?.learningPathMode !== 'self';

  const openRecommendation = (item: any) => {
    router.push(mobileRoute(String(item?.actionUrl || '/learn')) as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Fixed */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarBoxSmall}>
            <Text style={styles.avatarTextSmall}>{avatarLetter}</Text>
          </View>
          <View style={{ flex: 1 }}>
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
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        <View style={{ gap: spacing.sm }}>
          {[
            ['Trình độ tiếng Anh', profileData?.level?.name],
            ['Lĩnh vực CNTT', profileData?.domains?.map((item: any) => item.domain?.name).filter(Boolean).join(', ')],
            ['Chứng chỉ mục tiêu', profileData?.certGoals?.map((item: any) => item.certificate?.name).filter(Boolean).join(', ')],
          ].map(([label, value]) => <View key={label} style={styles.dailyGoalCard}>
            <Text style={styles.recommendationReason}>{label}</Text>
            <Text style={styles.recommendationTitle}>{value || 'Chưa thiết lập'}</Text>
          </View>)}
        </View>

        <LearningAgenda />
        {!journeyConfigured ? (
          <View style={styles.setupCard}>
            <View style={styles.setupIcon}><MaterialIcons name="route" size={26} color={colors.primary} /></View>
            <Text style={styles.setupTitle}>Bạn chưa thiết lập lộ trình học tập</Text>
            <Text style={styles.setupDescription}>Thiết lập trình độ, lĩnh vực CNTT và mục tiêu học để cá nhân hóa lộ trình.</Text>
            <TouchableOpacity style={styles.setupButton} onPress={() => router.push('/profile/edit' as any)}>
              <Text style={styles.setupButtonText}>Thiết lập lộ trình</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : firstCertificate ? (
        <View style={styles.heroCard}>
          <View style={styles.heroCardHeader}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="workspace-premium" size={12} color="#ffffff" />
              <Text style={styles.heroBadgeText}>{progressPercent > 0 ? 'Đang ôn luyện' : 'Chứng chỉ mục tiêu'}</Text>
            </View>
            <Text style={styles.heroTimeText}>{firstCertificate.code}</Text>
          </View>
          <Text style={styles.heroTitle}>{firstCertificate.name}</Text>
          <Text style={styles.heroSubtitle}>
            {firstCertificate.provider || 'Chứng chỉ CNTT quốc tế'}
          </Text>

          <View style={styles.heroProgressContainer}>
            <View style={styles.heroProgressLabels}>
              <Text style={styles.heroProgressLabelText}>Mức độ sẵn sàng</Text>
              <Text style={styles.heroProgressValueText}>{progressPercent}%</Text>
            </View>
            <View style={styles.heroProgressBarBg}>
              <View style={[styles.heroProgressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/certifications/[id]', params: { id: firstCertificate.id, name: firstCertificate.name, code: firstCertificate.code, progress: String(progressPercent) } } as any)}
          >
            <Text style={styles.heroButtonText}>{progressPercent > 0 ? 'Tiếp tục ôn luyện' : 'Xem lộ trình'}</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        ) : null}

        {journeyConfigured && <View style={styles.dailyGoalCard}>
          <Text style={styles.sectionTitle}>Mục tiêu học tập hôm nay</Text>
          {[
            { label: 'Từ vựng hôm nay', value: journey.progress?.vocabularyToday, target: journey.targets?.vocabularyPerDay, percent: journey.progress?.vocabularyPercent },
            { label: 'Phút học hôm nay', value: journey.progress?.studyMinutesToday, target: journey.targets?.minutesPerDay, percent: journey.progress?.studyMinutesPercent },
            { label: 'Bài thi tuần này', value: journey.progress?.examsWeek, target: journey.targets?.examsPerWeek, percent: journey.progress?.examWeekPercent },
          ].map(goal => <View key={goal.label} style={{ marginTop: 12 }}>
            <View style={styles.dailyGoalHeader}>
              <Text style={styles.dailyGoalDesc}>{goal.label}: {goal.value ?? 0}/{goal.target ?? 0}</Text>
              <Text style={styles.dailyGoalBadgeText}>{Math.round(goal.percent ?? 0)}%</Text>
            </View>
            <View style={[styles.heroProgressBarBg, { backgroundColor: '#e6e8ea' }]}>
              <View style={[styles.heroProgressBarFill, { backgroundColor: colors.primary, width: `${Math.min(100, Math.max(0, goal.percent ?? 0))}%` }]} />
            </View>
          </View>)}
          {journey.targets?.reminderEnabled && journey.targets?.reminderTime && <Text style={[styles.dailyGoalDesc, { marginTop: 12 }]}>Nhắc học lúc {journey.targets.reminderTime} mỗi ngày</Text>}
          <TouchableOpacity style={styles.setupButton} onPress={() => router.push('/profile/edit')}>
            <Text style={styles.setupButtonText}>Điều chỉnh mục tiêu</Text>
          </TouchableOpacity>
        </View>}

        {journeyConfigured && smartPath && recommendations.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Gợi ý dành cho bạn</Text></View>
            <View style={{ gap: spacing.sm }}>
              {recommendations.slice(0, 3).map((item: any) => (
                <TouchableOpacity key={item.id} style={styles.recommendationCard} onPress={() => openRecommendation(item)}>
                  <View style={styles.recommendationIcon}><MaterialIcons name={item.type === 'exam' ? 'quiz' : item.type === 'vocab' ? 'style' : 'auto-stories'} size={20} color={colors.primary} /></View>
                  <View style={{ flex: 1 }}><Text style={styles.recommendationTitle} numberOfLines={2}>{item.title}</Text><Text style={styles.recommendationReason} numberOfLines={2}>{item.reason}</Text></View>
                  <MaterialIcons name="arrow-forward-ios" size={16} color="#777587" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Kết quả kiểm tra gần đây</Text></View>
          <View style={{ gap: spacing.sm }}>
            {(progressData?.recentAttempts ?? []).slice(0, 3).map((attempt: any) => (
              <TouchableOpacity key={attempt.id} style={styles.recommendationCard} onPress={() => router.push(`/test-result/${attempt.id}` as any)}>
                <MaterialIcons name="assignment" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendationTitle}>{attempt.exam?.title ?? 'Bài thi chứng chỉ'}</Text>
                  <Text style={styles.recommendationReason}>{new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString('vi-VN')} · Xem kết quả</Text>
                </View>
                <Text style={styles.dailyGoalBadgeText}>{attempt.scorePercent == null ? 'Chờ chấm' : `${Math.round(attempt.scorePercent)}%`}</Text>
              </TouchableOpacity>
            ))}
            {progressData && !progressData.recentAttempts?.length && <Text style={styles.dailyGoalDesc}>Bạn chưa có kết quả bài kiểm tra.</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.recommendationCard} onPress={() => router.push('/certifications')}>
          <MaterialIcons name="workspace-premium" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.recommendationTitle}>{firstCertificate ? 'Khám phá chứng chỉ' : 'Chọn chứng chỉ mục tiêu'}</Text>
            <Text style={styles.recommendationReason}>Học theo Domain, Topic và luyện thi thử.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
        </TouchableOpacity>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
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
    flex: 1,
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
  setupCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ddd6fe', borderRadius: 16, padding: spacing.lg, alignItems: 'center' },
  setupIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  setupTitle: { fontSize: 18, fontWeight: '800', color: '#191c1e', textAlign: 'center' },
  setupDescription: { marginTop: 8, fontSize: 13, lineHeight: 19, color: '#5f5d6d', textAlign: 'center' },
  setupButton: { marginTop: spacing.md, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  setupButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
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
  dailyGoalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
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
  recommendationCard: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderWidth: 1, borderColor: '#ddd6fe', borderRadius: 12, backgroundColor: '#ffffff' },
  recommendationIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  recommendationTitle: { fontSize: 14, fontWeight: '700', color: '#191c1e' },
  recommendationReason: { marginTop: 3, fontSize: 11, lineHeight: 16, color: '#5f5d6d' },
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


