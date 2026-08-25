import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

export default function MobileProgressScreen() {
  const router = useRouter();

  const domainSkills = [
    { name: 'Cloud Computing (AWS/GCP)', percent: 84, color: '#4f46e5' },
    { name: 'REST APIs & Web Architecture', percent: 92, color: '#16a34a' },
    { name: 'DevOps & CI/CD Pipelines', percent: 68, color: '#0284c7' },
    { name: 'Cybersecurity & InfoSec', percent: 52, color: '#7c3aed' },
    { name: 'Data Engineering & BigQuery', percent: 45, color: '#d97706' }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tiến độ học tập</Text>
        <Text style={styles.subtitle}>Theo dõi mức độ thành thạo và năng lực thi chứng chỉ.</Text>
      </View>

      {/* Streak Banner */}
      <View style={styles.streakCard}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakTitle}>Chuỗi 5 Ngày liên tiếp</Text>
            <Text style={styles.streakSub}>Học ít nhất 15 phút mỗi ngày</Text>
          </View>
        </View>
        <View style={styles.hoursBadge}>
          <Text style={styles.hoursText}>24.5 Giờ</Text>
        </View>
      </View>

      {/* Target Cert Readiness Card */}
      <View style={styles.certCard}>
        <View style={styles.certHeader}>
          <Text style={styles.certLabel}>Độ sẵn sàng thi chứng chỉ</Text>
          <Text style={styles.certPercent}>80%</Text>
        </View>
        <Text style={styles.certName}>AWS Certified Cloud Practitioner (CLF-C02)</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
        <Text style={styles.certAdvice}>
          💡 Điểm trung bình thi thử của bạn là <Text style={styles.boldText}>82%</Text> (vượt chuẩn đỗ 70%). Bạn đã sẵn sàng đăng ký thi thật!
        </Text>
      </View>

      {/* Domain Proficiency */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Mức độ thành thạo theo chuyên ngành</Text>
        <View style={styles.skillsList}>
          {domainSkills.map((s) => (
            <View key={s.name} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{s.name}</Text>
                <Text style={styles.skillPercent}>{s.percent}%</Text>
              </View>
              <View style={styles.skillBar}>
                <View style={[styles.skillBarFill, { width: `${s.percent}%`, backgroundColor: s.color }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Test History */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử bài kiểm tra gần đây</Text>
          <TouchableOpacity onPress={() => router.push('/test-history' as any)}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyList}>
          <TouchableOpacity
            style={styles.historyItem}
            onPress={() => router.push('/test-result/res-1' as any)}
          >
            <View style={styles.historyLeft}>
              <Text style={styles.historyTitle}>AWS Cloud Practitioner Mock #1</Text>
              <Text style={styles.historyMeta}>Hôm qua · 65 câu · Làm trong 58 phút</Text>
            </View>
            <View style={styles.scoreBadgePass}>
              <Text style={styles.scorePassText}>89% Đạt</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyItem}
            onPress={() => router.push('/test-result/res-2' as any)}
          >
            <View style={styles.historyLeft}>
              <Text style={styles.historyTitle}>IAM & Security Policy Quiz</Text>
              <Text style={styles.historyMeta}>3 ngày trước · 20 câu · Làm trong 15 phút</Text>
            </View>
            <View style={styles.scoreBadgePass}>
              <Text style={styles.scorePassText}>95% Đạt</Text>
            </View>
          </TouchableOpacity>
        </View>
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
  streakCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#ffedd5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  streakEmoji: {
    fontSize: 32
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9a3412'
  },
  streakSub: {
    fontSize: 11,
    color: '#c2410c'
  },
  hoursBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9a3412'
  },
  certCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  certLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase'
  },
  certPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  certName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginVertical: spacing.xs,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  certAdvice: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16,
    marginTop: 4
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.md
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  },
  skillsList: {
    gap: spacing.md
  },
  skillItem: {
    gap: 4
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  skillName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text
  },
  skillPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text
  },
  skillBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 3
  },
  historyList: {
    gap: spacing.sm
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#f8fafc',
    borderRadius: 10
  },
  historyLeft: {
    flex: 1,
    marginRight: spacing.sm
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  historyMeta: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2
  },
  scoreBadgePass: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  scorePassText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d'
  },
  boldText: {
    fontWeight: '700',
    color: colors.text
  }
});
