import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../src/shared/api/api-client';

interface CareerGoal {
  id: string;
  code: string;
  name: string;
  description: string;
}

// Fallback icon mapping based on keywords in goal code/name
const getGoalIcon = (code: string): keyof typeof MaterialIcons.glyphMap => {
  const map: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    BACKEND: 'dns',
    FRONTEND: 'web',
    FULLSTACK: 'layers',
    DEVOPS: 'settings-suggest',
    CLOUD: 'cloud',
    DATA: 'storage',
    ML: 'psychology',
    SECURITY: 'security',
    SRE: 'monitor-heart',
    SOLUTION: 'architecture',
  };
  const key = Object.keys(map).find(k => code.toUpperCase().includes(k));
  return key ? map[key] : 'work';
};

export default function OnboardingCareerGoalScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<CareerGoal[]>('/career-goals')
      .then(data => {
        setGoals(Array.isArray(data) ? data : []);
      })
      .catch(() => setGoals([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleGoal = (code: string) => {
    setSelectedGoals(prev =>
      prev.includes(code) ? prev.filter(g => g !== code) : [...prev, code]
    );
  };

  const handleNext = async () => {
    if (selectedGoals.length > 0) {
      await AsyncStorage.setItem('onboarding_career_goals', JSON.stringify(selectedGoals));
    }
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

        <Text style={styles.title}>Mục tiêu nghề nghiệp của bạn?</Text>
        <Text style={styles.subtitle}>Bạn đang hướng tới vị trí nào trong ngành CNTT? Chọn một hoặc nhiều mục tiêu.</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách...</Text>
          </View>
        ) : (
          <View style={styles.optionsList}>
            {goals.map((g) => {
              const isSelected = selectedGoals.includes(g.code);
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => toggleGoal(g.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionContentRow}>
                    <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                      <MaterialIcons name={getGoalIcon(g.code)} size={22} color={isSelected ? colors.primary : '#464555'} />
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
                      <Text style={styles.goalDesc}>{g.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: spacing.sm, fontSize: 14, color: '#464555' },
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
