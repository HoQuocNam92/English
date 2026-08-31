'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface SelectOption { id: string; code: string; name: string }

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-error">{msg}</p>;
}

interface OptionState {
  key: string;      // A, B, C, D
  text: string;
  isCorrect: boolean;
  explanation: string;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export default function QuestionEditorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const questionId = params.get('id');
  const isEdit = !!questionId;

  const [domains, setDomains] = React.useState<SelectOption[]>([]);
  const [levels, setLevels] = React.useState<SelectOption[]>([]);

  const [type, setType] = React.useState('multiple_choice');
  const [prompt, setPrompt] = React.useState('');
  const [context, setContext] = React.useState('');
  const [explanation, setExplanation] = React.useState('');
  const [points, setPoints] = React.useState('1');
  const [domainId, setDomainId] = React.useState('');
  const [levelId, setLevelId] = React.useState('');
  const [topics, setTopics] = React.useState('');
  const [options, setOptions] = React.useState<OptionState[]>([
    { key: 'A', text: '', isCorrect: false, explanation: '' },
    { key: 'B', text: '', isCorrect: false, explanation: '' },
    { key: 'C', text: '', isCorrect: false, explanation: '' },
    { key: 'D', text: '', isCorrect: false, explanation: '' },
  ]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [globalError, setGlobalError] = React.useState('');

  React.useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [domainsRes, levelsRes] = await Promise.all<any>([
          apiClient.get<any>('/domains'),
          apiClient.get<any>('/levels'),
        ]);
        setDomains(domainsRes?.data ?? domainsRes ?? []);
        setLevels(levelsRes?.data ?? levelsRes ?? []);

        if (isEdit) {
          const q = await apiClient.get<any>(`/questions/${questionId}`);
          setType(q.type ?? 'multiple_choice');
          setPrompt(q.prompt ?? '');
          setContext(q.context ?? '');
          setExplanation(q.explanation ?? '');
          setPoints(String(q.points ?? 1));
          setDomainId(q.domainId ?? '');
          setLevelId(q.levelId ?? '');
          setTopics((q.topics ?? []).join(', '));
          if (q.options?.length) {
            setOptions(q.options.map((o: any) => ({
              key: o.key,
              text: o.text,
              isCorrect: o.isCorrect,
              explanation: o.explanation ?? '',
            })));
          }
        }
      } catch (e) {
        setGlobalError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [isEdit, questionId]);

  const updateOption = (idx: number, field: keyof OptionState, val: string | boolean) => {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, [field]: val } : o));
  };

  const toggleCorrect = (idx: number) => {
    setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!prompt.trim()) errs.prompt = 'Nội dung câu hỏi không được để trống';
    else if (prompt.trim().length > 1000) errs.prompt = 'Câu hỏi tối đa 1000 ký tự';
    if (!domainId) errs.domainId = 'Vui lòng chọn lĩnh vực';
    if (!levelId) errs.levelId = 'Vui lòng chọn cấp độ';
    if (options.some(o => !o.text.trim())) errs.options = 'Tất cả các đáp án phải có nội dung';
    if (!options.some(o => o.isCorrect)) errs.options = 'Phải chọn ít nhất 1 đáp án đúng';
    const pts = Number(points);
    if (isNaN(pts) || pts < 1 || pts > 100) errs.points = 'Điểm phải từ 1 đến 100';
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
        type,
        prompt: prompt.trim(),
        context: context.trim() || undefined,
        explanation: explanation.trim() || undefined,
        points: Number(points),
        domainId: domainId || undefined,
        levelId: levelId || undefined,
        topics: topics.trim() ? topics.split(',').map(t => t.trim()).filter(Boolean) : [],
        options: options.map(o => ({
          key: o.key,
          text: o.text.trim(),
          isCorrect: o.isCorrect,
          explanation: o.explanation.trim() || undefined,
        })),
      };

      if (isEdit) {
        await apiClient.patch(`/questions/${questionId}`, payload);
      } else {
        await apiClient.post('/questions', payload);
      }
      router.push('/admin/questions');
    } catch (e) {
      setGlobalError(e instanceof ApiClientError ? e.message : 'Lỗi khi lưu câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Chỉnh sửa câu hỏi' : 'Soạn câu hỏi mới'} description="Tạo và chỉnh sửa câu hỏi trắc nghiệm" />
        <div className="mt-6 flex items-center justify-center h-64">
          <span className="animate-spin material-symbols-outlined text-primary">progress_activity</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Chỉnh sửa câu hỏi' : 'Soạn câu hỏi mới'}
        description="Tạo câu hỏi trắc nghiệm để đưa vào bài thi hoặc flashcard"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-2xl">
        {globalError && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex gap-2 items-center">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {globalError}
          </div>
        )}

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Loại câu hỏi</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
          >
            <option value="multiple_choice">Trắc nghiệm một đáp án</option>
            <option value="true_false">Đúng / Sai</option>
            <option value="fill_blank">Điền vào chỗ trống</option>
          </select>
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">
            Nội dung câu hỏi <span className="text-error">*</span>
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Ví dụ: What does 'autoscaling' mean in cloud computing?"
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary resize-none"
          />
          <p className="mt-0.5 text-xs text-on-surface-variant text-right">{prompt.length}/1000</p>
          <FieldError msg={errors.prompt} />
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Đoạn văn ngữ cảnh (tuỳ chọn)</label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Dán đoạn văn tiếng Anh để học viên đọc trước khi trả lời..."
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Domain & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Lĩnh vực <span className="text-error">*</span></label>
            <select
              value={domainId}
              onChange={e => setDomainId(e.target.value)}
              className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
            >
              <option value="">-- Chọn lĩnh vực --</option>
              {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <FieldError msg={errors.domainId} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Cấp độ <span className="text-error">*</span></label>
            <select
              value={levelId}
              onChange={e => setLevelId(e.target.value)}
              className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
            >
              <option value="">-- Chọn cấp độ --</option>
              {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <FieldError msg={errors.levelId} />
          </div>
        </div>

        {/* Points & Topics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Điểm</label>
            <input
              type="number"
              value={points}
              onChange={e => setPoints(e.target.value)}
              min={1}
              max={100}
              className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
            />
            <FieldError msg={errors.points} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Topics (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={topics}
              onChange={e => setTopics(e.target.value)}
              placeholder="aws, networking, security"
              className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-3">
            Đáp án <span className="text-error">*</span>
            <span className="ml-2 text-xs text-on-surface-variant font-normal">(click radio để chọn đáp án đúng)</span>
          </label>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={opt.key} className={`rounded-xl border p-3 ${opt.isCorrect ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low'}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => toggleCorrect(i)}
                    className="mt-1 accent-primary"
                    title={`Đáp án ${opt.key} đúng`}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface-variant w-4">{opt.key}.</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={e => updateOption(i, 'text', e.target.value)}
                        maxLength={500}
                        placeholder={`Nội dung đáp án ${opt.key}`}
                        className="flex-1 rounded-lg border border-outline-variant px-3 py-1.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <input
                      type="text"
                      value={opt.explanation}
                      onChange={e => updateOption(i, 'explanation', e.target.value)}
                      maxLength={500}
                      placeholder="Giải thích tại sao đây đúng/sai (tuỳ chọn)"
                      className="w-full rounded-lg border border-outline-variant/50 px-3 py-1.5 text-xs text-on-surface-variant bg-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <FieldError msg={errors.options} />
        </div>

        {/* Global explanation */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Giải thích chung (hiện sau khi trả lời)</label>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Giải thích tổng quát để học viên hiểu sâu hơn..."
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? (
              <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">save</span>
            )}
            {isEdit ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
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
