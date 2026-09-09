import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GoalOption {
  id: string;
  name: string;
  desc: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const goals: GoalOption[] = [
  { id: 'DOCS_API', name: 'Đọc hiểu tài liệu kỹ thuật & API', desc: 'Docs, Specs, StackOverflow & RFCs', icon: 'terminal' },
  { id: 'INTERVIEW', name: 'Chuẩn bị phỏng vấn IT tiếng Anh', desc: 'Technical Interview, System Design, Live Coding', icon: 'psychology' },
  { id: 'AGILE_SCRUM', name: 'Giao tiếp môi trường Agile/Scrum', desc: 'Daily Standup, Sprint Planning, Slack, Jira', icon: 'groups' },
  { id: 'GLOBAL_COMPANY', name: 'Làm việc tại công ty Global', desc: 'Khách hàng US, EU, Singapore & Remote Teams', icon: 'public' },
  { id: 'TECH_SPECS', name: 'Viết Tech Specs & Bug Reports', desc: 'Code Comments, PR Reviews, Architecture Docs', icon: 'description' },
  { id: 'CERTIFICATE', name: 'Luyện thi chứng chỉ quốc tế', desc: 'AWS SAA, CompTIA, GCP', icon: 'workspace-premium' }
];

export default function OnboardingCareerGoalScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['DOCS_API', 'INTERVIEW']);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    const toSave = selectedGoals.length > 0 ? selectedGoals : ['DOCS_API'];
    await AsyncStorage.setItem('onboarding_career_goal', JSON.stringify(toSave));
    router.push('/(onboarding)/certificate' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thiết lập mục tiêu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressHeader}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.stepIndicator}>Bước 3/4</Text>
            <Text style={styles.progressPercent}>75% Hoàn tất</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Mục tiêu học tập của bạn?</Text>
        <Text style={styles.subtitle}>Bạn học tiếng Anh chuyên ngành CNTT để đạt được điều gì? Chọn một hoặc nhiều mục tiêu.</Text>

        <View style={styles.optionsList}>
          {goals.map((g) => {
            const isSelected = selectedGoals.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => toggleGoal(g.id)}
                activeOpacity={0.8}
              >
                <View style={styles.optionContentRow}>
                  <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                    <MaterialIcons name={g.icon} size={22} color={isSelected ? colors.primary : '#464555'} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <View style={styles.optionTitleRow}>
                      <Text style={[styles.goalName, isSelected && styles.goalNameSelected]}>{g.name}</Text>
                      {isSelected ? (
                        <View style={styles.checkIconActive}>
                          <MaterialIcons name="check" size={16} color="#ffffff" />
                        </View>
                      ) : (
                        <View style={styles.checkIconInactive} />
                      )}
                    </View>
                    <Text style={styles.goalDesc}>{g.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.aiHintBanner}>
          <MaterialIcons name="auto-awesome" size={18} color={colors.primary} />
          <Text style={styles.aiHintText}>Lộ trình bài học sẽ được cá nhân hóa theo mục tiêu đã chọn.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.nextButton, selectedGoals.length === 0 && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={selectedGoals.length === 0}
        >
          <Text style={[styles.nextButtonText, selectedGoals.length === 0 && styles.nextButtonTextDisabled]}>Tiếp tục</Text>
          <MaterialIcons name="arrow-forward" size={18} color={selectedGoals.length === 0 ? '#464555' : '#ffffff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
    marginTop: 40 // safearea
  },
  backButton: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -8
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e'
  },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
  progressHeader: { marginBottom: spacing.lg, marginTop: spacing.xs },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  stepIndicator: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' },
  progressPercent: { fontSize: 12, fontWeight: '700', color: '#777587' },
  progressBar: { height: 8, backgroundColor: '#e6e8ea', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#191c1e', marginBottom: spacing.xs, letterSpacing: -0.2 },
  subtitle: { fontSize: 14, color: '#464555', marginBottom: spacing.lg, lineHeight: 20 },
  optionsList: { gap: spacing.sm },
  optionCard: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: '#c7c4d8'
  },
  optionCardSelected: { borderColor: colors.primary, backgroundColor: '#ffffff', borderWidth: 2 },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },
  iconBoxSelected: { backgroundColor: '#e2dfff' },
  optionTextContainer: {
    flex: 1,
    paddingRight: 4
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  goalName: { fontSize: 14, fontWeight: '600', color: '#191c1e', flex: 1, paddingRight: 8 },
  goalNameSelected: { color: '#191c1e' },
  goalDesc: { fontSize: 12, color: '#464555', lineHeight: 18 },
  checkIconActive: {
    width: 20, height: 20,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkIconInactive: {
    width: 20, height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  aiHintBanner: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 216, 0.5)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  aiHintText: {
    fontSize: 12,
    color: '#464555',
    flex: 1
  },
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#ffffff', 
    padding: spacing.md, 
    paddingBottom: 32, // safearea
    borderTopWidth: 1, 
    borderTopColor: '#e6e8ea' 
  },
  nextButton: { 
    backgroundColor: colors.primary, 
    height: 48, 
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  nextButtonDisabled: { 
    backgroundColor: '#e6e8ea',
    shadowOpacity: 0,
    elevation: 0
  },
  nextButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  nextButtonTextDisabled: { color: '#464555' }
});
