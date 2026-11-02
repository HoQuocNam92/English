import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Button, Text, Tabs } from '../src/shared/ui/primitives';
import { PlacementPlan } from '../src/features/learning/PlacementPlan';
import { LearningPathJourney } from '../src/features/learning/LearningPathJourney';
import { api, ApiError } from '../src/shared/api/api-client';

export default function LearningPlan({ embedded = false }: { embedded?: boolean } = {}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [view, setView] = useState('path');
  return <FeatureScreen title="Lộ trình học của bạn" embedded={embedded}><View style={{ gap: 16 }}>
    <Tabs items={[{ value: 'path', label: 'Tiến trình học' }, { value: 'plan', label: 'Kế hoạch 4 tuần' }]} value={view} onChange={setView} />
    <View style={{ display: view === 'path' ? 'flex' : 'none' }}><LearningPathJourney full onAvailability={setAvailable} /></View>
    {(view === 'plan' || available === false) && <LegacyPlan />}
  </View></FeatureScreen>;
}
function LegacyPlan() {
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const router = useRouter();
  const load = useCallback(async () => {
    try { setResult(await api.get('/placement-test/result')); setError(''); }
    catch (cause: any) { if (cause instanceof ApiError && cause.statusCode === 404) setResult(null); else setError(cause.message); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const create = async () => { if (saving) return; setSaving(true); setError(''); try { setResult(await api.post('/placement-test/plan', {})); } catch (cause: any) { setError(cause.message); } finally { setSaving(false); } };
  return <View style={{ gap: 16 }}>
    <Text>Lộ trình theo mục tiêu đã chọn. Kiểm tra trình độ nếu bạn muốn đánh giá lại năng lực.</Text>
    <Button disabled={saving} onPress={create}>{saving ? 'Đang phân tích…' : result ? 'Cập nhật kế hoạch bằng AI' : 'Tạo kế hoạch 4 tuần'}</Button>
    {result && <PlacementPlan result={result} compact />}
    {!!error && <Text accessibilityRole="alert">{error}</Text>}
    <Button onPress={() => router.push('/placement-test' as any)}>Kiểm tra trình độ</Button>
  </View>;
}
