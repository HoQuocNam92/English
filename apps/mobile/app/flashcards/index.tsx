import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Alert,
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
  audioUrl?: string;
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
  const params = useLocalSearchParams<{ lessonId?: string; domainCode?: string; levelCode?: string; mode?: string }>();

  const isReview = params.mode === 'review';
  const [phase, setPhase] = useState<Phase>('learn');
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

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
  const [quizMarkedMastered, setQuizMarkedMastered] = useState(false);
  const [quizResults, setQuizResults] = useState<{ vocabId: string; term: string; correct: boolean; selfReported?: boolean }[]>([]);
  const [allTimeResults, setAllTimeResults] = useState<{ vocabId: string; term: string; correct: boolean; selfReported?: boolean }[]>([]);
  const [ratings, setRatings] = useState<Record<string, 'easy' | 'medium' | 'hard' | 'mastered'>>({});
  const [sessionMeta, setSessionMeta] = useState<any>(null);
  const [dailyLimitNotice, setDailyLimitNotice] = useState(false);

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
    return words.slice(batchStart, batchStart + BATCH_SIZE);
  }, [words, batchStart, masteredSet, pendingWrongIds]);

  const currentBatch = getCurrentBatch();
  const currentWord = currentBatch[batchIdx];
  const totalWords = words.length;
  const masteredCount = masteredSet.size;
  const allDone = masteredCount >= totalWords || (batchStart >= totalWords && pendingWrongIds.length === 0);

  // ── Load study session ──────────────────────────────────────────────────────

  const loadSession = useCallback(async (continueLearning = false) => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (params.lessonId) qs.set('lessonId', params.lessonId);
      if (params.domainCode) qs.set('domainCode', params.domainCode);
      if (params.levelCode) qs.set('levelCode', params.levelCode);
      if (continueLearning) qs.set('continue', 'true');
      const query = qs.toString() ? `?${qs.toString()}` : '';
      let res: any = await api.get(isReview ? '/vocab-study/review-session' : `/vocab-study/session${query}`);
      const initialMeta = res.meta ?? null;
      const reachedDailyTarget = Boolean(initialMeta?.dailyLimitReached);
      setDailyLimitNotice(reachedDailyTarget);
      if (!isReview && !continueLearning && reachedDailyTarget && (res.words?.length ?? 0) === 0) {
        qs.set('continue', 'true');
        res = await api.get(`/vocab-study/session?${qs.toString()}`);
        res.meta = { ...(res.meta ?? {}), ...initialMeta, dailyLimitReached: true };
      }
      setWords(res.words ?? []);
      setSessionMeta(res.meta ?? null);
      setBatchStart(0);
      setBatchIdx(0);
      setFlipped(false);
      setMasteredSet(new Set());
      setPendingWrongIds([]);
      setAllTimeResults([]);
      setRatings({});
      batchNumberRef.current = 1;
      setPhase('learn');
    } catch (e: any) {
      setError(e.message || 'Không thể tải phiên học.');
    } finally {
      setLoading(false);
    }
  }, [params.lessonId, params.domainCode, params.levelCode, isReview]);

  useEffect(() => { loadSession(); }, [loadSession]);

  // ── TTS ──────────────────────────────────────────────────────────────────────

  const speak = async (text: string) => {
    try {
      await Speech.stop();
      setTimeout(() => {
        Speech.speak(text, {
          language: 'en-US',
          rate: 0.78,
          pitch: 1,
          volume: 1,
          onError: () => Alert.alert('Không phát được âm thanh', 'Vui lòng bật giọng đọc tiếng Anh trong phần Chuyển văn bản thành giọng nói của điện thoại.'),
        });
      }, 150);
    } catch {
      Alert.alert('Không phát được âm thanh', 'Điện thoại chưa có giọng đọc tiếng Anh hoặc dịch vụ đọc đang bị tắt.');
    }
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

  const startQuiz = async (vocabIds: string[], ratingMap?: Record<string, 'easy' | 'medium' | 'hard' | 'mastered'>) => {
    try {
      const repetitions = ratingMap ? Object.fromEntries(Object.entries(ratingMap).filter(([, rating]) => rating !== 'mastered').map(([id, rating]) => [id, rating === 'easy' ? 2 : rating === 'medium' ? 3 : 4])) : undefined;
      const ids = ratingMap ? vocabIds.filter(id => ratingMap[id] !== 'mastered') : vocabIds;
      if (ids.length === 0) { setPhase('summary'); return; }
      const res: any = await api.post('/vocab-study/quiz', { vocabIds: ids, repetitions });
      setQuestions(res.questions ?? []);
      setQuizIndex(0);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
      setQuizMarkedMastered(false);
      setQuizResults([]);
      setPhase('quiz');
    } catch (e: any) {
      setError(e.message || 'Không thể tạo quiz.');
    }
  };

  // ── Submit quiz answer ──────────────────────────────────────────────────────

  const submitQuizAnswer = async (submittedAnswer?: string) => {
    if (showResult || savingRef.current) return;
    const q = questions[quizIndex];
    if (!q) return;
    const answer = submittedAnswer ?? (q.type === 'fill_blank' ? userAnswer.trim() : selectedOption ?? '');
    const isCorrect = answer.toLowerCase() === q.answer.toLowerCase();
    savingRef.current = true; setSaving(true);
    try {
      await api.post('/vocab-study/answer', { vocabularyId: q.vocabularyId, isCorrect });
      const result = { vocabId: q.vocabularyId, term: words.find(word => word.id === q.vocabularyId)?.term ?? q.answer, correct: isCorrect };
      setQuizResults(prev => [...prev, result]);
      setAllTimeResults(prev => [...prev, result]);
      setShowResult(true);
    } catch (cause) {
      Alert.alert('Chưa lưu được đáp án', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
    } finally { savingRef.current = false; setSaving(false); }
  };

  const markQuizWordMastered = async () => {
    if (!currentQuestion || showResult || savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      await api.post('/vocab-study/rate', { vocabularyId: currentQuestion.vocabularyId, rating: 'mastered' });
      setQuizMarkedMastered(true);
      setMasteredSet(previous => new Set(previous).add(currentQuestion.vocabularyId));
      const result = { vocabId: currentQuestion.vocabularyId, term: words.find(word => word.id === currentQuestion.vocabularyId)?.term ?? currentQuestion.answer, correct: true, selfReported: true };
      setQuizResults(previous => [...previous, result]);
      setAllTimeResults(previous => [...previous, result]);
      setQuestions(previous => previous.filter((question, index) => index <= quizIndex || question.vocabularyId !== currentQuestion.vocabularyId));
      setShowResult(true);
    } catch (cause) {
      Alert.alert('Chưa lưu được đánh giá', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
    } finally { savingRef.current = false; setSaving(false); }
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
      setQuizMarkedMastered(false);
    } else {
      handleQuizComplete();
    }
  };

  useEffect(() => {
    if (phase !== 'quiz' || !showResult) return;
    const timer = setTimeout(() => nextQuizQuestion(), 1500);
    return () => clearTimeout(timer);
  }, [phase, showResult, quizIndex, questions.length]);

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

  const rateWord = async (rating: 'easy' | 'medium' | 'hard' | 'mastered') => {
    if (!currentWord || savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      await api.post('/vocab-study/rate', { vocabularyId: currentWord.id, rating });
      if (rating === 'mastered') setMasteredSet(previous => new Set(previous).add(currentWord.id));
      const nextRatings = { ...ratings, [currentWord.id]: rating };
      setRatings(nextRatings);
      if (batchIdx + 1 < currentBatch.length) {
        setBatchIdx(index => index + 1);
        setFlipped(false);
        flipAnim.setValue(0);
      } else {
        await startQuiz(currentBatch.map(word => word.id), nextRatings);
      }
    } catch (cause) {
      Alert.alert('Chưa lưu được đánh giá', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
    } finally { savingRef.current = false; setSaving(false); }
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
      return <View style={styles.emptySession}><EmptyState icon="school" title={isReview ? "Chưa có từ đến hạn ôn" : "Không còn từ mới"} detail={isReview ? "Quay lại sau hoặc tiếp tục học từ mới." : "Những từ đã học và đã biết đã được loại khỏi phiên mặc định."} />
        <TouchableOpacity onPress={() => router.push('/flashcards/history' as any)} style={styles.textBtn}><Text style={[styles.textBtnText, { color: colors.primary }]}>Xem từ đã học</Text></TouchableOpacity>
      </View>;
    }

    return (
      <View style={styles.phaseContainer}>
        <View style={styles.sessionToolbar}><Text style={[styles.dailyText, { color: colors.onSurfaceVariant }]}>{isReview ? `${totalWords} từ đến hạn ôn` : `Hôm nay: ${sessionMeta?.studiedToday ?? 0}/${sessionMeta?.maxDailyNewWords ?? '—'} từ mới`}</Text><TouchableOpacity onPress={() => router.push('/flashcards/history' as any)}><Text style={[styles.historyLink, { color: colors.primary }]}>Từ đã học</Text></TouchableOpacity></View>
        {dailyLimitNotice && <View style={styles.dailyNotice}><MaterialIcons name="check-circle" size={14} color="#a16207" /><Text style={styles.dailyNoticeText}>Đã đủ mục tiêu hôm nay · đang học thêm</Text></View>}
        <View style={styles.speakerRow}><TouchableOpacity onPress={() => void speak(currentWord.term)} style={[styles.speakerBtn, { backgroundColor: colors.surface }]} accessibilityRole="button" accessibilityLabel={`Phát âm ${currentWord.term}`}><MaterialIcons name="volume-up" size={28} color={colors.primary} /></TouchableOpacity></View>

        {/* Flip card */}
        <View style={styles.cardTouchArea}>
          <TouchableOpacity activeOpacity={0.95} onPress={doFlip} style={styles.cardFlipArea}>
            {/* Front */}
            <Animated.View style={[styles.flipCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }] }]}>
            <Text style={[styles.termText, { color: colors.onSurface }]} numberOfLines={4} adjustsFontSizeToFit minimumFontScale={0.35}>{currentWord.term}</Text>
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
            <Animated.View style={[styles.flipCard, styles.flipCardBack, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, transform: [{ perspective: 1000 }, { rotateY: backInterpolate }] }]}>
            <Text style={[styles.defVi, { color: colors.onSurface }]} numberOfLines={5} adjustsFontSizeToFit minimumFontScale={0.4}>{currentWord.definitionVi}</Text>
            <Text style={[styles.defEn, { color: colors.onSurfaceVariant }]} numberOfLines={5} adjustsFontSizeToFit minimumFontScale={0.7}>{currentWord.definitionEn}</Text>
            {currentWord.examples?.[0] ? (
              <View style={[styles.exampleBox, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.exampleText, { color: colors.primary }]} numberOfLines={3}>"{currentWord.examples[0].sentenceEn}"</Text>
                {currentWord.examples[0].translationVi ? (
                  <Text style={[styles.exampleTranslation, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{currentWord.examples[0].translationVi}</Text>
                ) : null}
              </View>
            ) : null}
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={[styles.ratingBar, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          {([
            ['easy', 'sentiment-satisfied', 'Dễ', '#059669'],
            ['medium', 'sentiment-neutral', 'Trung bình', '#d97706'],
            ['hard', 'sentiment-dissatisfied', 'Khó', '#dc2626'],
            ['mastered', 'fast-forward', 'Đã biết', '#64748b'],
          ] as const).map(([rating, icon, label, color]) => (
            <TouchableOpacity key={rating} disabled={saving} style={[styles.ratingButton, saving && { opacity: 0.5 }]} onPress={() => rateWord(rating)}>
              <MaterialIcons name={icon} size={22} color={color} />
              <Text style={[styles.ratingText, { color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
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
                  borderColor: showResult ? (isCorrectAnswer ? '#15803d' : '#b91c1c') : colors.outlineVariant,
                }]}
                placeholder="Nhập từ tiếng Anh..."
                placeholderTextColor={colors.outline}
                value={userAnswer}
                onChangeText={setUserAnswer}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!showResult && !saving}
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
                  if (isAnswer) optionStyle = { backgroundColor: '#E8F5E9', borderColor: '#15803d' };
                  else if (isSelected && !isAnswer) optionStyle = { backgroundColor: '#FFEBEE', borderColor: '#b91c1c' };
                } else if (isSelected) {
                  optionStyle = { backgroundColor: colors.primaryContainer, borderColor: colors.primary };
                }

                return (
                  <TouchableOpacity
                    key={i}
                    disabled={showResult || saving}
                    onPress={() => { setSelectedOption(opt); void submitQuizAnswer(opt); }}
                    style={[styles.optionBtn, optionStyle]}
                  >
                    <Text style={[styles.optionKey, { color: showResult && isAnswer ? '#2E7D32' : colors.onSurface }]}>
                      {String.fromCharCode(65 + i)}.
                    </Text>
                    <Text style={[styles.optionText, { color: showResult && isAnswer ? '#2E7D32' : colors.onSurface }]}>
                      {opt}
                    </Text>
                    {showResult && isAnswer ? <MaterialIcons name="check-circle" size={22} color="#15803d" /> : null}
                    {showResult && isSelected && !isAnswer ? <MaterialIcons name="cancel" size={22} color="#b91c1c" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* Result feedback */}
          {showResult ? (
            <View style={[styles.feedbackBox, { backgroundColor: quizMarkedMastered || isCorrectAnswer ? '#E8F5E9' : '#FFEBEE' }]}>
              <MaterialIcons name={quizMarkedMastered || isCorrectAnswer ? 'check-circle' : 'highlight-off'} size={24} color={quizMarkedMastered || isCorrectAnswer ? '#15803d' : '#b91c1c'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: quizMarkedMastered || isCorrectAnswer ? '#2E7D32' : '#C62828' }}>
                  {quizMarkedMastered ? 'Đã đánh dấu là đã biết' : isCorrectAnswer ? 'Chính xác! 🎉' : 'Chưa đúng'}
                </Text>
                {!quizMarkedMastered && !isCorrectAnswer ? (
                  <Text style={{ color: '#C62828', marginTop: 4 }}>Đáp án đúng: <Text style={{ fontWeight: '800' }}>{currentQuestion.answer}</Text></Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        {/* Action button */}
        {!showResult && <View style={styles.quizActions}>
          {currentQuestion.type === 'fill_blank' && <TouchableOpacity disabled={saving || !userAnswer.trim()} onPress={() => void submitQuizAnswer()} style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.primary, opacity: !userAnswer.trim() ? 0.5 : 1 }]}><Text style={styles.primaryBtnText}>Kiểm tra</Text></TouchableOpacity>}
          <TouchableOpacity disabled={saving} onPress={markQuizWordMastered} style={[styles.secondaryBtn, { flex: 1, borderColor: colors.primary }]}><MaterialIcons name="done-all" size={20} color={colors.primary} /><Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Đã biết</Text></TouchableOpacity>
        </View>}
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
    const resultMap = new Map<string, { vocabId: string; term: string; correct: boolean; selfReported?: boolean }>();
    allTimeResults.forEach(r => resultMap.set(r.vocabId, r));
    const finalResults = Array.from(resultMap.values());
    const answers = allTimeResults.filter(result => !result.selfReported);
    const finalCorrect = answers.filter(result => result.correct).length;
    const selfReportedIds = new Set([
      ...Object.entries(ratings).filter(([, rating]) => rating === 'mastered').map(([id]) => id),
      ...allTimeResults.filter(result => result.selfReported).map(result => result.vocabId),
    ]);

    return (
      <View style={styles.phaseContainer}>
        {/* Score circle */}
        <View style={[styles.scoreCircle, { borderColor: percentage >= 80 ? '#15803d' : percentage >= 50 ? '#FF9800' : '#b91c1c' }]}>
          <Text style={styles.scoreEmoji}>{emoji}</Text>
          <Text style={[styles.scoreText, { color: colors.onSurface }]}>{finalMastered}/{totalWords}</Text>
          <Text style={[styles.scoreLabel, { color: colors.onSurfaceVariant }]}>từ hoàn tất trong phiên</Text>
        </View>

        <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>
          {percentage >= 80 ? 'Xuất sắc!' : percentage >= 50 ? 'Khá tốt!' : 'Cần ôn thêm!'}
        </Text>
        <Text style={[styles.summarySubtitle, { color: colors.onSurfaceVariant }]}>
          {batchNumber} đợt học · {finalCorrect}/{answers.length} lượt trả lời đúng
        </Text>

        <Text style={[styles.summarySubtitle, { color: colors.onSurfaceVariant }]}>
          {selfReportedIds.size} từ tự đánh dấu đã biết · Kết quả trong phiên này
        </Text>
        {/* Results list */}
        <View style={[styles.resultsList, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          {finalResults.map((r, i) => (
            <View key={i} style={[styles.resultRow, i < finalResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }]}>
              <MaterialIcons name={r.correct ? 'check-circle' : 'cancel'} size={20} color={r.correct ? '#15803d' : '#b91c1c'} />
              <Text style={[styles.resultTerm, { color: colors.onSurface }]}>{r.term}</Text>
              <Text style={[styles.resultStatus, { color: r.correct ? '#15803d' : '#b91c1c' }]}>
                {r.selfReported ? 'Tự đánh dấu đã biết' : r.correct ? 'Lần cuối đúng' : 'Lần cuối sai'}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.summaryActions}>
          <TouchableOpacity onPress={() => loadSession(true)} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="replay" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>{isReview ? 'Kiểm tra từ đến hạn' : 'Học thêm từ mới'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={[styles.textBtn]}>
            <Text style={[styles.textBtnText, { color: colors.onSurfaceVariant }]}>Về trang chính</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Title & subtitle ──────────────────────────────────────────────────────

  const phaseTitle = phase === 'learn' ? (isReview ? 'Ôn tập đến hạn' : 'Học từ vựng') : phase === 'quiz' ? 'Kiểm tra' : 'Kết quả';
  const phaseSubtitle = phase === 'summary' ? 'Hoàn thành phiên học' : 'Ôn tập từ vựng IT';

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
  emptySession: { gap: 12 },
  sessionToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dailyText: { fontSize: 12, fontWeight: '700' },
  historyLink: { fontSize: 12, fontWeight: '800' },
  dailyNotice: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 5 },
  dailyNoticeText: { fontSize: 10, fontWeight: '700', color: '#854d0e' },

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
  cardTouchArea: { height: 350 },
  cardFlipArea: { flex: 1 },
  flipCard: {
    position: 'absolute', width: '100%', height: '100%',
    borderWidth: 1, borderRadius: 20, padding: 18,
    justifyContent: 'center', alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12,
    elevation: 4,
  },
  flipCardBack: { position: 'absolute', top: 0 },
  speakerRow: { height: 44, alignItems: 'flex-end', justifyContent: 'center', marginBottom: -8, zIndex: 2 },
  speakerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd6fe', elevation: 2 },
  termText: { fontSize: 27, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  ipaText: { fontSize: 16, marginTop: 8, textAlign: 'center' },
  posBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, marginTop: 12 },
  posText: { fontSize: 12, fontWeight: '700' },
  tapHint: { fontSize: 12, marginTop: 20 },
  defVi: { fontSize: 18, lineHeight: 24, fontWeight: '800', textAlign: 'center' },
  defEn: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  exampleBox: { marginTop: 10, padding: 10, borderRadius: 12, width: '100%' },
  exampleText: { fontStyle: 'italic', fontSize: 12, lineHeight: 16, textAlign: 'center' },
  exampleTranslation: { fontSize: 11, lineHeight: 15, textAlign: 'center', marginTop: 4 },

  // Navigation
  navRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  ratingBar: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, padding: 6 },
  ratingButton: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 2 },
  ratingText: { fontSize: 10, fontWeight: '800', textAlign: 'center' },

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
  quizActions: { flexDirection: 'row', gap: 10 },

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
