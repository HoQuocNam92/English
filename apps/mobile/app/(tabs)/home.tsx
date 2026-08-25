import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

export default function MobileHomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Chào Nam 👋</Text>
          <Text style={styles.subGreeting}>Tiếp tục hành trình học hôm nay</Text>
        </View>
        <TouchableOpacity style={styles.avatarBox} onPress={() => router.push('/(tabs)/profile' as any)}>
          <Text style={styles.avatarText}>N</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Goal Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Mục tiêu hiện tại</Text>
        <Text style={styles.heroTitle}>AWS Cloud Practitioner (CLF-C02)</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>68% hoàn thành</Text>
          <Text style={styles.lessonsCountText}>24/35 bài học</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '68%' }]} />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={() => router.push('/lessons/les-1' as any)}
        >
          <Text style={styles.continueButtonText}>Tiếp tục học bài gần nhất</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* AI Recommendation Card */}
      <View style={styles.aiCard}>
        <View style={styles.aiIconBox}>
          <MaterialIcons name="psychology" size={24} color={colors.aiAccent} />
        </View>
        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>AI Gợi ý ôn tập</Text>
          <Text style={styles.aiDesc}>
            Dựa trên 3 bài test gần đây, bạn cần củng cố thuật ngữ phần <Text style={styles.boldText}>VPC & IAM Policies</Text> để cải thiện tỷ lệ đúng.
          </Text>
          <TouchableOpacity
            style={styles.aiAction}
            onPress={() => router.push('/lessons/vocabulary/vocab-1' as any)}
          >
            <Text style={styles.aiActionText}>Ôn tập ngay</Text>
            <MaterialIcons name="chevron-right" size={16} color={colors.aiAccent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Streak & Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <View>
            <Text style={styles.statValue}>5 Ngày</Text>
            <Text style={styles.statLabel}>Chuỗi học liên tiếp</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📖</Text>
          <View>
            <Text style={styles.statValue}>48 Từ</Text>
            <Text style={styles.statLabel}>Đã thuộc tuần này</Text>
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
          <TouchableOpacity
            style={styles.lessonCard}
            activeOpacity={0.8}
            onPress={() => router.push('/lessons/les-1' as any)}
          >
            <View style={styles.lessonTag}>
              <Text style={styles.lessonTagText}>Cloud Computing</Text>
            </View>
            <Text style={styles.lessonTitle}>AWS IAM: Roles vs Policies</Text>
            <Text style={styles.lessonMeta}>15 thuật ngữ · 10 câu trắc nghiệm</Text>
            <View style={styles.cardProgress}>
              <View style={[styles.cardProgressFill, { width: '80%' }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lessonCard}
            activeOpacity={0.8}
            onPress={() => router.push('/lessons/les-2' as any)}
          >
            <View style={styles.lessonTag}>
              <Text style={styles.lessonTagText}>Software Eng</Text>
            </View>
            <Text style={styles.lessonTitle}>REST APIs & HTTP Status Codes</Text>
            <Text style={styles.lessonMeta}>20 thuật ngữ · 12 câu trắc nghiệm</Text>
            <View style={styles.cardProgress}>
              <View style={[styles.cardProgressFill, { width: '40%' }]} />
            </View>
          </TouchableOpacity>
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
    color: '#ffffff',
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
  }
});
