import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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
  status: string;
}

export default function MobilePracticeScreen() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await api.get<{ data: Exam[] }>('/exams?limit=10&status=published');
        // The endpoint usually returns { data: [...] } or just an array depending on the backend, 
        // assuming { data } based on standard REST patterns, if not we will adjust.
        // Let's support both array and { data }
        setExams(Array.isArray(data) ? data : (data?.data || []));
      } catch (error) {
        console.error('Failed to fetch exams', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

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
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          exams.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              style={styles.modeCard}
              onPress={() => router.push(`/quiz/${exam.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#f0f9ff' }]}>
                  <MaterialIcons name="quiz" size={24} color="#0284c7" />
                </View>
                <View style={[styles.badge, { backgroundColor: '#f0f9ff' }]}>
                  <Text style={[styles.badgeText, { color: '#0284c7' }]}>{exam.domain?.name || 'Tổng hợp'}</Text>
                </View>
              </View>

              <Text style={styles.modeTitle}>{exam.title}</Text>
              <Text style={styles.modeDesc}>{exam.description || `Đề thi gồm ${exam.questionCount} câu hỏi.`}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.modeStats}>{exam.questionCount} câu · {exam.durationMinutes} phút</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#0284c7" />
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
