import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Button, Text } from '../src/shared/ui/primitives';
import { PlacementPlan } from '../src/features/learning/PlacementPlan';
import { LearningPathJourney } from '../src/features/learning/LearningPathJourney';
import { api, ApiError } from '../src/shared/api/api-client';

export default function LearningPlan({ embedded = false }: { embedded?: boolean } = {}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  return <FeatureScreen title="Lộ trình học của bạn" embedded={embedded}><View style={{ gap: 16 }}>
    <LearningPathJourney full onAvailability={setAvailable} />
    {available === false && <LegacyPlan />}
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
  const create = async () => { setSaving(true); try { await api.post('/placement-test/plan', {}); await load(); } catch (cause: any) { setError(cause.message); } finally { setSaving(false); } };
  return <View style={{ gap: 16 }}>
    <Text>Lộ trình theo mục tiêu đã chọn. Kiểm tra trình độ nếu bạn muốn đánh giá lại năng lực.</Text>
    <Button disabled={saving} onPress={create}>{saving ? 'Đang tạo…' : 'Tạo lại kế hoạch theo mục tiêu'}</Button>
    {result && <PlacementPlan result={result} />}
    {!!error && <Text accessibilityRole="alert">{error}</Text>}
    <Button onPress={() => router.push('/placement-test' as any)}>Kiểm tra trình độ</Button>
  </View>;
}
