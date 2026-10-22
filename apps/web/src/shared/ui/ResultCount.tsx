export function ResultCount({ total, unit, loading = false, error = false, filtered = false, className = '' }: {
  total: number;
  unit: string;
  loading?: boolean;
  error?: boolean;
  filtered?: boolean;
  className?: string;
}) {
  if (error) return null;
  return <p role="status" aria-live="polite" className={`my-3 text-sm text-on-surface-variant ${className}`}>
    {loading ? 'Đang tải số lượng...' : <>Tổng cộng <span className="font-semibold text-on-surface">{total.toLocaleString('vi-VN')}</span> {unit}{filtered ? ' phù hợp với bộ lọc' : ''}</>}
  </p>;
}
