import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

interface AttemptHistory {
  id: string;
  score: number;
  isPassed: boolean;
  createdAt: string;
  exam: {
    title: string;
    domain?: { name: string };
  };
}

export default function MobileTestHistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<AttemptHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get<{ data: AttemptHistory[] }>('/exams/attempts/my');
        setHistory(Array.isArray(data) ? data : (data?.data || []));
      } catch (error) {
        console.error('Failed to fetch test history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử kiểm tra</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có lịch sử làm bài</Text>
        ) : (
          history.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/test-result/${item.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={styles.domainTag}>
                  <Text style={styles.domainTagText}>{item.exam?.domain?.name || 'Tổng hợp'}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.exam?.title}</Text>
                <Text style={styles.cardDate}>Ngày thi: {formatDate(item.createdAt)}</Text>
              </View>

              <View style={styles.cardRight}>
                <Text style={[styles.scoreText, item.isPassed ? styles.scorePass : styles.scoreFail]}>
                  {item.score?.toFixed(0)}
                </Text>
                <View style={[styles.statusBadge, item.isPassed ? styles.statusBadgePass : styles.statusBadgeFail]}>
                  <Text style={[styles.statusText, item.isPassed ? styles.scorePass : styles.scoreFail]}>
                    {item.isPassed ? 'Đạt' : 'Chưa đạt'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md
  },
  emptyText: {
    textAlign: 'center',
    color: colors.mutedText,
    marginTop: spacing.xl
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardLeft: {
    flex: 1,
    marginRight: spacing.sm,
    gap: 2
  },
  domainTag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  domainTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2
  },
  cardDate: {
    fontSize: 11,
    color: colors.mutedText
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800'
  },
  scorePass: {
    color: '#16a34a'
  },
  scoreFail: {
    color: '#dc2626'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusBadgePass: {
    backgroundColor: '#dcfce7'
  },
  statusBadgeFail: {
    backgroundColor: '#fee2e2'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  }
});
