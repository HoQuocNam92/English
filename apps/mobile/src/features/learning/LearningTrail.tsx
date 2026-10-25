import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { buildLearningTrail, type TrailDomain } from '../../../../../packages/shared-kernel/src/learning-trail';
import { Text, Button, controlStyles } from '../../shared/ui/primitives';
import { mobileRoute } from '../../shared/navigation';

export function LearningTrail({ domains }: { domains: TrailDomain[] }) {
  const trail = buildLearningTrail(domains); const router = useRouter();
  const open = (href: string) => router.push(mobileRoute(href) as any);
  return <View style={{ gap: 18 }}>
    <Text style={{ fontSize: 23, fontWeight: '800' }}>Hành trình học tập</Text>
    <Text>Học chủ đề mới → luyện từ trong ngữ cảnh → kiểm tra cuối chặng. Học theo nhịp riêng; ôn bổ sung để củng cố kiến thức.</Text>
    {trail.next && <Button onPress={() => open(trail.next!.href)}>Tiếp tục: {trail.next.title}</Button>}
    {trail.stages.map(stage => <View key={stage.id} style={[controlStyles.card, { gap: 18 }]}>
      <Text style={{ fontSize: 21, fontWeight: '800', color: '#3525cd' }}>Chặng {stage.number} · {stage.title}</Text>
      <Text>{stage.units.length} chủ đề · {stage.steps.filter(step => step.kind === 'review').length} lượt luyện từ{stage.completed ? ' · Đã đạt tổng kết' : ''}</Text>
      {stage.units.map(unit => <View key={unit.id} style={{ gap: 14 }}><Text style={{ fontWeight: '800' }}>Chủ đề {unit.number} · {unit.title}</Text>{unit.steps.map(step => <Node key={step.id} step={step} current={trail.next?.id === step.id} onOpen={open} />)}</View>)}
      {stage.checkpoint ? <Node step={stage.checkpoint} current={trail.next?.id === stage.checkpoint.id} onOpen={open} /> : <Text>Tổng kết đang được bổ sung.</Text>}
    </View>)}
  </View>;
}
function Node({ step, current, onOpen }: { step: ReturnType<typeof buildLearningTrail>['steps'][number]; current: boolean; onOpen: (href: string) => void }) {
  return <View style={{ borderLeftWidth: 4, borderLeftColor: '#ddd6fe', paddingLeft: 12, gap: 10 }}>
    <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: step.completed ? '#047857' : current ? '#3525cd' : '#e2e8f0' }}><Text style={{ color: step.completed || current ? '#fff' : '#475569', fontWeight: '800', fontSize: 22 }}>{step.completed ? '✓' : !step.ready ? '🔒' : step.kind === 'review' ? '↻' : step.kind === 'checkpoint' ? '★' : '▶'}</Text></View>
    <Text style={{ fontWeight: '800' }}>{step.title}</Text><Text>{step.completed ? 'Đã hoàn thành' : current ? 'Bước tiếp theo' : step.ready ? 'Sẵn sàng' : 'Hoàn thành bài trước để mở'}</Text><Text>{step.description}{step.minutes > 0 ? ` Khoảng ${step.minutes} phút.` : ''}</Text>
    {step.ready && <Button onPress={() => onOpen(step.href)}>{step.completed ? 'Ôn lại' : step.kind === 'review' ? 'Luyện tập' : step.kind === 'checkpoint' ? 'Làm tổng kết' : 'Bắt đầu học'}</Button>}
  </View>;
}
