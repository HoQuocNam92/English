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

  useEffect(() => {
    fetchExams();
    api.get<any>('/payment/subscription/me')
      .then(res => {
        const sub = res?.data || res;
        setIsPro(sub?.isPro ?? false);
      })
      .catch(() => {});
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Luyện tập kỹ năng</Text>
        <Text style={styles.subtitle}>
          Rèn luyện phản xạ thuật ngữ và chuẩn bị tốt nhất cho kỳ thi chứng chỉ.
        </Text>
      </View>

      {/* Modes Grid */}
      <View style={styles.modesList}>
        <Text style={[styles.title, { fontSize: 18, marginTop: 10 }]}>Luyện tập AI</Text>
        <TouchableOpacity style={styles.modeCard} onPress={() => router.push('/mock-interview' as any)}>
          <View style={styles.cardHeader}>
             <View style={[styles.iconBox, { backgroundColor: '#ede9fe' }]}><MaterialIcons name="mic" size={24} color={colors.primary} /></View>
             <Text style={styles.modeTitle}>🎤 AI Mock Interview</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeCard} onPress={() => router.push('/writing-practice' as any)}>
          <View style={styles.cardHeader}>
             <View style={[styles.iconBox, { backgroundColor: '#ede9fe' }]}><MaterialIcons name="edit" size={24} color={colors.primary} /></View>
             <Text style={styles.modeTitle}>✍️ AI Writing Practice</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.title, { fontSize: 18, marginTop: 10 }]}>Đề thi</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          exams.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              style={[styles.modeCard, exam.isProOnly && { borderColor: '#f59e0b', backgroundColor: '#fffbeb' }]}
              onPress={() => handleExamPress(exam)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: exam.isProOnly ? '#fef3c7' : '#ede9fe' }]}>
                  <MaterialIcons name={exam.isProOnly ? "workspace-premium" : "quiz"} size={24} color={exam.isProOnly ? "#d97706" : colors.primary} />
                </View>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                  <View style={[styles.badge, { backgroundColor: '#ede9fe' }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>{exam.domain?.name || 'Tổng hợp'}</Text>
                  </View>
                  {exam.isProOnly && (
                    <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
                      <Text style={[styles.badgeText, { color: '#b45309', fontWeight: '800' }]}>👑 PRO</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.modeTitle}>{exam.title}</Text>
              <Text style={styles.modeDesc}>{exam.description || `Đề thi gồm ${exam.questionCount || 5} câu hỏi.`}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.modeStats}>{exam.questionCount || 5} câu · {exam.durationMinutes} phút</Text>
                <MaterialIcons name={exam.isProOnly && !isPro ? "lock" : "arrow-forward"} size={18} color={exam.isProOnly && !isPro ? "#d97706" : colors.primary} />
              </View>
            </TouchableOpacity>
          ))
        )}
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
  modesList: {
    gap: spacing.md
  },
  modeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2
  },
  modeDesc: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 2
  },
  modeStats: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text
  }
});
