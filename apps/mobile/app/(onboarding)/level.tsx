import { RequiredMark } from '../../src/shared/ui/RequiredMark';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../../src/shared/api/api-client';

interface LevelOption {
  id: string;
  code: string;
  isActive?: boolean;
  description?: string;
  name: string;

}



export default function OnboardingLevelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.get<LevelOption[] | { data: LevelOption[] }>('/levels').then(result => {
      if (!active) return;
      const rows = (Array.isArray(result) ? result : result.data).filter(level => level.isActive !== false);
      setLevels(rows);
      setSelectedLevel(current => rows.some(level => level.code === current) ? current : '');
    }).catch(() => { if (active) setError('Không tải được trình độ. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const handleNext = async () => {
    if (loading || error || !levels.some(level => level.code === selectedLevel)) return;
    await AsyncStorage.setItem('onboarding_level', selectedLevel);
    router.push('/(onboarding)/plan' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Bar Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.logoTitle}>
          <MaterialIcons name="terminal" size={20} color={colors.primary} />
          <Text style={styles.logoText}>TechEnglish</Text>
        </View>
        <Text style={styles.skipButtonText}>Bước 3/4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.stepIndicator}>BƯỚC 3/4</Text>
            <Text style={styles.progressPercent}>75%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Trình độ tiếng Anh của bạn?<RequiredMark /></Text>
        <Text style={styles.subtitle}>Chưa có trình độ nào được chọn sẵn. Hãy chọn mức bắt đầu phù hợp với bạn.</Text>

        {loading && <ActivityIndicator color={colors.primary} />}
        {!!error && <TouchableOpacity onPress={() => setRetry(value => value + 1)}><Text>{error} Nhấn để thử lại.</Text></TouchableOpacity>}
        {!loading && !error && !levels.length && <Text>Chưa có trình độ đang hoạt động.</Text>}
        <View style={styles.optionsList}>
          {levels.map((lvl) => {
            const isSelected = selectedLevel === lvl.code;
            return (
              <TouchableOpacity
                key={lvl.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedLevel(lvl.code)}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.levelName, isSelected && styles.levelNameSelected]}>{lvl.name}</Text>

                    {isSelected && (
                      <View style={{ marginLeft: 'auto' }}>
                        <MaterialIcons name="check-circle" size={18} color={colors.primary} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.levelDesc}>{lvl.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(16, insets.bottom + 12) }]}>
        <TouchableOpacity style={[styles.nextButton, (!selectedLevel || loading || !!error) && { opacity: 0.5 }]} disabled={!selectedLevel || loading || !!error} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tiếp tục</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.sm,
    backgroundColor: '#ffffff'
  },
  iconButton: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20,
  },
  logoTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  logoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    letterSpacing: -0.2
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.outline
  },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.xs, paddingBottom: 100 },
  progressHeader: { marginBottom: spacing.md },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  stepIndicator: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  progressPercent: { fontSize: 12, fontWeight: '500', color: colors.outline },
  progressBar: { height: 8, backgroundColor: '#e6e8ea', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#191c1e', marginBottom: spacing.xs, letterSpacing: -0.2 },
  subtitle: { fontSize: 14, color: '#464555', marginBottom: spacing.lg, lineHeight: 20 },
  optionsList: { gap: spacing.sm },
  optionCard: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: '#e6e8ea', flexDirection: 'row', alignItems: 'flex-start', minHeight: 68
  },
  optionCardSelected: { borderColor: colors.primary, backgroundColor: '#eef2ff', borderWidth: 2 },
  radioOuter: {
    width: 20, height: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e4e8f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: spacing.md
  },
  radioInner: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary
  },
  optionContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  levelName: { fontSize: 14, fontWeight: '600', color: '#191c1e' },
  levelNameSelected: { color: colors.primary, fontWeight: '700' },
  tagText: { fontSize: 12, fontWeight: '500', color: '#464555' },
  tagTextSelected: { color: colors.primary },
  levelDesc: { fontSize: 12, color: '#464555', lineHeight: 18 },
  aiBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    backgroundColor: '#f5f3ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  aiIconBox: {
    width: 32, height: 32,
    borderRadius: 8,
    backgroundColor: '#7531e6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiContent: { flex: 1 },
  aiTitle: { fontSize: 14, fontWeight: '600', color: '#191c1e' },
  aiDesc: { fontSize: 12, color: '#464555', marginTop: 2 },
  aiTestLink: { fontSize: 14, fontWeight: '600', color: colors.primary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'transparent',
    padding: spacing.lg,
    paddingBottom: 32 // for safearea
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
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
  nextButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' }
});
