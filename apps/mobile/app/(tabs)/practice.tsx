import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

interface PracticeMode {
  id: string;
  title: string;
  badge: string;
  desc: string;
  stats: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgLight: string;
  route: string;
}

const practiceModes: PracticeMode[] = [
  {
    id: 'vocab',
    title: 'Flashcards Thuật ngữ IT',
    badge: 'Spaced Repetition (SRS)',
    desc: 'Lật thẻ ghi nhớ định nghĩa tiếng Anh, phát âm chuẩn và ví dụ trong code.',
    stats: '450 thẻ từ vựng · 84 thẻ cần ôn hôm nay',
    icon: 'style',
    color: '#4f46e5',
    bgLight: '#eef2ff',
    route: '/lessons/vocabulary/vocab-1'
  },
  {
    id: 'scenario',
    title: 'Xử lý Tình huống (Scenario-Based)',
    badge: 'Real-world Cases',
    desc: 'Đọc mô tả sự cố hệ thống (Outage, Latency, Data Leak) và chọn phương án xử lý.',
    stats: '120 tình huống thực tế · Điểm TB: 78%',
    icon: 'psychology',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    route: '/scenario/scen-1'
  },
  {
    id: 'quiz',
    title: 'Trắc nghiệm theo Chủ đề (Quick Quiz)',
    badge: '10 - 20 câu',
    desc: 'Luyện tập nhanh câu hỏi theo từng Domain: IAM, Networking, Databases.',
    stats: '24 bộ đề chủ đề · Tỷ lệ đúng 82%',
    icon: 'quiz',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    route: '/quiz/quiz-1'
  },
  {
    id: 'mock-exam',
    title: 'Thi thử Đề Quốc tế (Full Mock Exam)',
    badge: 'AWS CLF-C02 Format',
    desc: 'Mô phỏng kỳ thi thật 65 câu hỏi trong 90 phút, có bấm giờ và tính điểm đỗ/trượt.',
    stats: '6 đề thi hoàn chỉnh · Tỷ lệ đỗ 79%',
    icon: 'military-tech',
    color: '#b45309',
    bgLight: '#fef3c7',
    route: '/quiz/mock-1'
  }
];

export default function MobilePracticeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Luyện tập kỹ năng</Text>
        <Text style={styles.subtitle}>
          Rèn luyện phản xạ thuật ngữ và chuẩn bị tốt nhất cho kỳ thi chứng chỉ.
        </Text>
      </View>

      {/* Modes Grid */}
      <View style={styles.modesList}>
        {practiceModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={styles.modeCard}
            onPress={() => router.push(mode.route as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: mode.bgLight }]}>
                <MaterialIcons name={mode.icon} size={24} color={mode.color} />
              </View>
              <View style={[styles.badge, { backgroundColor: mode.bgLight }]}>
                <Text style={[styles.badgeText, { color: mode.color }]}>{mode.badge}</Text>
              </View>
            </View>

            <Text style={styles.modeTitle}>{mode.title}</Text>
            <Text style={styles.modeDesc}>{mode.desc}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.modeStats}>{mode.stats}</Text>
              <MaterialIcons name="arrow-forward" size={18} color={mode.color} />
            </View>
          </TouchableOpacity>
        ))}
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
  modesList: {
    gap: spacing.md
  },
  modeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2
  },
  modeDesc: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 2
  },
  modeStats: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text
  }
});
