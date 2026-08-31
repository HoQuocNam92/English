import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { safeText } from '../../src/shared/utils/safeText';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
}

interface Attempt {
  id: string;
  questions: Question[];
  exam: { durationMinutes: number };
}

export default function MobileQuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unansweredQuestions = questions.reduce<number[]>((acc, q, index) => {
    const qAns = answers[q.id] || [];
    if (qAns.length === 0) acc.push(index + 1);
    return acc;
  }, []);

  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await api.post<Attempt>(`/exams/${id}/attempts`, {});
        const data = (res as any).data || res;
        setAttemptId(data.id);
        const qList = data.questionsSnapshot || data.questions || [];
        setQuestions(qList);
        const durationMins = data.examSnapshot?.durationMinutes || data.exam?.durationMinutes || 15;
        setTimeLeft(durationMins * 60);
      } catch (error: any) {
        console.error('Start exam failed:', error);
        Alert.alert('Lỗi', error.message || 'Không thể bắt đầu bài kiểm tra.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      startExam();
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || submitting) return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, submitting]);

  const toggleOption = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (isMultiple) {
        if (currentAnswers.includes(optionId)) {
          return { ...prev, [questionId]: currentAnswers.filter(id => id !== optionId) };
        }
        return { ...prev, [questionId]: [...currentAnswers, optionId] };
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const submitExam = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
      questionId,
      selectedOptionIds
    }));

    try {
      await api.post(`/exams/attempts/${attemptId}/submit`, { answers: formattedAnswers });
      router.replace(`/test-result/${attemptId}` as any);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    setShowSubmitModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md }}>Đang chuẩn bị đề thi...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMultipleChoice = currentQuestion?.type === 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={submitting}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.timerText}>
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </Text>
        <TouchableOpacity onPress={confirmSubmit} disabled={submitting}>
          <Text style={styles.submitText}>Nộp</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / (questions.length || 1)) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Câu {currentIndex + 1} / {questions.length}</Text>
      </View>

      {/* Question Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {currentQuestion && (
          <View style={styles.questionCard}>
            <Text style={styles.questionTypeTag}>
              {isMultipleChoice ? 'CHỌN NHIỀU ĐÁP ÁN' : 'CHỌN 1 ĐÁP ÁN'}
            </Text>
            <Text style={styles.prompt}>
              {safeText((currentQuestion as any).prompt || currentQuestion.text)}
            </Text>

            {/* Options */}
            <View style={styles.optionsList}>
              {currentQuestion.options?.map((option: any, optIdx: number) => {
                const optId = option.id || option.key || String(optIdx);
                const selected = answers[currentQuestion.id]?.includes(optId);
                const rawText = safeText(option.text || option.content || option.value || option.label || option);
                const displayText = option.key && !rawText.startsWith(`${option.key}.`) ? `${option.key}. ${rawText}` : rawText;

                return (
                  <TouchableOpacity
                    key={optId}
                    style={[styles.optionItem, selected && styles.optionItemSelected]}
                    onPress={() => toggleOption(currentQuestion.id, optId, isMultipleChoice)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radio, isMultipleChoice && styles.checkbox, selected && styles.radioSelected]}>
                      {selected && <MaterialIcons name="check" size={14} color="#fff" />}
                    </View>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {displayText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]} 
          onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || submitting}
        >
          <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>Trước</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity 
            style={[styles.navBtn, styles.navBtnPrimary]} 
            onPress={confirmSubmit}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.navBtnTextPrimary}>Nộp bài</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.navBtn, styles.navBtnPrimary]} 
            onPress={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={styles.navBtnTextPrimary}>Sau</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Submit Modal */}
      <Modal
        visible={showSubmitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xác nhận nộp bài</Text>
            
            {unansweredQuestions.length > 0 ? (
              <View style={styles.unansweredBox}>
                <MaterialIcons name="warning" size={24} color="#b45309" style={{ marginRight: 8 }} />
                <Text style={styles.unansweredText}>
                  Bạn còn {unansweredQuestions.length} câu chưa làm ({unansweredQuestions.map(n => `#${n}`).join(', ')}). Bạn có chắc chắn muốn nộp bài không?
                </Text>
              </View>
            ) : (
              <Text style={styles.modalMessage}>
                Bạn đã hoàn thành tất cả {questions.length} câu hỏi! Bạn có chắc chắn muốn nộp bài không?
              </Text>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={() => {
                  setShowSubmitModal(false);
                  submitExam();
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Nộp bài</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b45309'
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary
  },
  progressText: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'right'
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  questionTypeTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase'
  },
  prompt: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg
  },
  questionType: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    marginBottom: spacing.xs,
    textTransform: 'uppercase'
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.xl
  },
  optionsList: {
    gap: spacing.md
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff'
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eef2ff'
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkbox: {
    borderRadius: 6
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22
  },
  optionTextSelected: {
    fontWeight: '600',
    color: colors.primary
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    gap: spacing.md
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9'
  },
  navBtnPrimary: {
    backgroundColor: colors.primary
  },
  navBtnDisabled: {
    opacity: 0.5
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  navBtnTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  navBtnTextDisabled: {
    color: colors.mutedText
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.md
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center'
  },
  unansweredBox: {
    backgroundColor: '#fef3c7',
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  unansweredText: {
    fontSize: 13,
    color: '#92400e',
    flex: 1,
    lineHeight: 18
  },
  modalMessage: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalSubmitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  }
});
