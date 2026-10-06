'use client';
import { AppIcon, IconText } from '@/shared/ui/AppIcon';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner, showToast } from '@/shared/ui';

type Rating = 'easy' | 'medium' | 'hard' | 'mastered';
type QuizQuestion = { type: 'fill_blank' | 'multiple_choice'; vocabularyId: string; prompt: string; hint?: string; options?: string[]; answer: string; explanation?: string; optionExplanations?: { option: string; correct: boolean; explanation: string }[] };

export default function FlashcardPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const onlyNeedsReview = searchParams?.get('onlyNeedsReview') === 'true';
  const domainCode = searchParams?.get('domainCode') ?? '';
  const sourceLessonId = searchParams?.get('sourceLessonId') ?? '';
  const topicId = searchParams?.get('topicId') ?? '';
  const certificateId = searchParams?.get('certificateId') ?? '';
  const reviewOnly = searchParams?.get('reviewOnly') === 'true';
  const returnUrl = certificateId ? `/learn/certifications/${certificateId}` : lessonId === 'review' ? '/learn/flashcards' : `/learn/flashcards/${lessonId}`;
  const savingRef = React.useRef(false);
  const [saving, setSaving] = useState(false);
  const levelCode = searchParams?.get('levelCode') ?? '';

  const [lesson, setLesson] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [quizFailed, setQuizFailed] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<boolean | null>(null);
  const [quizMarkedMastered, setQuizMarkedMastered] = useState(false);
  const [quizResponses, setQuizResponses] = useState<Record<number, { answer: string; correct: boolean; mastered: boolean }>>({});

  // Settings & modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [autoPronounce, setAutoPronounce] = useState(true);
  const [confirmStopModal, setConfirmStopModal] = useState(false);
  const [stopping, setStopping] = useState(false);

  // Tracking in current session
  const [skippedWords, setSkippedWords] = useState<any[]>([]);
  const [sessionResults, setSessionResults] = useState<{
    word: any;
    rating: Rating;
  }[]>([]);

  // Load practice words
  const loadPracticeSession = useCallback(async (filterOnlyNew: boolean, continueLearning = false) => {
    setLoading(true);
    setError('');
    setSessionResults([]); setSkippedWords([]); setQuizMode(false); setQuizFailed(false);
    try {
      if (lessonId === 'all') {
        const sessionParams = new URLSearchParams();
        sessionParams.set('onlyNew', String(filterOnlyNew));
        if (topicId) sessionParams.set('topicId', topicId);
        if (reviewOnly) sessionParams.set('reviewOnly', 'true');
        if (sourceLessonId) sessionParams.set('sourceLessonId', sourceLessonId);
        if (domainCode) sessionParams.set('domainCode', domainCode);
        if (levelCode) sessionParams.set('levelCode', levelCode);
        if (continueLearning) sessionParams.set('continue', 'true');
        const sessionUrl = `/vocab-study/session${sessionParams.toString() ? `?${sessionParams.toString()}` : ''}`;
        let res: any = await apiClient.get(sessionUrl);
        const initialMeta = res?.meta ?? null;
        if (!continueLearning && initialMeta?.dailyLimitReached && (res?.words?.length ?? 0) === 0) {
          sessionParams.set('continue', 'true');
          res = await apiClient.get(`/vocab-study/session?${sessionParams.toString()}`);
          res.meta = { ...(res?.meta ?? {}), ...initialMeta, dailyLimitReached: true };
        }
        const allWords = res?.words ?? [];
        const filtered = filterOnlyNew ? allWords.filter((w: any) => w.studyStatus === 'new') : allWords;
        setLesson({ id: 'all', title: topicId ? (reviewOnly ? 'Ôn tập từ vựng chứng chỉ đến hạn' : 'Học từ vựng theo chủ đề chứng chỉ') : sourceLessonId ? 'Từ vựng theo bài học trong lộ trình' : domainCode ? `Từ vựng ${domainCode}${levelCode ? ` · ${levelCode}` : ''}` : 'Toàn bộ từ vựng IT Chuyên ngành' });
        setWords(filtered);
        setSessionStats(res?.meta ?? null);
        setCurrentIdx(0);
        setIsFlipped(false);
        setIsFinished(false);
      } else if (lessonId === 'review') {
        const res: any = await apiClient.get('/vocab-study/session?reviewOnly=true&onlyNew=false');
        if (!res || !res.words) {
          setError('Không thể tải danh sách từ cần ôn tập.');
          return;
        }
        setLesson(res.lesson ?? { id: lessonId, title: lessonId === 'review' ? 'Ôn tập từ vựng đến hạn' : 'Từ vựng theo bài học' });
        setWords(res.words);
        setSessionStats(res.meta ?? null);
        setCurrentIdx(0);
        setIsFlipped(false);
        setIsFinished(false);
      } else {
        const queryParams = new URLSearchParams({ sourceLessonId: lessonId, onlyNew: String(filterOnlyNew && !onlyNeedsReview) });
        if (onlyNeedsReview) {
          queryParams.set('reviewOnly', 'true');
        } else if (filterOnlyNew) {
          queryParams.set('onlyNew', 'true');
        }
        if (continueLearning) queryParams.set('continue', 'true');
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        let res: any = await apiClient.get(`/vocab-study/session${queryString}`);
        const initialStats = res?.meta ?? null;
        if (!continueLearning && initialStats?.dailyLimitReached && (res?.words?.length ?? 0) === 0) {
          queryParams.set('continue', 'true');
          res = await apiClient.get(`/vocab-study/session?${queryParams.toString()}`);
          res.meta = { ...(res?.meta ?? {}), ...initialStats, dailyLimitReached: true };
        }
        if (!res || !res.words) {
          setError('Không thể tải bài học để luyện tập.');
          return;
        }
        setLesson(res.lesson ?? { id: lessonId, title: lessonId === 'review' ? 'Ôn tập từ vựng đến hạn' : 'Từ vựng theo bài học' });
        setWords(res.words);
        setSessionStats(res.meta ?? null);
        setCurrentIdx(0);
        setIsFlipped(false);
        setIsFinished(false);
        setQuizMode(false);
      }
    } catch {
      setError('Lỗi kết nối khi tải danh sách từ vựng.');
    } finally {
      setLoading(false);
    }
  }, [lessonId, onlyNeedsReview, domainCode, levelCode, sourceLessonId, topicId, reviewOnly]);

  useEffect(() => {
    if (lessonId) {
      loadPracticeSession(onlyNew);
    }
  }, [lessonId, onlyNew, loadPracticeSession]);

  const currentWord = words[currentIdx];

  const audioPlayer = React.useRef<HTMLAudioElement | null>(null);
  const audioRequest = React.useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const playPronunciation = useCallback(async () => {
    if (!currentWord) return;
    const request = ++audioRequest.current;
    audioPlayer.current?.pause();
    setSpeaking(true);
    try {
      let source = currentWord.audioUrl;
      if (!source) {
        const data = await apiClient.post<{ audio: string; mimeType: string }>('/translation/pronunciation', { text: currentWord.term });
        source = `data:${data.mimeType};base64,${data.audio}`;
      }
      if (request !== audioRequest.current) return;
      const player = new Audio(source);
      audioPlayer.current = player;
      player.onended = () => { if (request === audioRequest.current) setSpeaking(false); };
      player.onerror = () => { if (request === audioRequest.current) { setSpeaking(false); showToast('Không phát được âm thanh. Hãy thử lại.', 'error'); } };
      await player.play();
    } catch {
      if (request === audioRequest.current) { setSpeaking(false); showToast('Chưa phát được âm thanh. Hãy bấm nút nghe để thử lại.', 'error'); }
    }
  }, [currentWord]);

  useEffect(() => {
    setSpeaking(false);
    if (currentWord && autoPronounce && !isFinished && !quizMode) void playPronunciation();
    return () => { audioRequest.current++; audioPlayer.current?.pause(); };
  }, [currentWord, autoPronounce, isFinished, quizMode, playPronunciation]);

  const pronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!speaking) void playPronunciation();
  };

  const startQuiz = async (results: { word: any; rating: Rating }[]) => {
    setQuizFailed(false);
    const included = results.filter(item => item.rating !== 'mastered');
    if (included.length === 0) { setIsFinished(true); showToast('Bạn đã hoàn thành phiên luyện từ vựng.', 'success', 'Hoàn thành'); return; }
    try {
      const response: any = await apiClient.post('/vocab-study/quiz', { vocabIds: [...new Set(included.map(item => item.word.id))] });
      if (!response?.questions?.length) {
        setIsFinished(true); setQuizMode(false);
        showToast('Tiến độ học đã lưu. Các từ này chưa có câu hỏi ngắn phù hợp để kiểm tra.', 'info');
        return;
      }
      setQuizQuestions(response.questions);
      setQuizResponses({});
      setQuizIndex(0); setQuizAnswer(''); setQuizCorrect(0); setQuizFeedback(null); setQuizMarkedMastered(false); setQuizMode(true);
    } catch {
      showToast('Không thể tạo bài kiểm tra từ vựng. Tiến độ học đã lưu; hãy thử lại.', 'error');
      setQuizFailed(true);
    }
  };

  // Submit Rating
  const handleRate = async (rating: Rating) => {
    if (!currentWord) return;

    if (savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      await apiClient.post('/vocab-study/rate', { vocabularyId: currentWord.id, rating });
      const nextResults = [...sessionResults, { word: currentWord, rating }];
      setSessionResults(nextResults);
      if (rating === 'mastered') setSkippedWords(prev => [...prev, currentWord]);
      if (currentIdx + 1 < words.length) { setCurrentIdx(currentIdx + 1); setIsFlipped(false); }
      else await startQuiz(nextResults);
    } catch {
      showToast('Chưa lưu được tiến độ. Vui lòng thử lại.', 'error');
    } finally { savingRef.current = false; setSaving(false); }
  };

  const submitQuizAnswer = async (submittedAnswer?: string) => {
    const question = quizQuestions[quizIndex];
    const answer = submittedAnswer ?? quizAnswer;
    if (!question || quizFeedback !== null || !answer.trim()) return;
    if (submittedAnswer !== undefined) setQuizAnswer(submittedAnswer);
    const correct = answer.trim().toLocaleLowerCase('vi') === question.answer.trim().toLocaleLowerCase('vi');
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      await apiClient.post('/vocab-study/answer', { vocabularyId: question.vocabularyId, isCorrect: correct });
      setQuizFeedback(correct);
      setQuizResponses(previous => ({ ...previous, [quizIndex]: { answer, correct, mastered: false } }));
      if (correct) {
        setQuizCorrect(value => value + 1);
      } else {
        setQuizQuestions(previous => [...previous, question]);
      }
    } catch { showToast('Chưa lưu được kết quả. Vui lòng thử lại.', 'error'); }
    finally { savingRef.current = false; setSaving(false); }
  };

  const goToQuizQuestion = (index: number) => {
    const saved = quizResponses[index];
    setQuizIndex(index); setQuizAnswer(saved?.answer ?? ''); setQuizFeedback(saved?.correct ?? null); setQuizMarkedMastered(saved?.mastered ?? false);
  };

  const nextQuizQuestion = () => {
    if (quizIndex + 1 >= quizQuestions.length) { setQuizMode(false); setIsFinished(true); showToast('Bạn đã hoàn thành phiên luyện từ vựng.', 'success', 'Hoàn thành'); return; }
    goToQuizQuestion(quizIndex + 1);
  };

  const markQuizWordMastered = async () => {
    const question = quizQuestions[quizIndex];
    if (!question || quizFeedback !== null) return;
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      await apiClient.post('/vocab-study/rate', { vocabularyId: question.vocabularyId, rating: 'mastered' });
      setQuizMarkedMastered(true); setQuizFeedback(true);
      setQuizResponses(previous => ({ ...previous, [quizIndex]: { answer: '', correct: true, mastered: true } }));
      setQuizQuestions(previous => previous.filter((item, index) => index <= quizIndex || item.vocabularyId !== question.vocabularyId));
    } catch { showToast('Chưa lưu được tiến độ. Vui lòng thử lại.', 'error'); }
    finally { savingRef.current = false; setSaving(false); }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizMode || quizFailed || isFinished || loading || !currentWord) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === '1') {
        handleRate('easy');
      } else if (e.key === '2') {
        handleRate('medium');
      } else if (e.key === '3') {
        handleRate('hard');
      } else if (e.key === '4') {
        handleRate('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, isFinished, loading, quizMode, quizFailed, isFlipped, sessionResults, currentIdx, words]);

  // Stop studying list
  const handleStopStudying = async () => {
    setConfirmStopModal(false);
    router.push('/learn/flashcards');
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || words.length === 0) {
    return (
      <LearnerShell>
        <div className="p-12 text-center text-slate-500 space-y-4 max-w-lg mx-auto">
          <AppIcon className=" text-5xl text-slate-300">task_alt</AppIcon>
          <h2 className="text-xl font-bold text-slate-800">
            {error || (lessonId === 'review' ? 'Hiện tại không có từ nào cần ôn tập!' : 'Không còn từ mới trong bộ này!')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {lessonId === 'review'
              ? 'Tuyệt vời! Bạn đã hoàn thành các từ đến hạn. Khi các từ khác đến chu kỳ ôn tập (SRS), hệ thống sẽ tự động nhắc nhở bạn.'
              : 'Bạn đã thuộc hết các từ trong bài hoặc không có từ mới nào theo bộ lọc.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {onlyNew && (
              <button
                onClick={() => setOnlyNew(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
              >
                Ôn lại toàn bộ bài
              </button>
            )}
            <Link
              href={returnUrl}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
            >
              {lessonId === 'review' ? 'Về trang Flashcards' : 'Về bài học'}
            </Link>
          </div>
        </div>
      </LearnerShell>
    );
  }

  if (quizFailed) return <LearnerShell><div className="mx-auto max-w-xl space-y-4 px-4 py-10 text-center"><p>Tiến độ học đã lưu. Chưa tải được Quiz sau phiên học.</p><button disabled={saving} onClick={() => void startQuiz(sessionResults)} className="rounded-xl bg-primary px-4 py-3 text-white">Thử tải Quiz lại</button><Link href={returnUrl} className="block text-primary">Về bài học</Link></div></LearnerShell>;

  if (quizMode && quizQuestions.length > 0) {
    const question = quizQuestions[quizIndex];
    return <LearnerShell><div className="w-full space-y-5 py-10"><Link href={returnUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">← Quay lại bài học</Link>
      <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-slate-900">Kiểm tra từ vựng</h1></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <p className="mb-5 text-lg font-bold text-slate-900">{question.prompt}</p>
        {question.type === 'multiple_choice' ? <div className="grid gap-3">{question.options?.map(option => {
          const answered = quizFeedback !== null && !quizMarkedMastered;
          const correct = answered && option === question.answer;
          const wrong = answered && option === quizAnswer && !correct;
          return <button key={option} type="button" disabled={saving || quizFeedback !== null} onClick={() => void submitQuizAnswer(option)} className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left text-sm font-semibold transition-colors ${correct ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : wrong ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-900 hover:border-primary/40'}`}><span>{option}</span>{correct && <span className="shrink-0 text-xs">✓ Đúng</span>}{wrong && <span className="shrink-0 text-xs">✕ Bạn chọn</span>}</button>;
        })}</div> : <input autoFocus value={quizAnswer} disabled={saving || quizFeedback !== null} onChange={event => setQuizAnswer(event.target.value)} onKeyDown={event => event.key === 'Enter' && void submitQuizAnswer()} placeholder="Điền từ còn thiếu..." className={`w-full rounded-xl border px-4 py-3 text-base outline-none focus:border-primary ${quizFeedback === null ? 'border-slate-300' : quizFeedback ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`} />}
        {quizFeedback !== null && <p role="status" className={`mt-4 text-sm font-semibold ${quizFeedback ? 'text-emerald-700' : 'text-rose-700'}`}>{quizMarkedMastered ? 'Đã đánh dấu là đã biết.' : quizFeedback ? 'Chính xác!' : 'Chưa đúng. Đáp án đúng đã được tô xanh.'}</p>}
        {quizFeedback !== null && !quizMarkedMastered && <details key={quizIndex} className="mt-4 rounded-xl border border-slate-200 text-sm"><summary className="cursor-pointer px-4 py-3 font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary">Xem chi tiết</summary><div className="border-t border-slate-100 px-4 py-3 leading-6 text-slate-700">{question.type === 'fill_blank' && <p className="font-semibold text-emerald-700">Đáp án đúng: {question.answer}</p>}<p>{!quizFeedback ? question.optionExplanations?.find(item => item.option === quizAnswer)?.explanation ?? question.explanation : question.explanation ?? 'Bạn đã chọn đúng nghĩa của từ.'}</p></div></details>}

      </div>
      <div className="flex items-center gap-3">
        <button type="button" disabled={saving || quizIndex === 0} onClick={() => goToQuizQuestion(quizIndex - 1)} className="rounded-xl border border-primary px-5 py-3 text-sm font-bold text-primary disabled:opacity-40">Trước đó</button>
        <button type="button" disabled={saving || quizFeedback === null} onClick={nextQuizQuestion} className="ml-auto rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{quizIndex + 1 >= quizQuestions.length ? 'Hoàn thành' : 'Tiếp tục'}</button>
      </div>
      {quizFeedback === null && <div className={`grid gap-3 ${question.type === 'fill_blank' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>{question.type === 'fill_blank' && <button type="button" onClick={() => void submitQuizAnswer()} disabled={saving || !quizAnswer.trim()} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50">Kiểm tra đáp án</button>}<button type="button" onClick={markQuizWordMastered} disabled={saving} className="w-full rounded-xl border border-primary py-3 text-sm font-bold text-primary">Đã biết</button></div>}
    </div></LearnerShell>;
  }

  // Summary View
  if (isFinished) {
    const totalRated = sessionResults.length;
    const masteredCount = sessionResults.filter(r => r.rating === 'mastered' || r.rating === 'easy').length;
    const hardCount = sessionResults.filter(r => r.rating === 'hard').length;

    return (
      <LearnerShell>
        <div className="w-full py-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-xs">
              <IconText>{"\n              🎉\n            "}</IconText></div>
            <h1 className="text-2xl font-black text-slate-900">
              Hoàn thành phiên luyện tập!
            </h1>
            <p className="text-xs text-slate-500">
              Bạn đã ôn qua {totalRated} lượt từ vựng trong phiên học này.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-slate-900">{totalRated}</div>
              <div className="text-[11px] font-bold text-slate-400 mt-0.5">Tổng lượt ôn</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{masteredCount}</div>
              <div className="text-[11px] font-bold text-emerald-700 mt-0.5">Dễ / Đã biết</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-amber-600">{hardCount}</div>
              <div className="text-[11px] font-bold text-amber-700 mt-0.5">Từ khó cần ôn</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSessionResults([]);
                loadPracticeSession(onlyNew, true);
              }}
              className="flex-1 py-3.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <AppIcon className=" text-base">replay</AppIcon>
              Học thêm từ mới
            </button>
            <Link
              href={returnUrl}
              className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors text-center"
            >
              {certificateId ? 'Về chứng chỉ' : lessonId === 'review' ? 'Về trang Flashcards' : 'Về danh sách từ'}
            </Link>
          </div>
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell>
      <div className="w-full py-6 space-y-5">
        {/* Header Title */}
        <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
          Luyện tập: {lesson?.title || 'Từ vựng'}
        </h1>

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 pt-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href={returnUrl}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              &lt;&lt; {lessonId === 'review' ? 'Danh mục Flashcards' : 'Xem tất cả'}
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <AppIcon className=" text-sm">settings</AppIcon>
              Cài đặt
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowSkippedModal(true)}
              className="hover:text-primary transition-colors"
            >
              Các từ đã bỏ qua ({skippedWords.length})
            </button>
            {lessonId !== 'review' && (
              <>
                <span>·</span>
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={onlyNew}
                    onChange={e => setOnlyNew(e.target.checked)}
                    className="w-3.5 h-3.5 text-primary rounded-xs border-slate-300 focus:ring-primary"
                  />
                  <span>Chỉ ôn từ mới</span>
                </label>
              </>
            )}
          </div>

          {lessonId !== 'review' && lessonId !== 'all' && (
            <button
              type="button"
              onClick={() => setConfirmStopModal(true)}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 transition-colors"
            >
              <AppIcon className=" text-sm">archive</AppIcon>
              <span>Dừng học list từ này</span>
            </button>
          )}
        </div>

        {sessionStats?.studiedToday >= 20 && <div className="ml-auto w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800"><IconText>{"✓ Đã đủ mục tiêu hôm nay · đang học thêm"}</IconText></div>}

        {/* Card Progress Indicator */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-1">
          <span>Thẻ {currentIdx + 1} / {words.length}</span>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* FLASHCARD (3D FLIP CONTAINER) */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div className="h-[360px] sm:h-[400px] w-full [perspective:1200px]">
          <div
            className="relative h-full w-full [transform-style:preserve-3d] transition-transform duration-500 ease-out"
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* FRONT SIDE */}
            <div
              className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Top Tag: "Từ mới" or "Cần ôn tập" */}
              <div className="flex justify-end">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    currentWord.isMastered
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : currentWord.isNeedsReview
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {currentWord.isMastered ? 'Đã nhớ' : currentWord.isNeedsReview ? 'Cần ôn tập' : 'Từ mới'}
                </span>
              </div>

              {/* Center Content */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto">
                <div className="flex items-center gap-3">
                  <h2 data-learning-content className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {currentWord.term}
                  </h2>
                  <button
                    type="button"
                    onClick={pronounce} disabled={speaking} aria-label={speaking ? 'Đang phát âm' : 'Nghe phát âm'}
                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  >
                    <AppIcon className=" text-xl">volume_up</AppIcon>
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  {[currentWord.partOfSpeech && `(${currentWord.partOfSpeech})`, currentWord.pronunciationIpa && `/${currentWord.pronunciationIpa}/`].filter(Boolean).join(' ')}
                </p>
              </div>

              {/* Bottom Flip Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                >
                  <AppIcon className=" text-base">sync</AppIcon>
                  Xem nghĩa
                </button>
              </div>
            </div>

            {/* BACK SIDE */}
            <div
              className="absolute inset-0 flex flex-col justify-between overflow-y-auto rounded-3xl border border-indigo-200 bg-white p-6 sm:p-8 shadow-xs"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 data-learning-content className="text-2xl font-black text-slate-900">{currentWord.term}</h3>
                  <button
                    type="button"
                    onClick={pronounce} disabled={speaking} aria-label={speaking ? 'Đang phát âm' : 'Nghe phát âm'}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <AppIcon className=" text-base">volume_up</AppIcon>
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mặt sau
                </span>
              </div>

              {/* Content Body */}
              <div className="space-y-4 my-auto py-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Định nghĩa:
                  </div>
                  <div data-learning-content className="text-base font-bold text-slate-900 mt-1">
                    {currentWord.definitionVi || 'Chưa có định nghĩa tiếng Việt'}
                  </div>
                  {currentWord.definitionEn && (
                    <div data-learning-content className="text-xs text-slate-500 mt-0.5">
                      {currentWord.definitionEn}
                    </div>
                  )}
                </div>

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-slate-800 space-y-1">
                    <div className="font-bold text-primary text-xs">
                      Ví dụ
                    </div>
                    <p data-learning-content className="text-sm font-normal leading-6">{currentWord.examples[0].sentenceEn.split(new RegExp(`(${currentWord.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part: string, index: number) => part.toLowerCase() === currentWord.term.toLowerCase() ? <strong key={index} className="font-bold text-primary">{part}</strong> : <React.Fragment key={index}>{part}</React.Fragment>)}</p>
                    {currentWord.examples[0].translationVi && (
                      <p data-learning-content className="text-slate-600 italic">{currentWord.examples[0].translationVi}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Flip Back Button */}
              <div className="flex justify-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <AppIcon className=" text-base">sync</AppIcon>
                  Lật lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* 4 RATING BUTTONS BAR */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {/* Dễ */}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleRate('easy')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors group"
            >
              <AppIcon className=" text-2xl group-hover:scale-110 transition-transform">
                sentiment_satisfied
              </AppIcon>
              <span className="text-xs font-bold mt-1">Dễ</span>
            </button>

            {/* Trung bình */}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleRate('medium')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors group"
            >
              <AppIcon className=" text-2xl group-hover:scale-110 transition-transform">
                sentiment_neutral
              </AppIcon>
              <span className="text-xs font-bold mt-1">Trung bình</span>
            </button>

            {/* Khó */}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleRate('hard')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors group"
            >
              <AppIcon className=" text-2xl group-hover:scale-110 transition-transform">
                sentiment_dissatisfied
              </AppIcon>
              <span className="text-xs font-bold mt-1">Khó</span>
            </button>

            {/* Đã biết, loại khỏi danh sách ôn tập */}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleRate('mastered')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors group text-center"
            >
              <AppIcon className=" text-2xl text-slate-400 group-hover:scale-110 group-hover:text-primary transition-transform">
                fast_forward
              </AppIcon>
              <span className="text-[11px] font-bold leading-tight mt-1 text-slate-600 line-clamp-2">
                Đã biết, loại khỏi danh sách ôn tập
              </span>
            </button>
          </div>
        </div>

        {/* Modal: Settings */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-[420px] w-full p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">Cài đặt luyện tập</h3>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-slate-700 font-semibold">Tự động phát âm khi qua từ mới</span>
                  <input
                    type="checkbox"
                    checked={autoPronounce}
                    onChange={e => setAutoPronounce(e.target.checked)}
                    className="w-4 h-4 text-primary rounded-xs"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold mt-4"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Modal: Skipped Words */}
        {showSkippedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-[500px] w-full p-6 space-y-4 shadow-xl max-h-[80vh] flex flex-col">
              <h3 className="text-base font-bold text-slate-900">
                Từ đã đánh dấu &quot;Đã biết&quot; ({skippedWords.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100">
                {skippedWords.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">Chưa có từ nào bị bỏ qua trong phiên này.</p>
                ) : (
                  skippedWords.map((w, idx) => (
                    <div key={idx} className="pt-2 flex justify-between items-center">
                      <span className="font-bold text-slate-800">{w.term}</span>
                      <span className="text-slate-500">{w.definitionVi}</span>
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSkippedModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Modal: Confirm Stop Studying */}
        {confirmStopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-[480px] w-full p-6 space-y-5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AppIcon className=" text-2xl">archive</AppIcon>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Dừng học list từ này?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bài học sẽ được gỡ khỏi danh sách <strong>&quot;Đang học&quot;</strong> trên Dashboard. Toàn bộ tiến độ và từ vựng bạn đã nhớ vẫn được bảo lưu.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmStopModal(false)}
                  disabled={stopping}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleStopStudying}
                  disabled={stopping}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  {stopping ? 'Đang xử lý...' : 'Dừng học'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
