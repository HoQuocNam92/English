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
  const [availableQuestions, setAvailableQuestions] = React.useState<QuestionItem[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = React.useState<string[]>([]);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [durationMinutes, setDurationMinutes] = React.useState('30');
  const [passingScorePercent, setPassingScorePercent] = React.useState('70');
  const [maxAttempts, setMaxAttempts] = React.useState('');
  const [domainId, setDomainId] = React.useState('');
  const [levelId, setLevelId] = React.useState('');
  const [topics, setTopics] = React.useState('');

  const [qSearch, setQSearch] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [globalError, setGlobalError] = React.useState('');

  React.useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [domainsRes, levelsRes, qRes] = await Promise.all<any>([
          apiClient.get<any>('/domains'),
          apiClient.get<any>('/levels'),
          apiClient.get<any>('/questions?limit=100'),
        ]);
        setDomains(domainsRes?.data ?? domainsRes ?? []);
        setLevels(levelsRes?.data ?? levelsRes ?? []);
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

  const filteredQuestions = availableQuestions.filter(q =>
    !qSearch || q.prompt.toLowerCase().includes(qSearch.toLowerCase())
  );

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
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-on-surface">Thông tin bài thi</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Tiêu đề <span className="text-error">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Cloud Fundamentals Quiz"
                className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
              />
              <FieldError msg={errors.title} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Mô tả ngắn về bài thi..."
                className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Domain & Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Lĩnh vực <span className="text-error">*</span></label>
                <select
                  value={domainId}
                  onChange={e => setDomainId(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
                >
                  <option value="">-- Chọn --</option>
                  {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <FieldError msg={errors.domainId} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Cấp độ <span className="text-error">*</span></label>
                <select
                  value={levelId}
                  onChange={e => setLevelId(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
                >
                  <option value="">-- Chọn --</option>
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <FieldError msg={errors.levelId} />
              </div>
            </div>

            {/* Duration & Pass score */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Thời gian (phút) <span className="text-error">*</span></label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  min={1} max={300}
                  className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
                />
                <FieldError msg={errors.durationMinutes} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Điểm đạt (%) <span className="text-error">*</span></label>
                <input
                  type="number"
                  value={passingScorePercent}
                  onChange={e => setPassingScorePercent(e.target.value)}
                  min={1} max={100}
                  className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
                />
                <FieldError msg={errors.passingScorePercent} />
              </div>
            </div>

            {/* Max attempts & Topics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Số lần thi tối đa</label>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={e => setMaxAttempts(e.target.value)}
                  min={1}
                  placeholder="Không giới hạn"
                  className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
                />
                <FieldError msg={errors.maxAttempts} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Topics</label>
                <input
                  type="text"
                  value={topics}
                  onChange={e => setTopics(e.target.value)}
                  placeholder="aws, networking"
                  className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Right: Question picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">Chọn câu hỏi</h3>
              <span className="text-xs text-on-surface-variant">Đã chọn: {selectedQuestionIds.length}</span>
            </div>

            <input
              type="text"
              value={qSearch}
              onChange={e => setQSearch(e.target.value)}
              placeholder="Tìm câu hỏi..."
              className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
            />
            <FieldError msg={errors.questions} />

            <div className="h-96 overflow-y-auto rounded-xl border border-outline-variant/40 divide-y divide-outline-variant/20">
              {filteredQuestions.length === 0 ? (
                <div className="p-6 text-center text-sm text-on-surface-variant">Không tìm thấy câu hỏi nào</div>
              ) : (
                filteredQuestions.map(q => {
                  const selected = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface-container/50 transition-colors ${selected ? 'bg-primary/5' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleQuestion(q.id)}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface line-clamp-2">{q.prompt}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-on-surface-variant">{q.domain?.name ?? '—'}</span>
                          <span className="text-xs text-on-surface-variant">•</span>
                          <span className="text-xs text-on-surface-variant">{q.level?.name ?? '—'}</span>
                          <span className="text-xs text-on-surface-variant">•</span>
                          <span className="text-xs text-on-surface-variant">{q.points} điểm</span>
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
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? (
              <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">save</span>
            )}
            {isEdit ? 'Lưu thay đổi' : 'Tạo bài thi'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

