import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
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
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);

  const fetchHomeData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [meRes, progRes, recRes, lessonsRes, flashRes, voucherRes] = await Promise.allSettled([
        api.get<any>('/auth/me'),
        api.get<any>('/progress/me'),
        api.get<any>('/recommendations/my'),
        api.get<any>('/lessons?limit=4'),
        api.get<any>('/flash-sales/active'),
        api.get<any>('/vouchers/active'),
      ]);

      if (meRes.status === 'fulfilled') setUserData(meRes.value);
      if (progRes.status === 'fulfilled') setProgressData(progRes.value);
      if (recRes.status === 'fulfilled') setRecommendation(recRes.value);
      if (lessonsRes.status === 'fulfilled') setLessons(lessonsRes.value?.data || lessonsRes.value || []);
      if (flashRes.status === 'fulfilled') setFlashSales(Array.isArray(flashRes.value) ? flashRes.value : []);
      if (voucherRes.status === 'fulfilled') setVouchers(Array.isArray(voucherRes.value) ? voucherRes.value : []);
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
  const progressPercent = summary.overallCompletionPercent ?? summary.completionPercent ?? (progressData?.progress?.length > 0 ? 35 : 15);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Chào {name} 👋</Text>
          <Text style={styles.subGreeting}>Tiếp tục hành trình học hôm nay</Text>
        </View>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#ffedd5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 10 }}
          onPress={() => router.push('/leaderboard' as any)}
        >
          <Text style={{ fontSize: 16, marginRight: 4 }}>🔥</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#c2410c' }}>{streakDays}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBox} onPress={() => router.push('/(tabs)/profile' as any)}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </TouchableOpacity>
      </View>

      {/* Global Search Bar */}
      <View style={styles.searchBoxContainer}>
        <MaterialIcons name="search" size={20} color={colors.mutedText} />
        <TextInput
          style={styles.searchBoxInput}
          placeholder="Tìm từ vựng, bài học, đề thi..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => {
            if (searchQuery.trim()) router.push(`/lessons?search=${encodeURIComponent(searchQuery)}` as any);
          }}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={18} color={colors.mutedText} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Hero Goal Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Mục tiêu hiện tại</Text>
        <Text style={styles.heroTitle}>{goalTitle}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{progressPercent}% hoàn thành</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={() => router.push((lessons.length > 0 ? `/lessons/${lessons[0].id}` : '/lessons') as any)}
        >
          <Text style={styles.continueButtonText}>Tiếp tục học bài gần nhất</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* ⚡ Promos & Flash Sale Card (Only shown if active in API) */}
      {(flashSales.length > 0 || vouchers.length > 0) && (
        <View style={styles.promoContainer}>
          <View style={styles.promoHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="local-offer" size={16} color={colors.primary} />
              <Text style={styles.promoTitle}>ƯU ĐÃI KHUYẾN MÃI HOẠT ĐỘNG</Text>
            </View>
            {flashSales.length > 0 && (
              <View style={styles.badgeSale}>
                <Text style={styles.badgeSaleText}>-{flashSales[0].discountPercent}%</Text>
              </View>
            )}
          </View>
          <Text style={styles.promoDesc}>
            {flashSales[0]?.title || 'Danh sách mã giảm giá và chương trình ưu đãi mới nhất!'}
          </Text>

          {/* Voucher chips */}
          {vouchers.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {vouchers.map((v: any) => (
                <View key={v.id || v.code} style={styles.voucherChip}>
                  <MaterialIcons name="confirmation-number" size={14} color={colors.primary} />
                  <Text style={styles.voucherChipCode}>{v.code}</Text>
                  <Text style={styles.voucherChipText}>({v.name})</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.promoButton}
            activeOpacity={0.8}
            onPress={() => router.push('/payment' as any)}
          >
            <Text style={styles.promoButtonText}>Nâng cấp PRO & Áp dụng Voucher</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* AI Recommendation Card */}
      {recommendation && (
        <View style={styles.aiCard}>
          <View style={styles.aiIconBox}>
            <MaterialIcons name="psychology" size={24} color={colors.aiAccent} />
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>AI Gợi ý ôn tập</Text>
            <Text style={styles.aiDesc}>
              {recommendation.hint || `Dựa trên dữ liệu học gần đây, bạn nên củng cố phần ${recommendation.topic || 'từ vựng'}.`}
            </Text>
            <TouchableOpacity
              style={styles.aiAction}
              onPress={() => router.push((recommendation?.resourceId ? `/lessons/${recommendation.resourceId}` : '/lessons') as any)}
            >
              <Text style={styles.aiActionText}>Ôn tập ngay</Text>
              <MaterialIcons name="chevron-right" size={16} color={colors.aiAccent} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Streak & Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <View>
            <Text style={styles.statValue}>{streakDays} Ngày</Text>
            <Text style={styles.statLabel}>Chuỗi học liên tiếp</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📖</Text>
          <View>
            <Text style={styles.statValue}>{wordsCount} Từ</Text>
            <Text style={styles.statLabel}>Đã thuộc</Text>
          </View>
        </View>
      </View>

      {/* Tiếp tục học (Horizontal list) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bài học tiếp theo</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/learning' as any)}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {lessons.length > 0 ? (
            lessons.map((lesson, idx) => (
              <TouchableOpacity
                key={lesson.id || idx}
                style={styles.lessonCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/lessons/${lesson.id || 'les-1'}` as any)}
              >
                <View style={styles.lessonTag}>
                  <Text style={styles.lessonTagText}>{typeof lesson.domain === 'object' ? lesson.domain?.name : lesson.domain || 'General'}</Text>
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonMeta}>
                  {lesson.termCount || 0} thuật ngữ · {lesson.questionCount || 0} câu trắc nghiệm
                </Text>
                <View style={styles.cardProgress}>
                  <View style={[styles.cardProgressFill, { width: `${lesson.progress || 0}%` }]} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: colors.mutedText }}>Chưa có bài học nào.</Text>
          )}
        </ScrollView>
      </View>
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
    paddingBottom: 30,
    gap: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text
  },
  subGreeting: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 2
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  searchBoxInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 4
  },
  heroCard: {
    backgroundColor: '#f5f3ff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    gap: spacing.xs
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 2
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  lessonsCountText: {
    fontSize: 12,
    color: colors.mutedText
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginVertical: spacing.xs,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  continueButton: {
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  continueButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  aiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.aiAccent,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    gap: spacing.md
  },
  aiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiContent: {
    flex: 1
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.aiAccent,
    marginBottom: 2
  },
  aiDesc: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16,
    marginBottom: 6
  },
  aiAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  aiActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.aiAccent
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  statEmoji: {
    fontSize: 24
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text
  },
  statLabel: {
    fontSize: 11,
    color: colors.mutedText
  },
  section: {
    gap: spacing.sm
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary
  },
  horizontalList: {
    gap: spacing.md,
    paddingRight: spacing.lg
  },
  lessonCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  lessonTag: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  lessonTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2
  },
  lessonMeta: {
    fontSize: 11,
    color: colors.mutedText
  },
  cardProgress: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden'
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2
  },
  boldText: {
    fontWeight: '700',
    color: colors.text
  },
  promoContainer: {
    backgroundColor: '#3525cd',
    borderRadius: 16,
    padding: 16,
    marginBottom: spacing.md,
    shadowColor: '#3525cd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  promoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  badgeSale: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeSaleText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  promoDesc: {
    fontSize: 12,
    color: '#e0e7ff',
    lineHeight: 16,
  },
  voucherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  voucherChipCode: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  voucherChipText: {
    fontSize: 10,
    color: '#475569',
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
    gap: 6,
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
});

