import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

interface AttemptHistory {
  id: string;
  score: number;
  isPassed: boolean;
  createdAt: string;
  startedAt?: string;
  exam: {
    title: string;
    domain?: { name: string };
  };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 10;

export default function MobileTestHistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<AttemptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchHistory = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.get<{ data: AttemptHistory[]; meta?: PaginationMeta }>(
        `/exams/attempts/my?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      if (Array.isArray(data)) {
        setHistory(data);
        setTotalPages(1);
        setTotalItems(data.length);
      } else {
        setHistory(data?.data || []);
        setTotalPages(data?.meta?.totalPages || 1);
        setTotalItems(data?.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch test history', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, fetchHistory]);

  const onRefresh = () => {
    if (currentPage === 1) {
      fetchHistory(1, true);
    } else {
      setCurrentPage(1);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {totalItems > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Tổng cộng: {totalItems} bài thi</Text>
              {totalPages > 1 && (
                <Text style={styles.metaText}>Trang {currentPage}/{totalPages}</Text>
              )}
            </View>
          )}

          {history.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có lịch sử làm bài</Text>
          ) : (
            <>
              {history.map((item: any) => {
                const isPassed = item.isPassed ?? item.passed ?? false;
                const displayScore = Math.round(item.scorePercent ?? item.score ?? 0);

                return (
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
                      <Text style={styles.cardDate}>Ngày thi: {formatDate(item.createdAt || item.startedAt)}</Text>
                    </View>

                    <View style={styles.cardRight}>
                      <Text style={[styles.scoreText, isPassed ? styles.scorePass : styles.scoreFail]}>
                        {displayScore}%
                      </Text>
                      <View style={[styles.statusBadge, isPassed ? styles.statusBadgePass : styles.statusBadgeFail]}>
                        <Text style={[styles.statusText, isPassed ? styles.scorePass : styles.scoreFail]}>
                          {isPassed ? 'Đạt' : 'Chưa đạt'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                    onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <MaterialIcons name="chevron-left" size={20} color={currentPage === 1 ? '#cbd5e1' : colors.text} />
                    <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>Trang trước</Text>
                  </TouchableOpacity>

                  <Text style={styles.pageIndicator}>{currentPage} / {totalPages}</Text>

                  <TouchableOpacity
                    style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                    onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>Trang sau</Text>
                    <MaterialIcons name="chevron-right" size={20} color={currentPage === totalPages ? '#cbd5e1' : colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText
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
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  pageBtnDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9'
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  pageBtnTextDisabled: {
    color: '#cbd5e1'
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text
  }
});
