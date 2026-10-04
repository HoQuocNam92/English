import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Badge, controlStyles } from '../../shared/ui/primitives';
import { useTheme } from '../../shared/store/theme-context';
import { mobileRoute } from '../../shared/navigation';

export function PlacementPlan({ result }: { result: any }) {
  const router = useRouter(); const { colors } = useTheme(); const [review, setReview] = useState(false); const plan = result.plan;
  return <View style={{ gap: 16 }}>
    <View style={[controlStyles.card, { gap: 10 }]}><Text style={{ color: colors.primary, fontWeight: '700' }}>{plan?.source === 'ai' ? 'Lộ trình AI dành cho bạn' : 'Lộ trình theo kết quả và mục tiêu'}</Text><Text style={{ fontSize: 22, fontWeight: '700' }}>Trình độ đề xuất</Text><Badge>{result.levelName}</Badge>{typeof result.total === 'number' && <Text>Đúng {result.correct}/{result.total} câu · {result.percent}%</Text>}<Text>{plan?.levelReason}</Text>{plan?.message && <Text style={{ color: '#b45309' }}>{plan.message}</Text>}</View>
    {!!result.domainScores?.length && <View style={[controlStyles.card, { gap: 12 }]}><Text style={{ fontWeight: '700' }}>Kết quả theo lĩnh vực</Text>{result.domainScores.map((domain: any) => <View key={domain.code} style={{ gap: 8 }}><Text>{domain.name}: {domain.correct}/{domain.total} · {domain.percent}%</Text><View style={{ height: 6, backgroundColor: colors.surfaceContainer }}><View style={{ height: 6, backgroundColor: colors.primary, width: `${Math.max(0, Math.min(100, domain.percent))}%` }} /></View></View>)}</View>}
    {plan && <View style={[controlStyles.card, { gap: 12 }]}><Text style={{ fontWeight: '700' }}>Kế hoạch 4 tuần · {plan.dailyMinutes} phút/ngày</Text><Text>{plan.summary}</Text>{!!plan.strengths?.length && <><Text style={{ color: colors.success, fontWeight: '700' }}>Điểm mạnh</Text>{plan.strengths.map((value: string, index: number) => <Text key={index}>• {value}</Text>)}</>}{!!plan.weaknesses?.length && <><Text style={{ color: '#b45309', fontWeight: '700' }}>Cần củng cố</Text>{plan.weaknesses.map((value: string, index: number) => <Text key={index}>• {value}</Text>)}</>}
      {(plan.steps ?? []).map((step: any) => <View key={`${step.id}-${step.week}`} style={[controlStyles.card, { gap: 8 }]}><Badge>Tuần {step.week}</Badge><Text style={{ fontWeight: '700' }}>{step.title}</Text><Text>{step.reason}</Text><View style={controlStyles.footer}><Button onPress={() => router.push(mobileRoute(step.actionUrl) as any)}>{step.kind === 'certificate' ? 'Học theo chứng chỉ' : step.kind === 'vocabulary' ? 'Học từ vựng' : 'Mở bài học'}</Button></View></View>)}
      {!plan.steps?.length && <Text>Chưa có nội dung xuất bản phù hợp với mục tiêu. Bạn có thể điều chỉnh lĩnh vực trong hồ sơ.</Text>}
    </View>}
    {!!result.review?.length && <><Button onPress={() => setReview(value => !value)}>{review ? 'Ẩn đáp án và giải thích' : 'Xem đáp án và giải thích'}</Button>{review && result.review.map((question: any, index: number) => <View key={question.questionId} style={[controlStyles.card, { gap: 8 }]}><Badge tone={question.correct ? 'success' : 'warning'}>Câu {index + 1} · {question.correct ? 'Đúng' : 'Cần ôn lại'}</Badge><Text style={{ fontWeight: '700' }}>{question.prompt}</Text>{question.context && <Text selectable>{question.context}</Text>}<Text>Bạn chọn: {question.options.find((option: any) => option.id === question.selectedOptionId)?.text}</Text><Text style={{ color: colors.success }}>Đáp án: {question.options.find((option: any) => option.id === question.correctOptionId)?.text}</Text><Text>{question.explanation}</Text></View>)}</>}
  </View>;
}
