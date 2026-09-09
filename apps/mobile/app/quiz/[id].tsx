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

const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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
        <Text style={{ marginTop: spacing.md, color: '#464555' }}>Đang chuẩn bị đề thi...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMultipleChoice = currentQuestion?.type === 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS';
  const total = questions.length || 1;

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
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()} disabled={submitting}>
          <MaterialIcons name="close" size={24} color="#464555" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.progressText}>{currentIndex + 1} / {total}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / total) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.timerText}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </Text>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentQuestion && (
          <View style={styles.questionSection}>
            <Text style={styles.questionTitle}>
              {safeText((currentQuestion as any).prompt || currentQuestion.text)}
            </Text>
            <Text style={styles.questionSubtitle}>
              {isMultipleChoice ? 'Chọn các đáp án đúng bên dưới.' : 'Chọn một đáp án đúng bên dưới.'}
            </Text>

            {/* Options */}
            <View style={styles.optionsList}>
              {currentQuestion.options?.map((option: any, optIdx: number) => {
                const optId = option.id || option.key || String(optIdx);
                const selected = answers[currentQuestion.id]?.includes(optId);
                const rawText = safeText(option.text || option.content || option.value || option.label || option);
                const letter = ALPHABET[optIdx % ALPHABET.length];

                return (
                  <TouchableOpacity
                    key={optId}
                    style={[styles.optionItem, selected && styles.optionItemSelected]}
                    onPress={() => toggleOption(currentQuestion.id, optId, isMultipleChoice)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContentRow}>
                      <View style={[styles.optionLetterBox, selected && styles.optionLetterBoxSelected]}>
                        <Text style={[styles.optionLetterText, selected && styles.optionLetterTextSelected]}>{letter}</Text>
                      </View>
                      <Text style={styles.optionText}>
                        {rawText}
                      </Text>
                    </View>
                    
                    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                      {selected && <MaterialIcons name="check" size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.bottomFixedArea}>
        {currentIndex > 0 && (
          <TouchableOpacity 
            style={styles.btnSecondary} 
            onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={submitting}
          >
            <Text style={styles.btnSecondaryText}>Trước</Text>
          </TouchableOpacity>
        )}

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={confirmSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.btnPrimaryText}>Nộp bài</Text>
                <MaterialIcons name="done-all" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={styles.btnPrimaryText}>Tiếp tục</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
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
    backgroundColor: '#f7f9fb' // surface
  },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 20, // safe area approx
    backgroundColor: '#ffffff', // surface lowest
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8', // outline-variant
    marginTop: 20
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: spacing.md,
    alignItems: 'center'
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555',
    marginBottom: 4
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#e6e8ea',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191c1e'
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: 160 // room for bottom bar
  },
  questionSection: {
    marginBottom: spacing.xl
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#191c1e',
    marginBottom: spacing.md,
    lineHeight: 32,
    letterSpacing: -0.2
  },
  questionSubtitle: {
    fontSize: 14,
    color: '#464555',
    marginBottom: spacing.xl
  },
  optionsList: {
    gap: spacing.sm
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    backgroundColor: '#f7f9fb'
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eef2ff', // approx primary-fixed/20
    borderWidth: 2,
    padding: spacing.md - 1 // offset border width to avoid jumping
  },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    paddingRight: spacing.md
  },
  optionLetterBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionLetterBoxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555'
  },
  optionLetterTextSelected: {
    color: '#ffffff'
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    lineHeight: 20
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c7c4d8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  bottomFixedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: spacing.md,
    paddingBottom: 32, // safe area approx
    borderTopWidth: 1,
    borderTopColor: '#e6e8ea',
    flexDirection: 'row',
    gap: spacing.sm
  },
  btnPrimary: {
    flex: 1,
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  btnSecondary: {
    width: 80,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    color: '#464555',
    fontSize: 15,
    fontWeight: '600'
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
    color: '#191c1e',
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
    color: '#191c1e',
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
    color: '#191c1e',
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
