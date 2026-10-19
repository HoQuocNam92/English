type ActivityDay = { date: string; activityCount: number };

const shortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;
const fullDate = (date: string) => `${shortDate(date)}/${date.slice(0, 4)}`;

export function ActivityChart({ data }: { data: ActivityDay[] }) {
  if (!data.length) return <p className="py-12 text-center text-sm text-on-surface-variant">Không có dữ liệu trong khoảng thời gian này.</p>;

  const grouping = data.length > 120 ? 'month' : data.length > 31 ? 'week' : 'day';
  const buckets = new Map<string, { from: string; to: string; count: number }>();
  for (const item of data) {
    const date = new Date(`${item.date}T00:00:00Z`);
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    const key = grouping === 'month' ? item.date.slice(0, 7) : grouping === 'week' ? monday.toISOString().slice(0, 10) : item.date;
    const bucket = buckets.get(key) ?? { from: item.date, to: item.date, count: 0 };
    bucket.to = item.date;
    bucket.count += item.activityCount;
    buckets.set(key, bucket);
  }
  const series = [...buckets.entries()].map(([key, item]) => ({
    ...item,
    label: grouping === 'month' ? `${key.slice(5, 7)}/${key.slice(0, 4)}` : grouping === 'week' ? `${shortDate(item.from)}–${shortDate(item.to)}` : shortDate(item.from),
  }));
  const max = Math.max(1, ...series.map(item => item.count));
  const total = data.reduce((sum, item) => sum + item.activityCount, 0);
  const unit = grouping === 'month' ? 'tháng' : grouping === 'week' ? 'tuần' : 'ngày';

  return <div className="min-w-0 w-full">
    <p className="mb-3 text-sm text-on-surface-variant">Từ {fullDate(data[0].date)} đến {fullDate(data[data.length - 1].date)} · Tổng {total.toLocaleString('vi-VN')} lượt cập nhật tiến độ. Mỗi cột là một {unit}.</p>
    <div className="overflow-x-auto pb-2">
      <div style={{ minWidth: `${Math.max(360, series.length * 72)}px` }}>
        <div className="flex h-56 items-end gap-1 border-b border-outline-variant pt-8" role="img" aria-label={`Số lượt cập nhật tiến độ theo ${unit}: ${series.map(item => `${item.label}: ${item.count} lượt`).join('; ')}`}>
          {series.map(item => <div key={item.from} className="flex h-full min-w-0 flex-1 items-end justify-center" title={`${fullDate(item.from)}${item.from === item.to ? '' : ` – ${fullDate(item.to)}`}: ${item.count} lượt cập nhật tiến độ`}>
            <div className="relative w-full max-w-8 rounded-t bg-primary" style={{ height: `${item.count / max * 100}%` }}>
              {item.count > 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-on-surface-variant">{item.count.toLocaleString('vi-VN')} lượt</span>}
            </div>
          </div>)}
        </div>
        <div className="mt-2 flex gap-1 text-center text-xs leading-5 text-on-surface-variant">{series.map(item => <span key={item.from} className="min-w-0 flex-1">{item.label}</span>)}</div>
      </div>
    </div>
    <p className="mt-2 text-xs text-on-surface-variant">Cột trống nghĩa là không có lượt cập nhật tiến độ trong {unit} đó. Ngày được tính theo giờ Việt Nam (UTC+7).</p>
  </div>;
}
