import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { api } from '../../shared/api/api-client';
import { Text, Button, controlStyles } from '../../shared/ui/primitives';

type Group = { domain: { code: string; name: string }; level: { code: string; name: string }; total: number; remaining: number; samples: { id: string; term: string }[] };
export function VocabularyRecommendations() {
  const router = useRouter(); const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError('');
    void api.get<{ groups: Group[] }>('/vocab-study/recommendations').then(result => { if (active) setGroups(result.groups ?? []); })
      .catch(() => { if (active) setError('Không thể tải đề xuất từ vựng.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]));
  return <View style={{ gap: 12 }}><Text accessibilityRole="header" style={{ fontWeight: '800', fontSize: 19 }}>Từ vựng theo lộ trình của bạn</Text><Text>Chọn bộ từ đúng trình độ và chuyên ngành trong mục tiêu học tập. Phiên học mới chỉ lấy những từ bạn chưa học.</Text>
    {loading ? <Text>Đang tải đề xuất…</Text> : error ? <><Text accessibilityRole="alert">{error}</Text><Button mode="outlined" onPress={() => setRetry(value => value + 1)}>Thử lại</Button></> : groups.length ? groups.map(group => <View key={`${group.domain.code}:${group.level.code}`} style={[controlStyles.card, { gap: 10 }]}>
      <Text style={{ fontWeight: '700', fontSize: 17 }}>{group.domain.name}</Text><Text>{group.level.name} · {group.total} từ · {group.remaining} từ chưa học</Text><Text>{group.samples.map(word => word.term).join(' · ')}</Text>
      <Button onPress={() => router.push(group.remaining > 0 ? { pathname: '/flashcards', params: { domainCode: group.domain.code, levelCode: group.level.code } } as any : '/flashcards?mode=review' as any)}>{group.remaining > 0 ? 'Học từ vựng này' : 'Đã học hết bộ từ · Ôn tập từ đến hạn'}</Button>
    </View>) : <><Text>Chưa có bộ từ phù hợp với chuyên ngành và trình độ đã chọn.</Text><Button mode="outlined" onPress={() => router.push('/profile/edit' as any)}>Cập nhật lộ trình</Button></>}
  </View>;
}
