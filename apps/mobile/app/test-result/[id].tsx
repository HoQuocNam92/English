import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

interface AttemptResult {
  id: string;
  score: number;
  isPassed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  exam: { title: string; passingScore: number };
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
        <Text style={{ marginTop: spacing.md }}>Đang tải kết quả...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Không tìm thấy kết quả</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/(tabs)/practice')}>
          <Text style={styles.backHomeText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/(tabs)/practice')}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả thi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={[styles.statusIcon, { backgroundColor: result.isPassed ? '#dcfce7' : '#fee2e2' }]}>
          <MaterialIcons 
            name={result.isPassed ? 'check-circle' : 'cancel'} 
            size={48} 
            color={result.isPassed ? '#16a34a' : '#dc2626'} 
          />
        </View>
        <Text style={styles.examTitle}>{result.exam?.title || 'Bài thi'}</Text>
        
        <Text style={[styles.passStatus, { color: result.isPassed ? '#16a34a' : '#dc2626' }]}>
          {result.isPassed ? 'Chúc mừng! Bạn đã đạt' : 'Rất tiếc! Bạn chưa đạt'}
        </Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{result.score.toFixed(0)}</Text>
          <Text style={styles.scoreLabel}>Điểm số</Text>
        </View>
        <Text style={styles.passingScoreText}>Điểm đạt: {result.exam?.passingScore || 70}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Chi tiết làm bài</Text>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <MaterialIcons name="list-alt" size={20} color={colors.mutedText} style={{ marginRight: 8 }} />
            <Text style={styles.statLabelText}>Tổng số câu</Text>
          </View>
          <Text style={styles.statValue}>{result.totalQuestions}</Text>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <MaterialIcons name="check-circle-outline" size={20} color="#16a34a" style={{ marginRight: 8 }} />
            <Text style={styles.statLabelText}>Số câu đúng</Text>
          </View>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{result.correctAnswersCount}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <MaterialIcons name="highlight-off" size={20} color="#dc2626" style={{ marginRight: 8 }} />
            <Text style={styles.statLabelText}>Số câu sai</Text>
          </View>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{result.incorrectAnswersCount}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={() => router.replace('/(tabs)/practice')}
      >
        <Text style={styles.actionBtnText}>Trở về luyện tập</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  passStatus: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.lg
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '600'
  },
  passingScoreText: {
    fontSize: 13,
    color: colors.mutedText
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statLabelText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500'
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  backHomeBtn: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8
  },
  backHomeText: {
    color: '#fff',
    fontWeight: '600'
  }
});
