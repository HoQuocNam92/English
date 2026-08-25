import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

export default function MobileScenarioScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const scenario = {
    title: 'Multi-Region High Availability Migration',
    domain: 'Cloud Architecture & Resilience',
    description:
      'A fintech application requires a globally distributed database that supports multi-region active-active writes and single-digit millisecond latency for reads. The engineering team wants a fully managed solution with zero operational maintenance of hardware or scaling clusters.',
    question: 'Which AWS database service best meets these architectural and operational requirements?',
    options: [
      { id: 'A', text: 'Amazon RDS for PostgreSQL with Read Replicas' },
      { id: 'B', text: 'Amazon DynamoDB with Global Tables enabled' },
      { id: 'C', text: 'Amazon Aurora Serverless v1' },
      { id: 'D', text: 'Self-hosted MongoDB on EC2 instances' }
    ],
    correctOption: 'B',
    explanation:
      'Amazon DynamoDB Global Tables provides a fully managed, multi-region, multi-active database that automatically replicates data across your choice of AWS regions. It delivers single-digit millisecond read/write performance at any scale without managing infrastructure.'
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    setShowExplanation(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tình huống thực tế</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Scenario Card */}
        <View style={styles.scenarioCard}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{scenario.domain}</Text>
          </View>
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <View style={styles.contextBox}>
            <Text style={styles.contextLabel}>Bối cảnh kỹ thuật:</Text>
            <Text style={styles.contextText}>{scenario.description}</Text>
          </View>
          <Text style={styles.questionText}>{scenario.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {scenario.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === scenario.correctOption;

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
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                    showExplanation && isCorrect && styles.radioCorrect,
                    showExplanation && isSelected && !isCorrect && styles.radioWrong
                  ]}
                >
                  <Text
                    style={[
                      styles.radioText,
                      (isSelected || (showExplanation && isCorrect)) && styles.radioTextWhite
                    ]}
                  >
                    {opt.id}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation Card */}
        {showExplanation && (
          <View style={styles.explanationCard}>
            <View style={styles.expHeader}>
              <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
              <Text style={styles.expTitle}>Giải thích kiến trúc hệ thống</Text>
            </View>
            <Text style={styles.expText}>{scenario.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {!showExplanation ? (
          <TouchableOpacity
            style={[styles.actionBtn, !selectedOption && styles.actionBtnDisabled]}
            disabled={!selectedOption}
            onPress={handleCheck}
          >
            <Text style={styles.actionBtnText}>Kiểm tra đáp án</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
            <Text style={styles.actionBtnText}>Hoàn thành tình huống</Text>
            <MaterialIcons name="check" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
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
    paddingBottom: 110,
    gap: spacing.md
  },
  scenarioCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.sm
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  scenarioTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text
  },
  contextBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    gap: 4
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary
  },
  contextText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4
  },
  optionsList: {
    gap: spacing.sm
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
  optionCardCorrect: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4'
  },
  optionCardWrong: {
    borderColor: colors.error,
    backgroundColor: '#fef2f2'
  },
  radio: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioSelected: {
    backgroundColor: colors.primary
  },
  radioCorrect: {
    backgroundColor: '#16a34a'
  },
  radioWrong: {
    backgroundColor: colors.error
  },
  radioText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text
  },
  radioTextWhite: {
    color: '#ffffff'
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text
  },
  explanationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  expTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary
  },
  expText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18
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
  actionBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  actionBtnDisabled: {
    opacity: 0.5
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  }
});
