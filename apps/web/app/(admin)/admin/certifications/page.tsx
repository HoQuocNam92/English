'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface CertificateItem {
  id: string;
  code: string;
  name: string;
  provider: string;
  description: string;
  examUrl: string | null;
  isActive: boolean;
  domains?: Array<{ domain: { code: string; name: string } }>;
  _count?: {
    exams: number;
    lessonCerts: number;
    questionCerts: number;
  };
}

export default function AdminCertificationsPage() {
  const [certs, setCerts] = React.useState<CertificateItem[]>([]);
  const [filteredCerts, setFilteredCerts] = React.useState<CertificateItem[]>([]);
  const [searchInput, setSearchInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<{ data: CertificateItem[] }>('/certificates');
        const data = res.data ?? [];
        setCerts(data);
        setFilteredCerts(data);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách chứng chỉ');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleSearch = (sanitized: string) => {
    if (!sanitized) {
      setFilteredCerts(certs);
      return;
    }
    const q = sanitized.toLowerCase();
    setFilteredCerts(
      certs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Chứng chỉ quốc tế"
        description="Quản lý và theo dõi các chứng chỉ IT hàng đầu được hỗ trợ luyện thi trên hệ thống"
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Tìm kiếm chứng chỉ theo tên, mã (AWS-SAA, CKA...), tổ chức cấp..."
          maxLength={100}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Tổng số chứng chỉ', value: loading ? '—' : String(certs.length), icon: 'workspace_premium', color: 'text-primary' },
          { label: 'Tổ chức cấp chứng chỉ', value: loading ? '—' : String(new Set(certs.map((c) => c.provider)).size), icon: 'business', color: 'text-secondary' },
          { label: 'Đề thi Mock Exam', value: loading ? '—' : String(certs.reduce((s, c) => s + (c._count?.exams ?? 0), 0)), icon: 'quiz', color: 'text-tertiary' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-on-surface-variant font-medium">{s.label}</p>
              <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Cert Cards */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-on-surface">
            Danh sách chứng chỉ {filteredCerts.length > 0 && `(${filteredCerts.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-3 animate-pulse">
                <div className="h-5 w-2/3 rounded bg-outline-variant/20" />
                <div className="h-4 w-full rounded bg-outline-variant/10" />
                <div className="h-8 w-full rounded bg-outline-variant/10" />
              </div>
            ))}
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">workspace_premium</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy chứng chỉ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCerts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-medium">
                      {c.provider}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-on-surface line-clamp-2 mt-1">{c.name}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-3 mt-2 leading-relaxed">{c.description}</p>

                  {/* Domains */}
                  {c.domains && c.domains.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.domains.map((d) => (
                        <span key={d.domain.code} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                          {d.domain.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">quiz</span>
                    {c._count?.exams ?? 0} đề thi mock
                  </span>
                  {c.examUrl && (
                    <a
                      href={c.examUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-0.5"
                    >
                      Trang chủ <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
