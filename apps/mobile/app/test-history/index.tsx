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
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IT English Pro</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <MaterialIcons name="more-vert" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Lịch sử bài thi</Text>
          <Text style={styles.pageSubtitle}>Xem lại các bài thi gần đây để theo dõi sự tiến bộ của bạn.</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Text style={[styles.filterText, styles.filterTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Gần đây</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Theo chứng chỉ</Text>
          </TouchableOpacity>
        </ScrollView>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có lịch sử làm bài</Text>
        ) : (
          <View style={styles.listContent}>
            {history.map((item: any) => {
              const isPassed = item.isPassed ?? item.passed ?? false;
              const displayScore = Math.round(item.scorePercent ?? item.score ?? 0);
              const cardColor = isPassed ? '#16a34a' : '#ba1a1a';
              const tagColor = isPassed ? colors.primary : '#0058be';
              const tagBg = isPassed ? '#e2dfff' : '#d8e2ff'; // primary-fixed / secondary-fixed

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => router.push(`/test-result/${item.id}` as any)}
                  activeOpacity={0.8}
                >
                  {/* Left Indicator Line */}
                  <View style={[styles.cardIndicator, { backgroundColor: cardColor }]} />
                  
                  <View style={styles.cardMain}>
                    <View style={styles.cardLeft}>
                      <View style={[styles.domainTag, { backgroundColor: tagBg }]}>
                        <Text style={[styles.domainTagText, { color: tagColor }]}>
                          {item.exam?.domain?.name || 'Tổng hợp'}
                        </Text>
                      </View>
                      <Text style={styles.cardTitle}>{item.exam?.title}</Text>
                    </View>
                    
                    <View style={styles.cardRight}>
                      <Text style={[styles.scoreText, { color: cardColor }]}>
                        {displayScore}%
                      </Text>
                      <Text style={styles.cardDate}>{formatDate(item.createdAt || item.startedAt)}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    <MaterialIcons 
                      name={isPassed ? 'check-circle' : 'cancel'} 
                      size={16} 
                      color={cardColor} 
                    />
                    <Text style={[styles.statusText, { color: cardColor }]}>
                      {isPassed ? 'Đạt' : 'Chưa đạt'}
                    </Text>
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
                  <MaterialIcons name="chevron-left" size={20} color={currentPage === 1 ? '#c7c4d8' : '#191c1e'} />
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>{currentPage} / {totalPages}</Text>

                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <MaterialIcons name="chevron-right" size={20} color={currentPage === totalPages ? '#c7c4d8' : '#191c1e'} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    backgroundColor: '#f7f9fb',
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    marginTop: 20
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary
  },
  scrollContent: {
    paddingBottom: 48,
  },
  pageHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#191c1e',
    marginBottom: spacing.xs,
    letterSpacing: -0.2
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#464555',
    lineHeight: 20
  },
  filtersList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'center'
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555'
  },
  filterTextActive: {
    color: '#ffffff'
  },
  loadingContainer: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
    color: '#464555',
    marginTop: spacing.xl
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: spacing.xs
  },
  cardLeft: {
    flex: 1,
    paddingRight: spacing.sm,
    gap: spacing.xs
  },
  domainTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  domainTagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    lineHeight: 20
  },
  cardRight: {
    alignItems: 'flex-end',
    flexShrink: 0
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600'
  },
  cardDate: {
    fontSize: 12,
    color: '#464555',
    marginTop: 2
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.xs,
    marginTop: spacing.sm
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    width: 40,
    height: 40,
    borderRadius: 8
  },
  pageBtnDisabled: {
    backgroundColor: '#f7f9fb',
    borderColor: '#e6e8ea'
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e'
  }
});
