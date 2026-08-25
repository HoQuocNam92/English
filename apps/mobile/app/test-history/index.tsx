import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

const mockHistory = [
  { id: '1', title: 'AWS Cloud Practitioner Mock #1', domain: 'Cloud Computing', score: 88, maxScore: 100, isPass: true, date: '10/08/2026' },
  { id: '2', title: 'IAM Roles & Policies Quiz', domain: 'Cloud Computing', score: 95, maxScore: 100, isPass: true, date: '08/08/2026' },
  { id: '3', title: 'Networking Fundamentals & VPC', domain: 'Networking', score: 65, maxScore: 100, isPass: false, date: '05/08/2026' },
  { id: '4', title: 'REST API Verbs & Status Codes', domain: 'Software Eng', score: 90, maxScore: 100, isPass: true, date: '02/08/2026' }
];

export default function MobileTestHistoryScreen() {
  const router = useRouter();

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
        {mockHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/test-result/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              <View style={styles.domainTag}>
                <Text style={styles.domainTagText}>{item.domain}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>Ngày thi: {item.date}</Text>
            </View>

            <View style={styles.cardRight}>
              <Text style={[styles.scoreText, item.isPass ? styles.scorePass : styles.scoreFail]}>
                {item.score}%
              </Text>
              <View style={[styles.statusBadge, item.isPass ? styles.statusBadgePass : styles.statusBadgeFail]}>
                <Text style={[styles.statusText, item.isPass ? styles.scorePass : styles.scoreFail]}>
                  {item.isPass ? 'Đạt' : 'Chưa đạt'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
