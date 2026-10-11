export function ActivityChart({ data }: { data: { day: string; activityCount: number }[] }) {
  const max = Math.max(1, ...data.map(item => item.activityCount));
  if (!data.length) return <p className="py-12 text-center text-sm text-on-surface-variant">Không có dữ liệu trong khoảng thời gian này.</p>;
  return <div className="min-w-0 w-full overflow-hidden">
    <div className="overflow-x-auto pb-2">
      <div style={{ minWidth: `${data.length * 96}px` }}>
        <div className="flex h-56 items-end gap-1 border-b border-outline-variant pt-6" role="img" aria-label={`Hoạt động theo ngày, giờ Việt Nam: ${data.map(item => `${item.day}, 00:00–23:59: ${item.activityCount} lượt`).join('; ')}`}>
          {data.map((item, index) => <div key={`${index}-${item.day}`} className="relative flex h-full min-w-0 flex-1 items-end justify-center" title={`${item.day}, 00:00–23:59 (giờ Việt Nam): ${item.activityCount} lượt hoạt động`}><div className="w-full max-w-8 rounded-t bg-primary" style={{ height: `${item.activityCount / max * 100}%` }} /><span className="absolute -top-6 text-[10px] text-on-surface-variant">{item.activityCount}</span></div>)}
        </div>
        <div className="mt-2 flex gap-1 text-center text-xs leading-5 text-on-surface-variant">{data.map((item, index) => <span key={`${index}-${item.day}`} className="min-w-0 flex-1">{item.day.split(', ').map((part, i) => <span key={i} className="block">{part}</span>)}</span>)}</div>
      </div>
    </div>
    <p className="mt-3 text-xs leading-5 text-on-surface-variant">{data.reduce((sum, item) => sum + item.activityCount, 0)} lượt hoạt động · {data.length} ngày hiển thị. Mỗi ngày tính từ 00:00 đến 23:59, giờ Việt Nam (UTC+7). Ngày có 0 hoạt động không có cột.</p>
    <details className="mt-3 text-sm"><summary className="cursor-pointer text-primary">Xem số liệu từng ngày</summary><div className="mt-2 grid max-h-64 gap-2 overflow-y-auto">{data.map((item, i) => <p key={i}>{item.day} · 00:00–23:59: {item.activityCount} lượt</p>)}</div></details>
  </div>;
}
