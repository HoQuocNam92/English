'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function TechQuizListPage() {
  const router = useRouter();

  const [exams, setExams] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');

  // Modal warning state for unready exams
  const [warningExam, setWarningExam] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [examsRes, progressRes, lessonsRes, domainsRes]: any = await Promise.allSettled([
          apiClient.get('/exams?status=published&limit=100'),
          apiClient.get('/progress/me'),
          apiClient.get('/lessons?limit=100'),
          apiClient.get('/domains'),
        ]);

        const rawExams = examsRes.status === 'fulfilled' ? (examsRes.value?.data ?? examsRes.value ?? []) : [];
        setExams(Array.isArray(rawExams) ? rawExams : []);

        if (progressRes.status === 'fulfilled') {
          setProgressData(progressRes.value);
        }

        if (lessonsRes.status === 'fulfilled') {
          const lData = lessonsRes.value?.data ?? lessonsRes.value ?? [];
          setLessons(Array.isArray(lData) ? lData : []);
        }

        if (domainsRes.status === 'fulfilled') {
          const dData = domainsRes.value?.data ?? domainsRes.value ?? [];
          setDomains(Array.isArray(dData) ? dData : []);
        }
      } catch {
        setError('Không thể tải danh sách bài kiểm tra.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute readiness map for exams
  const examReadinessMap = useMemo(() => {
    const map = new Map<string, { isReady: boolean; readinessPercent: number; reason?: string }>();
    if (!exams.length) return map;

    const certProgressList = progressData?.certProgress || [];
    const lessonProgressList = (progressData?.progress || []).filter((p: any) => p.resourceType === 'lesson');
    const completedLessonIds = new Set(
      lessonProgressList
        .filter((p: any) => p.status === 'completed' || p.completionPercent >= 70)
        .map((p: any) => p.resourceId)
    );
    const overallPercent = Math.round(progressData?.summary?.overallCompletionPercent ?? 0);

    exams.forEach((exam: any) => {
      let readinessPercent = 0;
      let evaluated = false;

      // 1. Check certificate progress if exam belongs to a certificate
      if (exam.certificateId) {
        const certProg = certProgressList.find((cp: any) => cp.certificateId === exam.certificateId);
        if (certProg && typeof certProg.completionPercent === 'number') {
          readinessPercent = Math.round(certProg.completionPercent);
          evaluated = true;
        }
      }

      // 2. Check domain progress if not resolved via certificate
      if (!evaluated && exam.domainId) {
        const domainLessons = lessons.filter(
          (l: any) => l.domainId === exam.domainId || l.domain?.id === exam.domainId || l.domain?.code === exam.domain?.code
        );
        if (domainLessons.length > 0) {
          const completedCount = domainLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
          readinessPercent = Math.round((completedCount / domainLessons.length) * 100);
          evaluated = true;
        }
      }

      // 3. Fallback to overall lesson completion percent if neither domain nor cert has lessons
      if (!evaluated) {
        readinessPercent = overallPercent;
      }

      // If learner has high overall lesson progress, combine domain with overall so completed learners are never falsely blocked
      const effectivePercent = Math.max(readinessPercent, overallPercent);

      map.set(exam.id, {
        isReady: effectivePercent >= 70,
        readinessPercent: effectivePercent,
      });
    });

    return map;
  }, [exams, progressData, lessons]);

  // Extract distinct domains for filter dropdown
  const domainOptions = useMemo(() => {
    if (domains.length > 0) return domains;
    // Fallback: extract from exams
    const set = new Map<string, { id: string; name: string; code: string }>();
    exams.forEach((e: any) => {
      if (e.domain) set.set(e.domain.id, e.domain);
    });
    return Array.from(set.values());
  }, [domains, exams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam: any) => {
      // Keyword search
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        exam.title?.toLowerCase().includes(q) ||
        exam.description?.toLowerCase().includes(q) ||
        exam.domain?.name?.toLowerCase().includes(q);

      // Domain filter
      const matchDomain =
        selectedDomain === 'all' ||
        exam.domainId === selectedDomain ||
        exam.domain?.id === selectedDomain ||
        exam.domain?.code === selectedDomain;

      // Level filter
      const levelCode = (exam.level?.code ?? exam.level?.name ?? '').toLowerCase();
      let matchLevel = true;
      if (selectedLevel !== 'all') {
        if (selectedLevel === 'beginner') {
          matchLevel = /begin|basic|cơ/i.test(levelCode);
        } else if (selectedLevel === 'intermediate') {
          matchLevel = /inter|trung/i.test(levelCode);
        } else if (selectedLevel === 'advanced') {
          matchLevel = /adv|nâng/i.test(levelCode);
        }
      }

      return matchSearch && matchDomain && matchLevel;
    });
  }, [exams, search, selectedDomain, selectedLevel]);

  const handleStartExamClick = (exam: any) => {
    const readiness = examReadinessMap.get(exam.id);
    if (readiness && !readiness.isReady) {
      setWarningExam({ ...exam, readinessPercent: readiness.readinessPercent });
    } else {
      router.push(`/learn/quiz/${exam.id}`);
    }
  };

  const getLevelBadgeText = (exam: any) => {
    const code = (exam.level?.code ?? exam.level?.name ?? '').toLowerCase();
    if (/begin|basic|cơ/i.test(code)) return 'Beginner';
    if (/inter|trung/i.test(code)) return 'Intermediate';
    if (/adv|nâng/i.test(code)) return 'Advanced';
    return exam.level?.name || exam.domain?.name || 'Intermediate';
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;

  return (
    <LearnerShell>
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6 pb-12">
        {/* Header */}
        <header>
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-on-background mb-2">
            Thi thử & Kiểm tra
          </h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">
            Thực hành làm các bài thi trắc nghiệm chuyên ngành CNTT và kiểm tra năng lực chứng chỉ quốc tế.
          </p>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-surface-white p-4 rounded-xl border border-border-subtle shadow-xs">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
              style={{ fontSize: '20px' }}
            >
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài thi..."
              className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] text-on-surface font-medium placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters (Domain & Level) */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            {/* Domain filter */}
            <div className="relative flex-1 sm:w-56">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full appearance-none bg-surface-white border border-border-subtle rounded-lg pl-4 pr-10 py-2 text-[14px] text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer shadow-xs hover:border-outline-variant transition-colors"
              >
                <option value="all">Tất cả lĩnh vực</option>
                {domainOptions.map((dom: any) => (
                  <option key={dom.id} value={dom.id || dom.code}>
                    {dom.name}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                style={{ fontSize: '20px' }}
              >
                expand_more
              </span>
            </div>

            {/* Level filter */}
            <div className="relative flex-1 sm:w-44">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as LevelFilter)}
                className="w-full appearance-none bg-surface-white border border-border-subtle rounded-lg pl-4 pr-10 py-2 text-[14px] text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer shadow-xs hover:border-outline-variant transition-colors"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
              <span
                className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                style={{ fontSize: '20px' }}
              >
                expand_more
              </span>
            </div>

            {/* Reset button if filter is active */}
            {(search || selectedDomain !== 'all' || selectedLevel !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedDomain('all');
                  setSelectedLevel('all');
                }}
                className="px-3 py-2 text-[13px] font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>

        {error && <div className="text-red-500 text-[14px]">{error}</div>}

        {/* Exams Grid */}
        {!filteredExams.length && !error ? (
          <div className="text-center py-16 bg-surface-white border border-border-subtle rounded-2xl p-8">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3 block">
              filter_alt_off
            </span>
            <p className="text-[16px] font-semibold text-on-background">Không tìm thấy bài thi phù hợp</p>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Vui lòng thử tìm kiếm bằng từ khóa khác hoặc điều chỉnh lại bộ lọc.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedDomain('all');
                setSelectedLevel('all');
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary/90 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((exam: any) => {
              const readiness = examReadinessMap.get(exam.id) || { isReady: false, readinessPercent: 0 };
              const qCount = exam._count?.questions ?? (exam.questions?.length || 0);

              return (
                <div
                  key={exam.id}
                  className="bg-surface-white border border-border-subtle rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,24,0.08)] transition-all duration-200 group"
                >
                  {/* Top card metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">integration_instructions</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {/* Questions count badge */}
                      <span className="text-[11px] font-bold bg-tertiary-fixed text-tertiary px-2 py-0.5 rounded">
                        {qCount} CÂU
                      </span>

                      {/* Readiness status badge - Only show when ready, do not show yellow warning badge on card */}
                      {readiness.isReady && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Sẵn sàng thi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-[16px] font-semibold text-on-background group-hover:text-primary transition-colors line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-[12px] text-on-surface-variant mt-1 line-clamp-2">
                      {exam.description || 'Bài kiểm tra kỹ năng kỹ thuật chuyên sâu.'}
                    </p>
                  </div>

                  {/* Duration & Level info */}
                  <div className="flex items-center gap-3 text-[12px] text-on-surface-variant mt-auto">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {exam.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      {getLevelBadgeText(exam)}
                    </span>
                    {exam.domain?.name && (
                      <span className="flex items-center gap-1 ml-auto text-[11px] font-medium text-on-surface-variant/80 truncate max-w-[120px]">
                        {exam.domain.name}
                      </span>
                    )}
                  </div>

                  {/* Start Exam Button */}
                  <button
                    onClick={() => handleStartExamClick(exam)}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 text-white font-semibold text-[14px] py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    Bắt đầu kiểm tra
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warning Confirmation Modal (Non-blocking) */}
      {warningExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-subtle flex flex-col gap-5 relative">
            {/* Close button */}
            <button
              onClick={() => setWarningExam(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Modal Icon & Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">school</span>
              </div>
              <div className="pr-6">
                <h3 className="text-[18px] font-bold text-on-background leading-snug">
                  Khuyến nghị ôn tập trước khi thi
                </h3>
                <span className="text-[12px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                  Tiến độ liên quan: {warningExam.readinessPercent}% / 70%
                </span>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="space-y-1.5 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle">
              <div className="flex justify-between text-[12px]">
                <span className="font-semibold text-on-surface">Tiến độ bài học liên quan</span>
                <span className="font-bold text-amber-700">{warningExam.readinessPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(5, warningExam.readinessPercent))}%` }}
                />
              </div>
            </div>

            {/* Warning Message */}
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Bạn hiện chưa đạt mốc <strong>70%</strong> tiến độ các bài học thuộc chuyên đề bài thi{' '}
              <strong>"{warningExam.title}"</strong>. Chúng tôi khuyến nghị bạn nên ôn tập kỹ các bài học trước để làm
              quen với thuật ngữ và kiến thức thực tế.
            </p>

            {/* Action Buttons (Review vs Continue anyway - Never blocked!) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/learn/lessons${warningExam.domain?.code ? `?domain=${warningExam.domain.code}` : ''}`}
                className="flex-1 py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                Ôn tập bài học
              </Link>
              <button
                onClick={() => {
                  const targetId = warningExam.id;
                  setWarningExam(null);
                  router.push(`/learn/quiz/${targetId}`);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-indigo-700 text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer text-center"
              >
                Tiếp tục thi ngay
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </LearnerShell>
  );
}
