import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { api } from '../../src/shared/api/api-client';
import { progressViewModel, type ProgressPayload } from '../../../../packages/shared-kernel/src/progress';
import { View } from 'react-native';
import { FeatureScreen } from '../../src/shared/ui/FeatureScreen';
import { Text } from '../../src/shared/ui/primitives';
import { LearningAgenda } from '../../src/features/learning/LearningAgenda';
import { LearningPathJourney } from '../../src/features/learning/LearningPathJourney';

export default function MobileProgressScreen() {
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  useFocusEffect(useCallback(() => {
    let current = true;
    void api.get<ProgressPayload>('/progress/me').then(result => { if (current) setProgress(result); }).catch(() => { if (current) setProgress(null); });
    return () => { current = false; };
  }, []));
  const attempts = progressViewModel(progress).recentAttempts;

  return <FeatureScreen title="Kế hoạch & tiến độ học tập"><View style={{ gap: 20 }}>
    <Text>Theo dõi bài học hiện tại và lịch học chi tiết trong từng tuần.</Text>
    <LearningAgenda />
    <LearningPathJourney full />
    {!!attempts.length && <View style={{ gap: 12 }}><Text style={{ fontSize: 20, fontWeight: '700' }}>Bài kiểm tra gần đây</Text>{attempts.slice(0, 3).map(attempt => <View key={attempt.id} style={{ gap: 6 }}><Text>{attempt.exam?.title ?? 'Bài kiểm tra'}</Text><Text>{attempt.passed ? 'Đã đạt' : 'Cần ôn lại'} · {Math.round(attempt.scorePercent ?? 0)}%</Text></View>)}</View>}
  </View></FeatureScreen>;
}
