'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { QuestionItem } from '@/shared/api/api-client';

interface SelectOption { id: string; code: string; name: string }

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-error">{msg}</p>;
}

export default function TestBuilderPage() {
  const router = useRouter();
  const params = useSearchParams();
  const examId = params.get('id');
  const isEdit = !!examId;

  const [domains, setDomains] = React.useState<SelectOption[]>([]);
  const [levels, setLevels] = React.useState<SelectOption[]>([]);
  const [certificates, setCertificates] = React.useState<SelectOption[]>([]);
  const [availableQuestions, setAvailableQuestions] = React.useState<QuestionItem[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = React.useState<string[]>([]);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [durationMinutes, setDurationMinutes] = React.useState('30');
  const [passingScorePercent, setPassingScorePercent] = React.useState('70');
  const [maxAttempts, setMaxAttempts] = React.useState('');
  const [domainId, setDomainId] = React.useState('');
  const [levelId, setLevelId] = React.useState('');
  const [certificateId, setCertificateId] = React.useState('');
  const [topics, setTopics] = React.useState('');

  const [qSearch, setQSearch] = React.useState('');
  const [qFilterDomain, setQFilterDomain] = React.useState('');
  const [qFilterLevel, setQFilterLevel] = React.useState('');
  const [qOnlySelected, setQOnlySelected] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [globalError, setGlobalError] = React.useState('');

  React.useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [domainsRes, levelsRes, certificatesRes, qRes] = await Promise.all<any>([
          apiClient.get<any>('/domains'),
          apiClient.get<any>('/levels'),
          apiClient.get<any>('/certificates'),
          apiClient.get<any>('/questions?limit=100'),
        ]);
        setDomains(domainsRes?.data ?? domainsRes ?? []);
        setLevels(levelsRes?.data ?? levelsRes ?? []);
        setCertificates(certificatesRes?.data ?? certificatesRes ?? []);
        setAvailableQuestions(qRes?.data ?? qRes ?? []);

        if (isEdit) {
          const exam = await apiClient.get<any>(`/exams/${examId}`);
          setTitle(exam.title ?? '');
          setDescription(exam.description ?? '');
          setDurationMinutes(String(exam.durationMinutes ?? 30));
          setPassingScorePercent(String(exam.passingScorePercent ?? 70));
          setMaxAttempts(exam.maxAttempts ? String(exam.maxAttempts) : '');
          setDomainId(exam.domainId ?? '');
          setLevelId(exam.levelId ?? '');
          setCertificateId(exam.certificateId ?? '');
          setTopics((exam.topics ?? []).join(', '));
          setSelectedQuestionIds((exam.questions ?? []).map((q: any) => q.id ?? q.questionId));
        }
      } catch (e) {
        setGlobalError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [isEdit, examId]);

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Tiêu đề bài thi không được để trống';
    else if (title.trim().length > 200) errs.title = 'Tiêu đề tối đa 200 ký tự';
    if (!domainId) errs.domainId = 'Vui lòng chọn lĩnh vực';
    if (!levelId) errs.levelId = 'Vui lòng chọn cấp độ';
    const dur = Number(durationMinutes);
    if (isNaN(dur) || dur < 1 || dur > 300) errs.durationMinutes = 'Thời gian phải từ 1 đến 300 phút';
    const pass = Number(passingScorePercent);
    if (isNaN(pass) || pass < 1 || pass > 100) errs.passingScorePercent = 'Điểm đạt phải từ 1 đến 100%';
    if (maxAttempts && (isNaN(Number(maxAttempts)) || Number(maxAttempts) < 1)) {
      errs.maxAttempts = 'Số lần thi phải ≥ 1';
    }
    if (selectedQuestionIds.length === 0) errs.questions = 'Bài thi phải có ít nhất 1 câu hỏi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setGlobalError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes: Number(durationMinutes),
        passingScorePercent: Number(passingScorePercent),
        maxAttempts: maxAttempts ? Number(maxAttempts) : undefined,
        domainId: domainId || undefined,
        levelId: levelId || undefined,
        certificateId: certificateId || undefined,
        topics: topics.trim() ? topics.split(',').map(t => t.trim()).filter(Boolean) : [],
        questions: selectedQuestionIds.map((id, idx) => ({ questionId: id, order: idx + 1 })),
      };

      if (isEdit) {
        await apiClient.patch(`/exams/${examId}`, payload);
      } else {
        await apiClient.post('/exams', payload);
      }
      router.push('/admin/tests');
    } catch (e) {
      setGlobalError(e instanceof ApiClientError ? e.message : 'Lỗi khi lưu bài thi');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = React.useMemo(() => {
    return availableQuestions.filter(q => {
      if (qOnlySelected && !selectedQuestionIds.includes(q.id)) return false;
      if (qFilterDomain) {
        const domainObj = domains.find(d => d.id === qFilterDomain);
        const matchDomain =
          (q as any).domainId === qFilterDomain ||
          (q.domain as any)?.id === qFilterDomain ||
          (domainObj && q.domain?.code === domainObj.code) ||
          (domainObj && q.domain?.name === domainObj.name);
        if (!matchDomain) return false;
      }
      if (qFilterLevel) {
        const levelObj = levels.find(l => l.id === qFilterLevel);
        const matchLevel =
          (q as any).levelId === qFilterLevel ||
          (q.level as any)?.id === qFilterLevel ||
          (levelObj && q.level?.code === levelObj.code) ||
          (levelObj && q.level?.name === levelObj.name);
        if (!matchLevel) return false;
      }
      if (qSearch.trim() && !q.prompt.toLowerCase().includes(qSearch.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [availableQuestions, selectedQuestionIds, qOnlySelected, qFilterDomain, qFilterLevel, qSearch, domains, levels]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map(q => q.id);
    setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleDeselectFiltered = () => {
    const filteredIdSet = new Set(filteredQuestions.map(q => q.id));
    setSelectedQuestionIds(prev => prev.filter(id => !filteredIdSet.has(id)));
  };

  const handleResetFilters = () => {
    setQSearch('');
    setQFilterDomain('');
    setQFilterLevel('');
    setQOnlySelected(false);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'} description="Xây dựng cấu trúc bài thi" />
        <div className="mt-6 flex items-center justify-center h-64">
          <span className="animate-spin material-symbols-outlined text-primary">progress_activity</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
        description="Cấu hình thông tin và chọn câu hỏi cho bài thi"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {globalError && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex gap-2 items-center">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {globalError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Exam info */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 lg:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <span className="material-symbols-outlined text-primary text-[22px]">description</span>
              <h3 className="text-base font-bold text-slate-900">Thông tin bài thi</h3>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Tiêu đề <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Ví dụ: Cloud Fundamentals Quiz"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
              <FieldError msg={errors.title} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Mô tả</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Mô tả ngắn gọn về nội dung và mục tiêu bài thi..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none transition-all"
              />
            </div>

            {/* Domain & Level */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Lĩnh vực <span className="text-error">*</span>
                </label>
                <select
                  value={domainId}
                  onChange={e => setDomainId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="">-- Chọn lĩnh vực --</option>
                  {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <FieldError msg={errors.domainId} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Cấp độ <span className="text-error">*</span>
                </label>
                <select
                  value={levelId}
                  onChange={e => setLevelId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="">-- Chọn cấp độ --</option>
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <FieldError msg={errors.levelId} />
              </div>
            </div>

            {/* Certificate */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Chứng chỉ liên quan</label>
              <select
                value={certificateId}
                onChange={e => setCertificateId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              >
                <option value="">Không gắn chứng chỉ</option>
                {certificates.map(cert => <option key={cert.id} value={cert.id}>{cert.name}</option>)}
              </select>
            </div>

            {/* Duration & Pass score */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Thời gian (phút) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  min={1} max={300}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <FieldError msg={errors.durationMinutes} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Điểm đạt (%) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={passingScorePercent}
                  onChange={e => setPassingScorePercent(e.target.value)}
                  min={1} max={100}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <FieldError msg={errors.passingScorePercent} />
              </div>
            </div>

            {/* Max attempts & Topics */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Số lần thi tối đa</label>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={e => setMaxAttempts(e.target.value)}
                  min={1}
                  placeholder="Không giới hạn"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <FieldError msg={errors.maxAttempts} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Topics</label>
                <input
                  type="text"
                  value={topics}
                  onChange={e => setTopics(e.target.value)}
                  placeholder="aws, networking..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right: Question picker */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 lg:p-7 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">quiz</span>
                <h3 className="text-base font-bold text-slate-900">Chọn câu hỏi</h3>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                Đã chọn: {selectedQuestionIds.length} câu
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={qSearch}
                onChange={e => setQSearch(e.target.value)}
                placeholder="Tìm kiếm nội dung câu hỏi..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-9 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
              {qSearch && (
                <button
                  type="button"
                  onClick={() => setQSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[16px] block">close</span>
                </button>
              )}
            </div>

            {/* Filter Dropdowns: Domain & Level */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <select
                  value={qFilterDomain}
                  onChange={e => setQFilterDomain(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="">Tất cả lĩnh vực</option>
                  {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <select
                  value={qFilterLevel}
                  onChange={e => setQFilterLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="">Tất cả cấp độ</option>
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            {/* View Tabs & Batch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setQOnlySelected(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    !qOnlySelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({availableQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQOnlySelected(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    qOnlySelected
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã chọn ({selectedQuestionIds.length})
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  disabled={filteredQuestions.length === 0}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={handleDeselectFiltered}
                  disabled={filteredQuestions.length === 0}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-error disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <FieldError msg={errors.questions} />

            {/* Questions List */}
            <div className="h-[430px] overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-2xs">
              {filteredQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <span className="material-symbols-outlined text-[24px]">search_off</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Không tìm thấy câu hỏi phù hợp</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc lĩnh vực, cấp độ.
                  </p>
                  {(qSearch || qFilterDomain || qFilterLevel || qOnlySelected) && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                      Đặt lại bộ lọc
                    </button>
                  )}
                </div>
              ) : (
                filteredQuestions.map(q => {
                  const selected = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3.5 px-4 py-3.5 cursor-pointer transition-all border-l-4 ${
                        selected
                          ? 'bg-primary/5 border-l-primary hover:bg-primary/10'
                          : 'border-l-transparent hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleQuestion(q.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary accent-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug line-clamp-2 ${selected ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                          {q.prompt}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                            {q.domain?.name ?? 'Chưa phân loại'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                            {q.level?.name ?? 'Mọi cấp độ'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700">
                            {q.points} điểm
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {isEdit ? 'Lưu thay đổi' : 'Tạo bài thi'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

