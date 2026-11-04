'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';
import { Dropdown } from './Dropdown';

export function LevelFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [levels, setLevels] = React.useState<Array<{ id: string; code: string; name: string }>>([]);
  const [failed, setFailed] = React.useState(false);
  const load = React.useCallback(() => {
    setFailed(false);
    void apiClient.get<any>('/levels').then(result => setLevels(result.data ?? result)).catch(() => setFailed(true));
  }, []);
  React.useEffect(load, [load]);
  return <div className="min-w-40"><Dropdown aria-label="Lọc theo trình độ" value={value} onChange={event => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-outline-variant bg-white px-3 text-sm"><option value="">Tất cả trình độ</option>{levels.map(level => <option key={level.id} value={level.code}>{level.name}</option>)}</Dropdown>{failed && <button type="button" onClick={load} className="text-xs text-error">Không tải được trình độ · Thử lại</button>}</div>;
}
