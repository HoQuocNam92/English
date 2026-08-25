import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

interface GoalOption {
  id: string;
  name: string;
  desc: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const goals: GoalOption[] = [
  {
    id: 'cert',
    name: 'Thi đỗ chứng chỉ CNTT quốc tế (AWS, CompTIA, GCP)',
    desc: 'Luyện đề trắc nghiệm chuẩn format quốc tế và phản xạ từ vựng.',
    icon: 'military-tech'
  },
  {
    id: 'job',
    name: 'Phỏng vấn xin việc & làm việc tại công ty Global',
    desc: 'Tự tin trình bày giải pháp kỹ thuật và trả lời câu hỏi Tech interview.',
    icon: 'work-outline'
  },
  {
    id: 'docs',
    name: 'Đọc hiểu tài liệu chính thống (Docs, RFCs, GitHub)',
    desc: 'Tăng tốc độ đọc hiểu các bản thiết kế kiến trúc và API references.',
    icon: 'auto-stories'
  },
  {
    id: 'daily',
    name: 'Giao tiếp hàng ngày trong Scrum Team',
    desc: 'Viết PR review, ticket Jira, trao đổi trong Daily standup.',
    icon: 'forum'
  }
];

export default function OnboardingCareerGoalScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState('cert');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress header */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Bước 3 / 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Mục tiêu học tập lớn nhất của bạn?</Text>
        <Text style={styles.subtitle}>Chọn mục tiêu để chúng tôi thiết lập lộ trình học tập tối ưu nhất.</Text>

        <View style={styles.optionsList}>
          {goals.map((g) => {
            const isSelected = selectedGoal === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedGoal(g.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <MaterialIcons name={g.icon} size={22} color={isSelected ? colors.primary : colors.mutedText} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.goalName, isSelected && styles.goalNameSelected]}>{g.name}</Text>
                  <Text style={styles.goalDesc}>{g.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/(onboarding)/certificate' as any)}>
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
    alignItems: 'center',
    gap: spacing.md
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f5f3ff'
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
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
  goalName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2
  },
  goalNameSelected: {
    color: colors.primary
  },
  goalDesc: {
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
