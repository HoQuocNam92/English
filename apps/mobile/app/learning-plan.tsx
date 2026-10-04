import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Button, Text } from '../src/shared/ui/primitives';
import { PlacementPlan } from '../src/features/learning/PlacementPlan';
import { api } from '../src/shared/api/api-client';
export default function LearningPlan() {
  const [result, setResult] = useState<any>(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const router = useRouter();
  const load = useCallback(async () => { try { setResult(await api.get('/placement-test/result')); setError(''); } catch (cause: any) { setError(cause.message); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const create = async () => { setSaving(true); try { setResult(await api.post('/placement-test/plan', {})); setError(''); } catch (cause: any) { setError(cause.message); } finally { setSaving(false); } };
  return <FeatureScreen title="Lộ trình học của bạn" loading={loading} error={!result ? error : ''} onRetry={load}><View style={{ gap: 16 }}>{result ? <PlacementPlan result={result} /> : <><Text>Kiểm tra trình độ để có lộ trình theo năng lực, hoặc tạo kế hoạch theo mục tiêu đã chọn.</Text><Button disabled={saving} onPress={create}>{saving ? 'Đang tạo kế hoạch…' : 'Tạo lộ trình theo mục tiêu'}</Button></>}{result && error && <Text accessibilityRole="alert">{error}</Text>}<Button onPress={() => router.push('/placement-test' as any)}>Kiểm tra trình độ</Button></View></FeatureScreen>;
}
