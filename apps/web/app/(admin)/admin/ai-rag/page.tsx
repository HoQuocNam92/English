'use client';

import * as React from 'react';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface RagHealth {
  sources: Array<{ sourceType: string; status: string; _count: number }>;
  chunks: { total: number; embedded: number; missingEmbedding: number };
  embeddingModel: string;
  vectorStore: string;
  reranker: string;
  ready: boolean;
}

interface ReindexResult {
  indexed: number;
  unchanged: number;
  removed: number;
}

export default function AiRagAdminPage() {
  const [health, setHealth] = React.useState<RagHealth | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reindexing, setReindexing] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const loadHealth = React.useCallback(async () => {
    setLoading(true);
    try {
      setHealth(await apiClient.get<RagHealth>('/admin/knowledge/health'));
    } catch (error) {
      setMessage(error instanceof ApiClientError ? error.message : 'Không thể kiểm tra kho tri thức');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void loadHealth(); }, [loadHealth]);

  async function reindex() {
    setReindexing(true);
    setMessage('');
    try {
      const result = await apiClient.post<ReindexResult>('/admin/knowledge/reindex', {});
      setMessage(`Đã lập chỉ mục ${result.indexed} nguồn, giữ nguyên ${result.unchanged}, loại bỏ ${result.removed} nguồn cũ.`);
      await loadHealth();
    } catch (error) {
      setMessage(error instanceof ApiClientError ? error.message : 'Không thể lập chỉ mục lại');
    } finally {
      setReindexing(false);
    }
  }

  const sourceCount = health?.sources.reduce((sum, item) => sum + item._count, 0) ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI RAG & cá nhân hóa</h1>
          <p className="mt-1 text-sm text-slate-600">Theo dõi kho tri thức dùng để chatbot trả lời dựa trên bài học và từ vựng đã xuất bản.</p>
        </div>
        <button type="button" onClick={() => void reindex()} disabled={reindexing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {reindexing ? 'Đang lập chỉ mục...' : 'Lập chỉ mục lại'}
        </button>
      </div>

      {message && <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">{message}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Nguồn tri thức', sourceCount],
          ['Đoạn nội dung', health?.chunks.total ?? 0],
          ['Đã tạo vector', health?.chunks.embedded ?? 0],
          ['Thiếu vector', health?.chunks.missingEmbedding ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Trạng thái hệ thống</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Sẵn sàng trả lời có dẫn nguồn</dt><dd className={health?.ready ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>{health?.ready ? 'Sẵn sàng' : 'Cần đồng bộ'}</dd></div>
            <div className="flex justify-between"><dt>Kho vector</dt><dd>{health?.vectorStore ?? '—'}</dd></div>
            <div className="flex justify-between"><dt>Mô hình embedding</dt><dd>{health?.embeddingModel ?? '—'}</dd></div>
            <div className="flex justify-between"><dt>Mô hình xếp hạng lại</dt><dd>{health?.reranker ?? '—'}</dd></div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Luồng nghiệp vụ chính</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li>1. Nội dung đã xuất bản được chia thành các đoạn và tạo vector.</li>
            <li>2. Câu hỏi của học viên được tìm kiếm theo ngữ nghĩa và xếp hạng lại.</li>
            <li>3. Chatbot chỉ trả lời bằng ngữ cảnh đạt ngưỡng liên quan và kèm nguồn.</li>
            <li>4. Hồ sơ, mục tiêu nghề nghiệp và tiến độ được dùng để cá nhân hóa gợi ý học tập.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
