import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { dashboardDateRange, vocabularyActivityRange } from '../../../../../packages/shared-kernel/src/dashboard-date-range';
import { api } from '../../shared/api/api-client';
import { Text, Button, Tabs, TextInput, TouchableOpacity, controlStyles } from '../../shared/ui/primitives';

export function VocabularyActivity() {
  const [period, setPeriod] = useState('month');
  const [from, setFrom] = useState(() => dashboardDateRange('month').dateFrom);
  const [to, setTo] = useState(() => dashboardDateRange('month').dateTo);
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [selected, setSelected] = useState(''); const [retry, setRetry] = useState(0);
  const range = vocabularyActivityRange(period, from, to);
  useFocusEffect(useCallback(() => {
    if (!range.valid) { setLoading(false); return; }
    let active = true;
    setLoading(true); setError(''); setSelected('');
    const query = new URLSearchParams({ from: range.dateFrom, to: range.dateTo });
    void api.get<{ heatmap: typeof heatmap }>(`/vocab-study/dashboard?${query}`)
      .then(result => { if (active) setHeatmap(Array.isArray(result.heatmap) ? result.heatmap : []); })
      .catch(() => { if (active) setError('Không thể tải hoạt động ôn tập. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range.dateFrom, range.dateTo, range.valid, retry]));
  const counts = new Map(heatmap.map(day => [day.date, day.count]));
  const days = range.valid ? Array.from({ length: range.count }, (_, i) => {
    const date = new Date(Date.parse(`${range.dateFrom}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10);
    return { date, count: counts.get(date) ?? 0 };
  }) : [];
  return <View style={[controlStyles.card, { gap: 12 }]}>
    <Text accessibilityRole="header" style={{ fontWeight: '800', fontSize: 19 }}>Hoạt động ôn tập</Text>
    <Tabs items={[{ value: 'week', label: '7 ngày gần nhất' }, { value: 'month', label: 'Tháng này' }, { value: 'year', label: 'Năm nay' }, { value: 'custom', label: 'Tùy chọn ngày' }]} value={period} onChange={setPeriod} />
    {period === 'custom' && <View style={{ gap: 8 }}><Text>Từ ngày</Text><TextInput accessibilityLabel="Từ ngày" value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12 }} /><Text>Đến ngày</Text><TextInput accessibilityLabel="Đến ngày" value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12 }} /><Text style={{ fontSize: 12 }}>Nhập năm-tháng-ngày, ví dụ: 2026-10-26.</Text></View>}
    {(!range.valid || error) ? <><Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{range.error || error}</Text>{range.valid && <Button mode="outlined" onPress={() => setRetry(value => value + 1)}>Thử lại</Button>}</> : loading ? <View><ActivityIndicator /><Text>Đang tải hoạt động…</Text></View> : <>
      <ScrollView horizontal accessibilityLabel={`Hoạt động ôn tập từ ${range.dateFrom} đến ${range.dateTo}`}><View style={{ flexDirection: 'row', gap: 3 }}>{days.map(day => <TouchableOpacity key={day.date} accessibilityLabel={`${day.date}: ${day.count} từ đã ôn`} onPress={() => setSelected(`${day.date}: ${day.count} từ đã ôn`)} style={{ width: range.count > 31 ? 18 : 28, alignItems: 'center' }}><View style={{ width: range.count > 31 ? 14 : 24, height: 18, borderRadius: 3, backgroundColor: day.count > 15 ? '#3525cd' : day.count > 5 ? '#9990ee' : day.count > 0 ? '#c3c0ff' : '#eceef0' }} /></TouchableOpacity>)}</View></ScrollView>
      <Text style={{ fontSize: 12 }}>{range.dateFrom} → {range.dateTo}</Text><Text>{selected || 'Mỗi ô là một ngày. Chạm vào ô để xem số từ đã ôn.'}</Text><Text style={{ fontSize: 12 }}>Màu càng đậm, số từ đã ôn càng nhiều.</Text>
    </>}
  </View>;
}
