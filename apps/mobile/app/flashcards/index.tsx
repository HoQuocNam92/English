import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { FeatureScreen, EmptyState } from '../../src/shared/ui/FeatureScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BATCH_SIZE = 20;

// ─── Types ──────────────────────────────────────────────────────────────────────

interface VocabWord {
  id: string;
  term: string;
  pronunciationIpa?: string;
  partOfSpeech?: string;
  definitionEn: string;
  definitionVi: string;
  examples: { sentenceEn: string; translationVi?: string }[];
  domain?: { code: string; name: string };
  level?: { code: string; name: string };
  studyStatus: 'new' | 'learning' | 'mastered';
}

interface QuizQuestion {
  type: 'fill_blank' | 'multiple_choice';
  vocabularyId: string;
  prompt: string;
  hint?: string;
  options?: string[];
  answer: string;
}

type Phase = 'learn' | 'quiz' | 'summary';

// ─── Main Screen ────────────────────────────────────────────────────────────────

export default function FlashcardsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string; domainCode?: string; levelCode?: string }>();

  const [phase, setPhase] = useState<Phase>('learn');
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Batch learning state
  const [batchStart, setBatchStart] = useState(0);
  const [batchIdx, setBatchIdx] = useState(0);
  const [masteredSet, setMasteredSet] = useState<Set<string>>(new Set());
  const [pendingWrongIds, setPendingWrongIds] = useState<string[]>([]);
  const batchNumberRef = useRef(1);

  // Learn phase
  const [flipped, setFlipped] = useState(false);

  // Quiz phase
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<{ vocabId: string; term: string; correct: boolean }[]>([]);
  const [allTimeResults, setAllTimeResults] = useState<{ vocabId: string; term: string; correct: boolean }[]>([]);

  // Animation
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Compute current batch
  const getCurrentBatch = useCallback(() => {
    if (pendingWrongIds.length > 0) {
      const alreadySeenIds = new Set([
        ...masteredSet,
        ...pendingWrongIds,
        ...words.slice(0, batchStart + BATCH_SIZE).map(w => w.id),
      ]);
      return words.filter(w => !alreadySeenIds.has(w.id)).slice(0, pendingWrongIds.length);
    }
    return words.slice(batchStart, batchStart + BATCH_SIZE).filter(w => !masteredSet.has(w.id));
  }, [words, batchStart, masteredSet, pendingWrongIds]);

  const currentBatch = getCurrentBatch();
  const currentWord = currentBatch[batchIdx];
  const totalWords = words.length;
  const masteredCount = masteredSet.size;
  const allDone = masteredCount >= totalWords || (batchStart >= totalWords && pendingWrongIds.length === 0);

  // ── Load study session ──────────────────────────────────────────────────────

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (params.lessonId) qs.set('lessonId', params.lessonId);
      if (params.domainCode) qs.set('domainCode', params.domainCode);
      if (params.levelCode) qs.set('levelCode', params.levelCode);
      const query = qs.toString() ? `?${qs.toString()}` : '';
      const res: any = await api.get(`/vocab-study/session${query}`);
      setWords(res.words ?? []);
      setBatchStart(0);
      setBatchIdx(0);
      setFlipped(false);
      setMasteredSet(new Set());
      setPendingWrongIds([]);
      setAllTimeResults([]);
      batchNumberRef.current = 1;
      setPhase('learn');
    } catch (e: any) {
      setError(e.message || 'Không thể tải phiên học.');
    } finally {
      setLoading(false);
    }
  }, [params.lessonId, params.domainCode, params.levelCode]);

  useEffect(() => { loadSession(); }, [loadSession]);

  // ── TTS ──────────────────────────────────────────────────────────────────────

  const speak = (text: string) => {
    Speech.speak(text, { language: 'en-US', rate: 0.85 });
  };

  // ── Flip animation ──────────────────────────────────────────────────────────

  const doFlip = () => {
    Animated.spring(flipAnim, { toValue: flipped ? 0 : 1, useNativeDriver: true, friction: 8, tension: 10 }).start();
    setFlipped(v => !v);
  };

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  // ── Auto quiz ──────────────────────────────────────────────────────────────

  const autoStartQuiz = async () => {
    const batchIds = currentBatch.map(w => w.id);
    const quizIds = pendingWrongIds.length > 0
      ? [...pendingWrongIds, ...batchIds]
      : batchIds;
    const uniqueIds = [...new Set(quizIds)];
    await startQuiz(uniqueIds);
  };

  // ── Start quiz ──────────────────────────────────────────────────────────────

  const startQuiz = async (vocabIds: string[]) => {
    try {
      const res: any = await api.get(`/vocab-study/quiz?ids=${vocabIds.join(',')}`);
      setQuestions(res.questions ?? []);
      setQuizIndex(0);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
      setQuizResults([]);
      setPhase('quiz');
    } catch (e: any) {
      setError(e.message || 'Không thể tạo quiz.');
    }
  };

  // ── Submit quiz answer ──────────────────────────────────────────────────────

  const submitQuizAnswer = async () => {
    const q = questions[quizIndex];
    if (!q) return;

    const answer = q.type === 'fill_blank' ? userAnswer.trim() : selectedOption ?? '';
    const isCorrect = answer.toLowerCase() === q.answer.toLowerCase();

    setShowResult(true);
    const result = { vocabId: q.vocabularyId, term: q.answer, correct: isCorrect };
    setQuizResults(prev => [...prev, result]);
    setAllTimeResults(prev => [...prev, result]);

    try {
      await api.post('/vocab-study/answer', { vocabularyId: q.vocabularyId, isCorrect });
    } catch { /* best-effort */ }
  };

  // ── Handle quiz completion ──────────────────────────────────────────────────

  const handleQuizComplete = () => {
    const correctIds = quizResults.filter(r => r.correct).map(r => r.vocabId);
    const wrongIds = quizResults.filter(r => !r.correct).map(r => r.vocabId);

    setMasteredSet(prev => {
      const next = new Set(prev);
      correctIds.forEach(id => next.add(id));
      return next;
    });

    if (wrongIds.length > 0) {
      setPendingWrongIds(wrongIds);
      const alreadySeenIds = new Set([
        ...masteredSet,
        ...correctIds,
        ...wrongIds,
        ...words.slice(0, batchStart + BATCH_SIZE).map(w => w.id),
      ]);
      const remainingNew = words.filter(w => !alreadySeenIds.has(w.id));

      if (remainingNew.length > 0) {
        setBatchIdx(0);
        setFlipped(false);
        flipAnim.setValue(0);
        setPhase('learn');
      } else {
        startQuiz(wrongIds);
      }
    } else {
      setPendingWrongIds([]);
      const nextBatchStart = batchStart + BATCH_SIZE;

      if (nextBatchStart >= words.length) {
        setPhase('summary');
      } else {
        setBatchStart(nextBatchStart);
        setBatchIdx(0);
        setFlipped(false);
        flipAnim.setValue(0);
        batchNumberRef.current += 1;
        setPhase('learn');
      }
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex + 1 < questions.length) {
      setQuizIndex(quizIndex + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
    } else {
      handleQuizComplete();
    }
  };

  // ── Learn phase navigation ─────────────────────────────────────────────────

  const nextCard = () => {
    if (batchIdx + 1 < currentBatch.length) {
      setBatchIdx(batchIdx + 1);
      setFlipped(false);
      flipAnim.setValue(0);
    } else {
      autoStartQuiz();
    }
  };

  const prevCard = () => {
    if (batchIdx > 0) {
      setBatchIdx(batchIdx - 1);
      setFlipped(false);
      flipAnim.setValue(0);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const currentQuestion = questions[quizIndex];
  const batchNumber = batchNumberRef.current;
  const totalBatches = Math.ceil(words.length / BATCH_SIZE);

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: LEARN
  // ═══════════════════════════════════════════════════════════════════════════

  const renderLearnPhase = () => {
    if (!currentWord || currentBatch.length === 0 || allDone) {
      setPhase('summary');
      return <EmptyState icon="school" title="Hoàn thành!" detail="Bạn đã học hết tất cả từ vựng." />;
    }

    const isReviewBatch = pendingWrongIds.length > 0;

    return (
      <View style={styles.phaseContainer}>
        {/* Batch info */}
        <View style={[styles.batchInfoRow, { backgroundColor: colors.primaryContainer }]}>
          <MaterialIcons name="layers" size={16} color={colors.onPrimaryContainer} />
          <Text style={[styles.batchInfoText, { color: colors.onPrimaryContainer }]}>
            {isReviewBatch ? `Học thêm từ mới (${pendingWrongIds.length} từ sai cần ôn)` : `Đợt ${batchNumber}/${totalBatches}`}
          </Text>
        </View>

        {/* Overall progress */}
        <View style={styles.overallProgressRow}>
          <Text style={[styles.overallProgressLabel, { color: colors.onSurfaceVariant }]}>
            Đã thuộc: {masteredCount}/{totalWords}
          </Text>
          <View style={[styles.progressContainer, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.progressBar, { width: `${totalWords > 0 ? (masteredCount / totalWords) * 100 : 0}%`, backgroundColor: '#4CAF50' }]} />
          </View>
        </View>

        {/* Batch progress */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surfaceVariant }]}>
          <View style={[styles.progressBar, { width: `${((batchIdx + 1) / currentBatch.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
          {batchIdx + 1} / {currentBatch.length} từ trong đợt này
        </Text>

        {/* Flip card */}
        <TouchableOpacity activeOpacity={0.95} onPress={doFlip} style={styles.cardTouchArea}>
          {/* Front */}
          <Animated.View style={[styles.flipCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, transform: [{ rotateY: frontInterpolate }] }]}>
            <TouchableOpacity onPress={() => speak(currentWord.term)} style={styles.speakerBtn}>
              <MaterialIcons name="volume-up" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.termText, { color: colors.onSurface }]}>{currentWord.term}</Text>
            {currentWord.pronunciationIpa ? (
              <Text style={[styles.ipaText, { color: colors.onSurfaceVariant }]}>{currentWord.pronunciationIpa}</Text>
            ) : null}
            {currentWord.partOfSpeech ? (
              <View style={[styles.posBadge, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.posText, { color: colors.onPrimaryContainer }]}>{currentWord.partOfSpeech}</Text>
              </View>
            ) : null}
            <Text style={[styles.tapHint, { color: colors.outline }]}>Chạm để xem nghĩa</Text>
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.flipCard, styles.flipCardBack, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, transform: [{ rotateY: backInterpolate }] }]}>
            <Text style={[styles.defVi, { color: colors.onSurface }]}>{currentWord.definitionVi}</Text>
            <Text style={[styles.defEn, { color: colors.onSurfaceVariant }]}>{currentWord.definitionEn}</Text>
            {currentWord.examples?.[0] ? (
              <View style={[styles.exampleBox, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.exampleText, { color: colors.primary }]}>"{currentWord.examples[0].sentenceEn}"</Text>
                {currentWord.examples[0].translationVi ? (
                  <Text style={[styles.exampleTranslation, { color: colors.onSurfaceVariant }]}>{currentWord.examples[0].translationVi}</Text>
                ) : null}
              </View>
            ) : null}
          </Animated.View>
        </TouchableOpacity>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={prevCard} disabled={batchIdx === 0} style={[styles.navBtn, { backgroundColor: colors.surface, opacity: batchIdx === 0 ? 0.4 : 1 }]}>
            <MaterialIcons name="chevron-left" size={24} color={colors.onSurface} />
            <Text style={{ color: colors.onSurface }}>Trước</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={doFlip} style={[styles.flipBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="flip" size={20} color="#fff" />
            <Text style={styles.flipBtnText}>Lật thẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={nextCard} style={[styles.navBtn, { backgroundColor: batchIdx + 1 >= currentBatch.length ? colors.primary : colors.surface }]}>
            <Text style={{ color: batchIdx + 1 >= currentBatch.length ? '#fff' : colors.onSurface, fontWeight: batchIdx + 1 >= currentBatch.length ? '800' : '400' }}>
              {batchIdx + 1 >= currentBatch.length ? 'Kiểm tra' : 'Tiếp'}
            </Text>
            <MaterialIcons name={batchIdx + 1 >= currentBatch.length ? 'quiz' : 'chevron-right'} size={24} color={batchIdx + 1 >= currentBatch.length ? '#fff' : colors.onSurface} />
          </TouchableOpacity>
        </View>

      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: QUIZ
  // ═══════════════════════════════════════════════════════════════════════════

  const renderQuizPhase = () => {
    if (!currentQuestion) {
      return <EmptyState icon="quiz" title="Không có câu hỏi" detail="Không thể tạo quiz." />;
    }

    const isCorrectAnswer = showResult && (
      currentQuestion.type === 'fill_blank'
        ? userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()
        : selectedOption?.toLowerCase() === currentQuestion.answer.toLowerCase()
    );

    return (
      <KeyboardAvoidingView style={styles.phaseContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Batch + mastered info */}
        <View style={styles.quizHeader}>
          <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
            Câu {quizIndex + 1} / {questions.length}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Text style={[styles.roundBadge, { backgroundColor: colors.primaryContainer, color: colors.onPrimaryContainer }]}>
              Đợt {batchNumber}
            </Text>
            <Text style={[styles.roundBadge, { backgroundColor: '#E8F5E9', color: '#2E7D32' }]}>
              {masteredCount} thuộc
            </Text>
          </View>
        </View>

        {/* Quiz progress */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surfaceVariant }]}>
          <View style={[styles.progressBar, { width: `${((quizIndex + 1) / questions.length) * 100}%`, backgroundColor: colors.secondary }]} />
        </View>

        {/* Question card */}
        <View style={[styles.quizCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.quizLabel, { color: colors.onSurfaceVariant }]}>
            {currentQuestion.type === 'fill_blank' ? 'Điền từ vào chỗ trống:' : 'Chọn từ đúng cho nghĩa:'}
          </Text>
          <Text style={[styles.quizPrompt, { color: colors.onSurface }]}>{currentQuestion.prompt}</Text>
          {currentQuestion.hint ? (
            <Text style={[styles.quizHint, { color: colors.onSurfaceVariant }]}>💡 {currentQuestion.hint}</Text>
          ) : null}

          {/* Fill-in-blank input */}
          {currentQuestion.type === 'fill_blank' ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.answerInput, {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: showResult ? (isCorrectAnswer ? '#4CAF50' : '#F44336') : colors.outlineVariant,
                }]}
                placeholder="Nhập từ tiếng Anh..."
                placeholderTextColor={colors.outline}
                value={userAnswer}
                onChangeText={setUserAnswer}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!showResult}
                onSubmitEditing={() => !showResult && userAnswer.trim() && submitQuizAnswer()}
              />
            </View>
          ) : null}

          {/* Multiple choice options */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isAnswer = opt.toLowerCase() === currentQuestion.answer.toLowerCase();
                let optionStyle = { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineVariant };
                if (showResult) {
                  if (isAnswer) optionStyle = { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' };
                  else if (isSelected && !isAnswer) optionStyle = { backgroundColor: '#FFEBEE', borderColor: '#F44336' };
                } else if (isSelected) {
                  optionStyle = { backgroundColor: colors.primaryContainer, borderColor: colors.primary };
                }

                return (
                  <TouchableOpacity
                    key={i}
                    disabled={showResult}
                    onPress={() => setSelectedOption(opt)}
                    style={[styles.optionBtn, optionStyle]}
                  >
                    <Text style={[styles.optionKey, { color: showResult && isAnswer ? '#2E7D32' : colors.onSurface }]}>
                      {String.fromCharCode(65 + i)}.
                    </Text>
                    <Text style={[styles.optionText, { color: showResult && isAnswer ? '#2E7D32' : colors.onSurface }]}>
                      {opt}
                    </Text>
                    {showResult && isAnswer ? <MaterialIcons name="check-circle" size={22} color="#4CAF50" /> : null}
                    {showResult && isSelected && !isAnswer ? <MaterialIcons name="cancel" size={22} color="#F44336" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* Result feedback */}
          {showResult ? (
            <View style={[styles.feedbackBox, { backgroundColor: isCorrectAnswer ? '#E8F5E9' : '#FFEBEE' }]}>
              <MaterialIcons name={isCorrectAnswer ? 'check-circle' : 'highlight-off'} size={24} color={isCorrectAnswer ? '#4CAF50' : '#F44336'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: isCorrectAnswer ? '#2E7D32' : '#C62828' }}>
                  {isCorrectAnswer ? 'Chính xác! 🎉' : 'Chưa đúng'}
                </Text>
                {!isCorrectAnswer ? (
                  <Text style={{ color: '#C62828', marginTop: 4 }}>Đáp án đúng: <Text style={{ fontWeight: '800' }}>{currentQuestion.answer}</Text></Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        {/* Action button */}
        {!showResult ? (
          <TouchableOpacity
            disabled={currentQuestion.type === 'fill_blank' ? !userAnswer.trim() : !selectedOption}
            onPress={submitQuizAnswer}
            style={[styles.primaryBtn, {
              backgroundColor: colors.primary,
              opacity: (currentQuestion.type === 'fill_blank' ? !userAnswer.trim() : !selectedOption) ? 0.5 : 1,
            }]}
          >
            <Text style={styles.primaryBtnText}>Kiểm tra</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={nextQuizQuestion} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.primaryBtnText}>
              {quizIndex + 1 < questions.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  const renderSummaryPhase = () => {
    const finalMastered = masteredSet.size;
    const percentage = totalWords > 0 ? Math.round((finalMastered / totalWords) * 100) : 0;
    const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '💪' : '📚';

    // Deduplicate — show last result per vocabId
    const resultMap = new Map<string, { vocabId: string; term: string; correct: boolean }>();
    allTimeResults.forEach(r => resultMap.set(r.vocabId, r));
    const finalResults = Array.from(resultMap.values());
    const finalCorrect = finalResults.filter(r => r.correct).length;

    return (
      <View style={styles.phaseContainer}>
        {/* Score circle */}
        <View style={[styles.scoreCircle, { borderColor: percentage >= 80 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#F44336' }]}>
          <Text style={styles.scoreEmoji}>{emoji}</Text>
          <Text style={[styles.scoreText, { color: colors.onSurface }]}>{finalMastered}/{totalWords}</Text>
          <Text style={[styles.scoreLabel, { color: colors.onSurfaceVariant }]}>từ đã thuộc</Text>
        </View>

        <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>
          {percentage >= 80 ? 'Xuất sắc!' : percentage >= 50 ? 'Khá tốt!' : 'Cần ôn thêm!'}
        </Text>
        <Text style={[styles.summarySubtitle, { color: colors.onSurfaceVariant }]}>
          {batchNumber} đợt học · {finalCorrect}/{finalResults.length} câu trả lời đúng
        </Text>

        {/* Results list */}
        <View style={[styles.resultsList, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          {finalResults.map((r, i) => (
            <View key={i} style={[styles.resultRow, i < finalResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }]}>
              <MaterialIcons name={r.correct ? 'check-circle' : 'cancel'} size={20} color={r.correct ? '#4CAF50' : '#F44336'} />
              <Text style={[styles.resultTerm, { color: colors.onSurface }]}>{r.term}</Text>
              <Text style={[styles.resultStatus, { color: r.correct ? '#4CAF50' : '#F44336' }]}>
                {r.correct ? 'Thuộc' : 'Chưa thuộc'}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.summaryActions}>
          <TouchableOpacity onPress={loadSession} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="replay" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Học lại từ đầu</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={[styles.textBtn]}>
            <Text style={[styles.textBtnText, { color: colors.onSurfaceVariant }]}>Về trang chính</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Title & subtitle ──────────────────────────────────────────────────────

  const phaseTitle = phase === 'learn' ? 'Học từ vựng' : phase === 'quiz' ? 'Kiểm tra' : 'Kết quả';
  const phaseSubtitle =
    phase === 'learn' && currentBatch.length ? `Đợt ${batchNumber} · ${batchIdx + 1}/${currentBatch.length} từ` :
    phase === 'quiz' && questions.length ? `Câu ${quizIndex + 1}/${questions.length}` :
    phase === 'summary' ? `${masteredCount}/${totalWords} đã thuộc` :
    'Ôn tập từ vựng IT';

  return (
    <FeatureScreen title={phaseTitle} subtitle={phaseSubtitle} loading={loading} error={error} onRetry={loadSession}>
      {phase === 'learn' && renderLearnPhase()}
      {phase === 'quiz' && renderQuizPhase()}
      {phase === 'summary' && renderSummaryPhase()}
    </FeatureScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  phaseContainer: { flex: 1, gap: 16 },

  // Batch info
  batchInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  batchInfoText: { fontSize: 13, fontWeight: '700' },
  overallProgressRow: { gap: 4 },
  overallProgressLabel: { fontSize: 12, fontWeight: '600' },

  // Progress
  progressContainer: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, textAlign: 'center', marginTop: 4 },

  // Flip card
  cardTouchArea: { height: 320, perspective: 1000 },
  flipCard: {
    position: 'absolute', width: '100%', height: '100%',
    borderWidth: 1, borderRadius: 20, padding: 24,
    justifyContent: 'center', alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12,
    elevation: 4,
  },
  flipCardBack: { position: 'absolute', top: 0 },
  speakerBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  termText: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
  ipaText: { fontSize: 16, marginTop: 8, textAlign: 'center' },
  posBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, marginTop: 12 },
  posText: { fontSize: 12, fontWeight: '700' },
  tapHint: { fontSize: 12, marginTop: 20 },
  defVi: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  defEn: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  exampleBox: { marginTop: 16, padding: 12, borderRadius: 12, width: '100%' },
  exampleText: { fontStyle: 'italic', fontSize: 14, textAlign: 'center' },
  exampleTranslation: { fontSize: 12, textAlign: 'center', marginTop: 6 },

  // Navigation
  navRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  flipBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  flipBtnText: { color: '#fff', fontWeight: '800' },

  // Quiz
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roundBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, overflow: 'hidden' },
  quizCard: { borderWidth: 1, borderRadius: 20, padding: 24, gap: 14 },
  quizLabel: { fontSize: 13, fontWeight: '600' },
  quizPrompt: { fontSize: 20, fontWeight: '800', lineHeight: 28 },
  quizHint: { fontSize: 13, fontStyle: 'italic' },
  inputContainer: { marginTop: 4 },
  answerInput: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '700' },
  optionsContainer: { gap: 10, marginTop: 4 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  optionKey: { fontSize: 16, fontWeight: '800', width: 24 },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600' },
  feedbackBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12 },

  // Buttons
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 2 },
  secondaryBtnText: { fontSize: 15, fontWeight: '700' },
  textBtn: { alignItems: 'center', paddingVertical: 12 },
  textBtnText: { fontSize: 14 },

  // Summary
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 5, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  scoreEmoji: { fontSize: 32 },
  scoreText: { fontSize: 28, fontWeight: '900' },
  scoreLabel: { fontSize: 12 },
  summaryTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  summarySubtitle: { fontSize: 14, textAlign: 'center' },
  resultsList: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  resultTerm: { flex: 1, fontSize: 15, fontWeight: '600' },
  resultStatus: { fontSize: 12, fontWeight: '700' },
  summaryActions: { gap: 10, marginTop: 8 },
});
