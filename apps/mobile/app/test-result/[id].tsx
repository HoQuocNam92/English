import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

export default function MobileTestResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const result = {
    testTitle: 'AWS Certified Cloud Practitioner Mock #1',
    scorePercent: 88,
    correctCount: 58,
    totalQuestions: 65,
    durationMinutes: 58,
    isPassed: true,
    domains: [
      { name: 'Domain 1: Cloud Concepts', score: '95%' },
      { name: 'Domain 2: Security & Compliance', score: '88%' },
      { name: 'Domain 3: Technology & Services', score: '82%' },
      { name: 'Domain 4: Billing & Pricing', score: '75%' }
    ]
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Result Hero Card */}
        <View style={styles.resultCard}>
          <View style={styles.badgePass}>
            <Text style={styles.badgePassText}>🎉 XUẤT SẮC - ĐẠT CHUẨN</Text>
          </View>
          <Text style={styles.scoreNumber}>{result.scorePercent}%</Text>
          <Text style={styles.resultTitle}>{result.testTitle}</Text>
          <Text style={styles.resultSub}>
            Bạn đã vượt điểm chuẩn đỗ (70%) và sẵn sàng cho kỳ thi chứng chỉ thật!
          </Text>

          <View style={styles.gridStats}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{result.correctCount}/{result.totalQuestions}</Text>
              <Text style={styles.statLbl}>Câu đúng</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{result.durationMinutes}p</Text>
              <Text style={styles.statLbl}>Thời gian</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>88%</Text>
              <Text style={styles.statLbl}>Độ chuẩn xác</Text>
            </View>
          </View>
        </View>

        {/* Domain Breakdown */}
        <View style={styles.domainCard}>
          <Text style={styles.domainHeader}>Kết quả theo từng Domain</Text>
          <View style={styles.domainsList}>
            {result.domains.map((d) => (
              <View key={d.name} style={styles.domainRow}>
                <Text style={styles.domainName}>{d.name}</Text>
                <Text style={styles.domainScore}>{d.score}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() => router.push(`/answer-review/${id || 'res-1'}` as any)}
        >
          <MaterialIcons name="fact-check" size={18} color={colors.primary} />
          <Text style={styles.reviewBtnText}>Xem lại đáp án chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)/home' as any)}
        >
          <Text style={styles.homeBtnText}>Về trang chủ</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 120,
    gap: spacing.lg
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },
  badgePass: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: spacing.xs
  },
  badgePassText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d'
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 60
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center'
  },
  resultSub: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 2
  },
  gridStats: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: spacing.sm
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: spacing.sm,
    borderRadius: 10
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  statLbl: {
    fontSize: 10,
    color: colors.mutedText,
    marginTop: 2
  },
  domainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.md
  },
  domainHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text
  },
  domainsList: {
    gap: spacing.sm
  },
  domainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  domainName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    flex: 1
  },
  domainScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16a34a'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: spacing.sm
  },
  reviewBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  reviewBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  homeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  homeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
