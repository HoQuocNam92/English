import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

interface Exam {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  questionCount: number;
  domain?: { name: string };
  isProOnly?: boolean;
  status: string;
}

export default function MobilePracticeScreen() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [recentAttempt, setRecentAttempt] = useState<any>(null);

  useEffect(() => {
    fetchExams();
    api.get<any>('/payment/subscription/me')
      .then(res => {
        const sub = res?.data || res;
        setIsPro(sub?.isPro ?? false);
      })
      .catch(() => {});
    api.get<any>('/exams/attempts/my').then(response => {
      const items = response?.data || response || [];
      setRecentAttempt(Array.isArray(items) ? items[0] : null);
    }).catch(() => {});
  }, []);

  const fetchExams = async () => {
    try {
      const data = await api.get<any>('/exams?limit=10&status=published');
      const items = Array.isArray(data) ? data : (data?.data || data?.items || []);
      setExams(items);
    } catch (error) {
      console.error('Failed to fetch exams', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExamPress = (exam: Exam) => {
    if (exam.isProOnly && !isPro) {
      Alert.alert(
        '🌟 Gói PRO Chuyên Nghiệp',
        `Đề thi "${exam.title}" dành riêng cho tài khoản PRO. Bạn có muốn nâng cấp PRO để mở khóa toàn bộ bài học & đề thi không?`,
        [
          { text: 'Để sau', style: 'cancel' },
          { text: '🚀 Nâng cấp PRO', onPress: () => router.push('/payment') }
        ]
      );
      return;
    }
    router.push(`/quiz/${exam.id}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* TopAppBar (Visible on Mobile implicitly from navigation, or here manually if hidden) */}
      <View style={styles.headerBar}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>IT English Pro</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/test-history' as any)}>
          <MaterialIcons name="more-vert" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Luyện tập</Text>
          <Text style={styles.subtitle}>
            Chọn một kỹ năng để bắt đầu nâng cao trình độ của bạn.
          </Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Vocabulary Practice (Full Width) */}
          <TouchableOpacity style={[styles.bentoCard, styles.bentoCardFull]} onPress={() => router.push('/lessons?type=vocabulary' as any)}>
            <View style={styles.bentoHeaderRow}>
              <View style={[styles.bentoIconBox, { backgroundColor: '#e2dfff' }]}>
                <MaterialIcons name="style" size={24} color="#3525cd" />
              </View>
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Phổ biến</Text>
              </View>
            </View>
            <View>
              <Text style={styles.bentoTitleLarge}>Vocabulary Practice</Text>
              <Text style={styles.bentoDesc}>Ôn tập từ vựng chuyên ngành CNTT qua thẻ ghi nhớ thông minh.</Text>
            </View>
          </TouchableOpacity>

          {/* Technical Reading (Half Width) */}
          <TouchableOpacity style={styles.bentoCard} onPress={() => router.push('/reading-lab' as any)}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#d8e2ff', marginBottom: spacing.md }]}>
              <MaterialIcons name="menu-book" size={24} color="#0058be" />
            </View>
            <View>
              <Text style={styles.bentoTitleSmall}>Technical Reading</Text>
              <Text style={styles.bentoDesc}>Đọc hiểu tài liệu kỹ thuật, tài liệu API và blog công nghệ.</Text>
            </View>
          </TouchableOpacity>

          {/* Scenario Challenges (Half Width) */}
          <TouchableOpacity style={styles.bentoCard} onPress={async () => {
            try {
              const response: any = await api.get('/questions?type=scenario&status=published&limit=1');
              const question = response?.data?.[0] || response?.items?.[0];
              if (question?.id) router.push(`/scenario/${question.id}` as any);
              else Alert.alert('Chưa có dữ liệu', 'Hiện chưa có tình huống nào đã xuất bản.');
            } catch { Alert.alert('Lỗi', 'Không thể tải tình huống lúc này.'); }
          }}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#7531e6', marginBottom: spacing.md }]}>
              <MaterialIcons name="chat-bubble" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.bentoTitleSmall}>Scenario Challenges</Text>
              <Text style={styles.bentoDesc}>Thực hành giao tiếp qua các tình huống thực tế tại nơi làm việc.</Text>
            </View>
          </TouchableOpacity>

          {/* Mock Tests (Full Width) */}
          <TouchableOpacity style={[styles.bentoCard, styles.bentoCardFull]} onPress={() => exams.length > 0 ? handleExamPress(exams[0]) : null}>
            <View style={styles.bentoRow}>
              <View style={[styles.bentoIconBox, { backgroundColor: '#e0e3e5', marginBottom: 0, marginRight: spacing.md }]}>
                <MaterialIcons name="checklist" size={24} color="#464555" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoTitleLarge}>Mock Tests</Text>
                <Text style={styles.bentoDesc}>Kiểm tra tổng hợp kỹ năng nghe, đọc, viết theo chuẩn chứng chỉ.</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityLeft}>
              <View style={styles.activityIconBox}>
                <MaterialIcons name="history" size={20} color="#464555" />
              </View>
              <View>
                <Text style={styles.activityTitle}>{recentAttempt?.exam?.title || 'Chưa có hoạt động luyện tập'}</Text>
                <Text style={styles.activityMeta}>{recentAttempt ? `Bài kiểm tra • ${Math.round(recentAttempt.scorePercent ?? 0)} điểm` : 'Hãy bắt đầu một bài kiểm tra'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.continueBtn} onPress={() => recentAttempt?.id ? router.push(`/test-result/${recentAttempt.id}` as any) : router.push('/lessons?type=vocabulary' as any)}>
              <Text style={styles.continueBtnText}>Tiếp tục</Text>
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
  headerButton: {
    padding: spacing.xs,
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
  },
  header: {
    marginBottom: spacing.lg
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
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  bentoCard: {
    width: '47.5%', // approx half width with gap
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: 'space-between',
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bentoCardFull: {
    width: '100%',
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bentoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bentoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    backgroundColor: '#eceef0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#464555',
  },
  bentoTitleLarge: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: 4,
  },
  bentoTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: 4,
  },
  bentoDesc: {
    fontSize: 12,
    color: '#464555',
    lineHeight: 18,
  },
  recentActivitySection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: spacing.md,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  activityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6e8ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
  },
  activityMeta: {
    fontSize: 12,
    color: '#464555',
    marginTop: 2,
  },
  continueBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});
