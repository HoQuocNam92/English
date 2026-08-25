import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

const quizQuestions = [
  {
    id: 'q1',
    prompt: 'Which HTTP method is specifically defined as idempotent and used to replace an entire resource or create it if missing?',
    options: [
      { id: 'A', text: 'POST' },
      { id: 'B', text: 'PUT' },
      { id: 'C', text: 'PATCH' },
      { id: 'D', text: 'CONNECT' }
    ]
  },
  {
    id: 'q2',
    prompt: 'When an API endpoint requires authentication and the client has not provided valid credentials, which HTTP status code should the server return?',
    options: [
      { id: 'A', text: '400 Bad Request' },
      { id: 'B', text: '401 Unauthorized' },
      { id: 'C', text: '403 Forbidden' },
      { id: 'D', text: '404 Not Found' }
    ]
  },
  {
    id: 'q3',
    prompt: 'Which AWS service is designed for object storage with 99.999999999% (11 9s) of data durability?',
    options: [
      { id: 'A', text: 'Amazon EBS' },
      { id: 'B', text: 'Amazon S3' },
      { id: 'C', text: 'Amazon EFS' },
      { id: 'D', text: 'Amazon RDS' }
    ]
  }
];

export default function MobileQuizScreen() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = quizQuestions[currentIdx];
  const total = quizQuestions.length;
  const selectedOption = answers[q.id];

  const handleSelectOption = (optId: string) => {
    setAnswers({ ...answers, [q.id]: optId });
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      Alert.alert('Nộp bài thi', 'Bạn có chắc chắn muốn nộp bài để xem kết quả và giải thích?', [
        { text: 'Kiểm tra lại', style: 'cancel' },
        {
          text: 'Nộp bài',
          onPress: () => router.replace('/test-result/res-1' as any)
        }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.timerBadge}>
          <MaterialIcons name="timer" size={16} color={colors.primary} />
          <Text style={styles.timerText}>14:20</Text>
        </View>
        <Text style={styles.counterText}>Câu {currentIdx + 1}/{total}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIdx + 1) / total) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Prompt */}
        <View style={styles.promptCard}>
          <Text style={styles.questionLabel}>Câu hỏi trắc nghiệm</Text>
          <Text style={styles.promptText}>{q.prompt}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {q.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                onPress={() => handleSelectOption(opt.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>{opt.id}</Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {currentIdx > 0 ? (
          <TouchableOpacity
            style={styles.prevButton}
            onPress={() => setCurrentIdx(currentIdx - 1)}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
            <Text style={styles.prevButtonText}>Câu trước</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{currentIdx === total - 1 ? 'Nộp bài thi' : 'Câu tiếp theo'}</Text>
          <MaterialIcons name={currentIdx === total - 1 ? 'check' : 'arrow-forward'} size={20} color="#ffffff" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.sm,
    backgroundColor: '#ffffff'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg
  },
  promptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase'
  },
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24
  },
  optionsList: {
    gap: spacing.md
  },
  optionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f5f3ff'
  },
  radioCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircleSelected: {
    backgroundColor: colors.primary
  },
  radioText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text
  },
  radioTextSelected: {
    color: '#ffffff'
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: spacing.md
  },
  prevButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  prevButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  nextButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  }
});
