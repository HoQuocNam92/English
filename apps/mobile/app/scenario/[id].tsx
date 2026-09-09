import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { safeText } from '../../src/shared/utils/safeText';

export default function MobileScenarioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scenario, setScenario] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/questions/${id}`)
      .then((data: any) => {
        setScenario({
          title: data.domain?.name ?? 'Tình huống',
          domain: data.domain?.name ?? 'Production Environment',
          description: data.context ?? '',
          question: data.prompt,
          options: data.options?.map((opt: any) => ({ id: opt.key, text: opt.text })) || [],
          correctOption: data.options?.find((o: any) => o.isCorrect)?.key ?? 'A',
          explanation: data.explanation ?? ''
        });
      })
      .catch((err) => setError(err.message || 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !scenario) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ef4444' }}>{error || 'Không tìm thấy dữ liệu'}</Text>
      </View>
    );
  }

  const handleCheck = () => {
    if (!selectedOption) return;
    setShowExplanation(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#464555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scenario Quiz</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <MaterialIcons name="more-vert" size={24} color="#464555" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator (Mocked for single scenario) */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>1/1</Text>
        </View>

        {/* Scenario Context Box */}
        {scenario.description ? (
          <View style={styles.contextBox}>
            <View style={styles.contextHeader}>
              <MaterialIcons name="terminal" size={18} color={colors.primary} />
              <Text style={styles.contextTag}>{safeText(scenario.domain)}</Text>
            </View>
            <Text style={styles.contextText}>{safeText(scenario.description)}</Text>
          </View>
        ) : null}

        <Text style={styles.questionText}>{safeText(scenario.question)}</Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {scenario.options.map((opt: any, index: number) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === scenario.correctOption;

            // Optional icon mapping based on index if we want visual variety
            const icons = ['dns', 'router', 'database', 'code'];
            const iconName = icons[index % icons.length] as any;

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  showExplanation && isCorrect && styles.optionCardCorrect,
                  showExplanation && isSelected && !isCorrect && styles.optionCardWrong
                ]}
                onPress={() => !showExplanation && setSelectedOption(opt.id)}
                activeOpacity={showExplanation ? 1 : 0.8}
              >
                <MaterialIcons 
                  name={iconName} 
                  size={24} 
                  color={
                    showExplanation && isCorrect ? '#16a34a' :
                    showExplanation && isSelected && !isCorrect ? colors.error :
                    isSelected ? colors.primary : '#c7c4d8'
                  } 
                  style={{ marginTop: 2 }}
                />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {opt.id}. {safeText(opt.text)}
                  </Text>
                </View>
                
                {showExplanation && (
                  <View style={{ marginLeft: 'auto' }}>
                    {isCorrect ? (
                      <MaterialIcons name="check-circle" size={20} color="#16a34a" />
                    ) : isSelected && !isCorrect ? (
                      <MaterialIcons name="cancel" size={20} color={colors.error} />
                    ) : null}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation Card */}
        {showExplanation && (
          <View style={styles.explanationCard}>
            <View style={styles.expHeader}>
              <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
              <Text style={styles.expTitle}>Explanation</Text>
            </View>
            <Text style={styles.expText}>{scenario.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomFixedArea}>
        {!showExplanation ? (
          <TouchableOpacity
            style={[styles.btnPrimary, !selectedOption && styles.btnPrimaryDisabled]}
            disabled={!selectedOption}
            onPress={handleCheck}
          >
            <Text style={styles.btnPrimaryText}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()}>
            <Text style={styles.btnSecondaryText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    marginTop: 20
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 110,
    gap: spacing.lg
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e6e8ea',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#464555'
  },
  contextBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  contextTag: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase'
  },
  contextText: {
    fontSize: 14,
    color: '#191c1e',
    lineHeight: 22
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e',
    lineHeight: 28
  },
  optionsList: {
    gap: spacing.sm
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f5f3ff', // approx primary-fixed/20
    borderWidth: 2,
    padding: spacing.md - 1
  },
  optionCardCorrect: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    padding: spacing.md - 1
  },
  optionCardWrong: {
    borderColor: colors.error,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    padding: spacing.md - 1
  },
  optionContent: {
    flex: 1,
    justifyContent: 'center'
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    lineHeight: 20
  },
  optionTitleSelected: {
    color: colors.primary
  },
  explanationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs
  },
  expTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  expText: {
    fontSize: 14,
    color: '#191c1e',
    lineHeight: 20
  },
  bottomFixedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: spacing.md,
    paddingBottom: 32, // safe area
    borderTopWidth: 1,
    borderTopColor: '#e6e8ea'
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  btnPrimaryDisabled: {
    opacity: 0.5
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  btnSecondary: {
    backgroundColor: '#e6e8ea', // Or primary-container
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  btnSecondaryText: {
    color: '#191c1e',
    fontSize: 15,
    fontWeight: '600'
  }
});
