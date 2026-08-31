import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

interface LeaderboardItem {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  expPoints: number;
  currentStreak: number;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [myStreak, setMyStreak] = useState<any>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>(`/leaderboard/top?period=${period}`);
      setLeaderboard(Array.isArray(res) ? res : res?.data || []);

      const me = await api.get<any>('/leaderboard/streaks/me');
      setMyStreak(me?.data || me);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: 'emoji-events', color: '#eab308', bg: '#fef9c3', label: '1st' };
    if (rank === 2) return { icon: 'emoji-events', color: '#94a3b8', bg: '#f1f5f9', label: '2nd' };
    if (rank === 3) return { icon: 'emoji-events', color: '#b45309', bg: '#ffedd5', label: '3rd' };
    return { icon: null, color: '#64748b', bg: '#f8fafc', label: `#${rank}` };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng Xếp Hạng & Streak</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* User My Streak Banner */}
        {myStreak ? (
          <View style={styles.myStreakCard}>
            <View style={styles.streakInfo}>
              <View style={styles.flameIconBox}>
                <Text style={styles.flameEmoji}>🔥</Text>
              </View>
              <View>
                <Text style={styles.myStreakTitle}>Chuỗi {myStreak.currentStreak || 1} ngày liên tiếp!</Text>
                <Text style={styles.myStreakSub}>Tổng tích lũy: {myStreak.totalExpPoints || 50} EXP</Text>
              </View>
            </View>
            <View style={styles.streakBadgeBox}>
              <Text style={styles.streakBadgeText}>Cao nhất: {myStreak.maxStreak || 1} ngày</Text>
            </View>
          </View>
        ) : null}

        {/* Period Selector Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, period === 'weekly' && styles.tabButtonActive]}
            onPress={() => setPeriod('weekly')}
          >
            <Text style={[styles.tabText, period === 'weekly' && styles.tabTextActive]}>Tuần này</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, period === 'monthly' && styles.tabButtonActive]}
            onPress={() => setPeriod('monthly')}
          >
            <Text style={[styles.tabText, period === 'monthly' && styles.tabTextActive]}>Tháng này</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, period === 'all' && styles.tabButtonActive]}
            onPress={() => setPeriod('all')}
          >
            <Text style={[styles.tabText, period === 'all' && styles.tabTextActive]}>Tất cả</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.leaderboardList}>
            {leaderboard.map((item) => {
              const badge = getRankBadge(item.rank);
              return (
                <View key={item.userId} style={styles.rankCard}>
                  <View style={[styles.rankNumberBox, { backgroundColor: badge.bg }]}>
                    {badge.icon ? (
                      <MaterialIcons name={badge.icon as any} size={20} color={badge.color} />
                    ) : (
                      <Text style={[styles.rankNumberText, { color: badge.color }]}>{badge.label}</Text>
                    )}
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.displayName}</Text>
                    <View style={styles.streakMiniRow}>
                      <Text style={styles.streakMiniText}>🔥 {item.currentStreak} ngày</Text>
                    </View>
                  </View>

                  <View style={styles.expBox}>
                    <Text style={styles.expText}>{item.expPoints.toLocaleString('vi-VN')}</Text>

                    <Text style={styles.expLabel}>EXP</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  myStreakCard: {
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#ffedd5',
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flameIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameEmoji: { fontSize: 24 },
  myStreakTitle: { fontSize: 16, fontWeight: '800', color: '#c2410c' },
  myStreakSub: { fontSize: 13, color: '#9a3412', marginTop: 2 },
  streakBadgeBox: { backgroundColor: '#f97316', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  streakBadgeText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#ffffff' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  leaderboardList: { gap: 10 },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  rankNumberBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumberText: { fontSize: 14, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: colors.text },
  streakMiniRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  streakMiniText: { fontSize: 12, color: '#ea580c', fontWeight: '600' },
  expBox: { alignItems: 'flex-end' },
  expText: { fontSize: 16, fontWeight: '800', color: colors.primary },
  expLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
});
