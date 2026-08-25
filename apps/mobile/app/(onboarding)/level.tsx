import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

interface LevelOption {
  id: string;
  name: string;
  tag: string;
  desc: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const levels: LevelOption[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    tag: 'A1 - A2',
    desc: 'Mới bắt đầu, cần xây dựng nền tảng từ vựng IT cơ bản và ngữ pháp nhập môn.',
    icon: 'school'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    tag: 'B1 - B2',
    desc: 'Đã có thể đọc tài liệu kỹ thuật, cần nâng cao kỹ năng đọc hiểu API & viết pull request.',
    icon: 'menu-book'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tag: 'C1',
    desc: 'Thành thạo tiếng Anh nói chung, cần đọc hiểu System Design & kiến trúc phân tán.',
    icon: 'architecture'
  },
  {
    id: 'professional',
    name: 'Professional',
    tag: 'C2 / Specialist',
    desc: 'Luyện thi chứng chỉ quốc tế cấp cao (AWS SAA, CompTIA) và xử lý case study thực tế.',
    icon: 'workspace-premium'
  }
];

export default function OnboardingLevelScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('intermediate');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress header */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Bước 1 / 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Trình độ hiện tại của bạn?</Text>
        <Text style={styles.subtitle}>Giúp hệ thống cá nhân hóa bài học và ngân hàng câu hỏi phù hợp nhất với bạn.</Text>

        <View style={styles.optionsList}>
          {levels.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            return (
              <TouchableOpacity
                key={lvl.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedLevel(lvl.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <MaterialIcons name={lvl.icon} size={24} color={isSelected ? colors.primary : colors.mutedText} />
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.levelName, isSelected && styles.levelNameSelected]}>{lvl.name}</Text>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{lvl.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.levelDesc}>{lvl.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/(onboarding)/it-field' as any)}>
          <Text style={styles.nextButtonText}>Tiếp tục</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
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
    paddingTop: 50,
    paddingBottom: 100
  },
  progressHeader: {
    marginBottom: spacing.lg
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: spacing.lg,
    lineHeight: 18
  },
  optionsList: {
    gap: spacing.md
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f5f3ff'
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBoxSelected: {
    backgroundColor: '#ede9fe'
  },
  optionContent: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4
  },
  levelName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  },
  levelNameSelected: {
    color: colors.primary
  },
  tagBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  levelDesc: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  }
});
