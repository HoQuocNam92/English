import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Button, Text } from '../src/shared/ui/primitives';
import { LearningPathJourney } from '../src/features/learning/LearningPathJourney';
export default function LearningPlan({ embedded = false }: { embedded?: boolean } = {}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const router = useRouter();
  return <FeatureScreen title="Lộ trình học của bạn" embedded={embedded}><View style={{ gap: 16 }}>
    <LearningPathJourney full onAvailability={setAvailable} />
    {available === false && <><Text>Chọn mục tiêu và chuyên ngành để bắt đầu lộ trình.</Text><Button onPress={() => router.push('/profile/edit' as any)}>Thiết lập mục tiêu</Button></>}
  </View></FeatureScreen>;
}
