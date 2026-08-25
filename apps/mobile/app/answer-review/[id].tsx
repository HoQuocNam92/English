import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

const reviewedQuestions = [
  {
    id: '1',
    prompt: 'Which AWS storage service provides scalable object storage accessible over HTTP/HTTPS APIs?',
    userAnswer: 'Amazon S3',
    correctAnswer: 'Amazon S3',
    isCorrect: true,
    explanation: 'Amazon S3 (Simple Storage Service) is an object store offering industry-leading scalability, data availability, and security accessible via REST/HTTPS APIs.'
  },
  {
    id: '2',
    prompt: 'According to the AWS Shared Responsibility Model, which security task is the sole responsibility of the customer?',
    userAnswer: 'Maintaining underlying server hardware',
    correctAnswer: 'Configuring IAM User Permissions and MFA',
    isCorrect: false,
    explanation: 'AWS manages security OF the cloud (hardware, physical data centers, host virtualization), while the customer manages security IN the cloud (IAM policies, guest OS patches, data encryption).'
  }
];

export default function MobileAnswerReviewScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đáp án</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {reviewedQuestions.map((q, idx) => (
          <View key={q.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, q.isCorrect ? styles.badgeCorrect : styles.badgeWrong]}>
                <MaterialIcons
                  name={q.isCorrect ? 'check' : 'close'}
                  size={16}
                  color={q.isCorrect ? '#15803d' : '#991b1b'}
                />
                <Text style={[styles.badgeText, q.isCorrect ? styles.textCorrect : styles.textWrong]}>
                  {q.isCorrect ? 'Chính xác' : 'Chưa đúng'}
                </Text>
              </View>
              <Text style={styles.qNum}>Câu #{idx + 1}</Text>
            </View>

            <Text style={styles.prompt}>{q.prompt}</Text>

            <View style={styles.answersBox}>
              <View style={styles.answerRow}>
                <Text style={styles.ansLabel}>Bạn đã chọn:</Text>
                <Text style={[styles.ansVal, q.isCorrect ? styles.textCorrect : styles.textWrong]}>
                  {q.userAnswer}
                </Text>
              </View>
              {!q.isCorrect && (
                <View style={styles.answerRow}>
                  <Text style={styles.ansLabel}>Đáp án đúng:</Text>
                  <Text style={[styles.ansVal, styles.textCorrect]}>{q.correctAnswer}</Text>
                </View>
              )}
            </View>

            <View style={styles.expBox}>
              <Text style={styles.expLabel}>💡 Giải thích kiến thức:</Text>
              <Text style={styles.expText}>{q.explanation}</Text>
            </View>
          </View>
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
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.sm
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeCorrect: {
    backgroundColor: '#dcfce7'
  },
  badgeWrong: {
    backgroundColor: '#fee2e2'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  textCorrect: {
    color: '#15803d'
  },
  textWrong: {
    color: '#991b1b'
  },
  qNum: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '700'
  },
  prompt: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20
  },
  answersBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: spacing.sm,
    gap: 4
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.xs
  },
  ansLabel: {
    fontSize: 12,
    color: colors.mutedText
  },
  ansVal: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1
  },
  expBox: {
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
    padding: spacing.sm,
    gap: 2
  },
  expLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary
  },
  expText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16
  }
});
