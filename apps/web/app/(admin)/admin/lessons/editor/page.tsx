'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { LessonDetail } from '@/shared/api/api-client';

// Domain & Level options (loaded from API)
interface SelectOption { id: string; code: string; name: string }

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-error">{msg}</p>;
}

export default function LessonEditorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const lessonId = params.get('id'); // ?id=xxx => edit mode
  const isEdit = !!lessonId;

  const [domains, setDomains] = React.useState<SelectOption[]>([]);
  const [levels, setLevels] = React.useState<SelectOption[]>([]);

  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [type, setType] = React.useState('vocabulary');
  const [domainId, setDomainId] = React.useState('');
  const [levelId, setLevelId] = React.useState('');
  const [estimatedMinutes, setEstimatedMinutes] = React.useState('');
  const [tags, setTags] = React.useState(''); // comma-separated

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [globalError, setGlobalError] = React.useState('');

  // Load domains + levels + (if edit) lesson data
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
          const lesson = await apiClient.get<LessonDetail>(`/lessons/${lessonId}`);
          setTitle(lesson.title);
          setSummary(lesson.summary ?? '');
          setType(lesson.type ?? 'reading');
          setDomainId((lesson as any).domainId ?? '');
          setLevelId((lesson as any).levelId ?? '');
          setEstimatedMinutes(String(lesson.estimatedMinutes ?? ''));
          setTags(((lesson as any).tags as string[] ?? []).join(', '));
        }
      } catch (e) {
        setGlobalError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [isEdit, lessonId]);

  // Client-side validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Tiêu đề không được để trống';
    else if (title.trim().length > 200) errs.title = 'Tiêu đề tối đa 200 ký tự';
    if (summary.trim().length > 500) errs.summary = 'Tóm tắt tối đa 500 ký tự';
    if (!domainId) errs.domainId = 'Vui lòng chọn lĩnh vực';
    if (!levelId) errs.levelId = 'Vui lòng chọn cấp độ';
    if (estimatedMinutes && (isNaN(Number(estimatedMinutes)) || Number(estimatedMinutes) < 1 || Number(estimatedMinutes) > 480)) {
      errs.estimatedMinutes = 'Thời gian học phải từ 1 đến 480 phút';
    }
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
        summary: summary.trim() || undefined,
        type,
        domainId: domainId || undefined,
        levelId: levelId || undefined,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (isEdit) {
        await apiClient.patch(`/lessons/${lessonId}`, payload);
      } else {
        await apiClient.post('/lessons', payload);
      }
      router.push('/admin/lessons');
    } catch (e) {
      setGlobalError(e instanceof ApiClientError ? e.message : 'Lỗi khi lưu bài học');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Chỉnh sửa bài học' : 'Soạn bài học mới'} description="Tạo hoặc chỉnh sửa bài học" />
        <div className="mt-6 flex items-center justify-center h-64">
          <span className="animate-spin material-symbols-outlined text-primary">progress_activity</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Chỉnh sửa bài học' : 'Soạn bài học mới'}
        description={isEdit ? `Đang chỉnh sửa lesson ID: ${lessonId}` : 'Tạo bài học mới cho hệ thống'}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-2xl">
        {globalError && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex gap-2 items-center">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {globalError}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">
            Tiêu đề bài học <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Ví dụ: Understanding REST APIs in Production"
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
          />
          <FieldError msg={errors.title} />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Tóm tắt</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Mô tả ngắn về nội dung bài học..."
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary resize-none"
          />
          <p className="mt-0.5 text-xs text-on-surface-variant text-right">{summary.length}/500</p>
          <FieldError msg={errors.summary} />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Loại bài học</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
          >
            <option value="vocabulary">Từ vựng</option>
            <option value="terminology">Thuật ngữ chuyên ngành</option>
            <option value="technical_reading">Đọc hiểu tài liệu kỹ thuật</option>
            <option value="api_documentation">Tài liệu API</option>
            <option value="system_design">System Design cơ bản</option>
            <option value="case_study">Case Study thực tế</option>
          </select>
        </div>

        {/* Domain & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              Lĩnh vực <span className="text-error">*</span>
            </label>
            <select
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
            >
              <option value="">-- Chọn lĩnh vực --</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <FieldError msg={errors.domainId} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              Cấp độ <span className="text-error">*</span>
            </label>
            <select
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
              className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
            >
              <option value="">-- Chọn cấp độ --</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <FieldError msg={errors.levelId} />
          </div>
        </div>

        {/* Estimated Minutes */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Thời gian học (phút)</label>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            min={1}
            max={480}
            placeholder="Ví dụ: 30"
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
          />
          <FieldError msg={errors.estimatedMinutes} />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Tags (phân cách bằng dấu phẩy)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="aws, api, rest, cloud"
            className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary"
          />
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
            {isEdit ? 'Lưu thay đổi' : 'Tạo bài học'}
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

