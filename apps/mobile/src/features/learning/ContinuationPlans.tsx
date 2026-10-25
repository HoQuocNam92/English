import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, View } from 'react-native';
import type { ContinuationOptions, ContinuationPlan } from '../../../../../packages/contracts/src/continuation';
import { api } from '../../shared/api/api-client';
import { mobileRoute } from '../../shared/navigation';
import { Text, Button, controlStyles } from '../../shared/ui/primitives';

export function ContinuationPlans() {
  const [options, setOptions] = useState<ContinuationOptions | null>(null);
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const request = useRef(0); const router = useRouter();
  const load = useCallback(async () => {
    const current = ++request.current;
    try { const result = await api.get<ContinuationOptions>('/progress/me/continuation'); if (current === request.current) { setOptions(result); setError(''); } }
    catch (cause: any) { if (current === request.current) setError(cause.message); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); return () => { ++request.current; }; }, [load]));
  const save = async (endpoint: string, data: any) => {
    if (saving) return; setSaving(true);
    try { await api.post(endpoint, data); await load(); } catch (cause: any) { setError(cause.message); }
    finally { setSaving(false); }
  };
  const choose = (plan: ContinuationPlan) => Alert.alert('Chọn kế hoạch tiếp theo', `${plan.title}. Lịch sử kế hoạch trước được giữ lại.`, [{ text: 'Hủy', style: 'cancel' }, { text: 'Xác nhận', onPress: () => void save('/progress/me/continuation', { planId: plan.id }) }]);
  const active = options?.active;
  return <View style={[controlStyles.card, { gap: 14 }]}>
    <Text style={{ fontSize: 21, fontWeight: '800' }}>Sau cấp Chuyên nghiệp</Text>
    {!!error && <><Text accessibilityRole="alert">{error}</Text><Button onPress={load}>Thử lại</Button></>}
    {!options && !error && <Text>Đang tìm kế hoạch tiếp theo…</Text>}
    {active && <><Text style={{ fontWeight: '700' }}>Đang học: {active.plan.title}</Text><Text>{active.completedStepIds.length}/{active.plan.steps.length} buổi đã xác nhận. Đây là tự ghi nhận hoạt động, không phải điểm kiểm tra.</Text>{active.plan.steps.map(step => {
      const done = active.completedStepIds.includes(step.id);
      return <View key={step.id} style={[controlStyles.card, { gap: 10 }]}><Text style={{ fontWeight: '700' }}>Ngày {step.day} · {step.title}</Text><Text>{step.description} · {step.minutes} phút</Text><Button onPress={() => router.push(mobileRoute(step.href) as any)}>{done ? 'Ôn lại' : 'Mở nội dung'}</Button>{done ? <Text>Đã xác nhận thực hiện</Text> : <Button mode="outlined" disabled={saving} onPress={() => void save('/progress/me/continuation/complete-step', { recordId: active.recordId, stepId: step.id })}>Xác nhận đã thực hiện</Button>}</View>;
    })}</>}
    {options?.plans.map(plan => <View key={plan.id} style={[controlStyles.card, { gap: 10 }]}><Text style={{ fontWeight: '700' }}>{plan.title}</Text><Text>{plan.objective}</Text><Text>{plan.reason}</Text><Text>{plan.durationDays} ngày · {plan.steps.length} buổi · {plan.dailyMinutes} phút/ngày</Text>{plan.steps.map(step => <Text key={step.id}>Ngày {step.day}: {step.title}</Text>)}<Button disabled={saving || (active?.plan.id === plan.id && active.completedStepIds.length < active.plan.steps.length)} onPress={() => choose(plan)}>{active?.plan.id === plan.id ? 'Bắt đầu chu kỳ mới' : 'Chọn kế hoạch'}</Button></View>)}
    {!!options?.certificateMessage && <Text>{options.certificateMessage}</Text>}
    <Button mode="outlined" onPress={() => router.push('/certifications' as any)}>Khám phá chứng chỉ</Button>
  </View>;
}
