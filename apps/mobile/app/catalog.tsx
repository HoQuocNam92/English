import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { lessonTracks } from '../../../packages/shared-kernel/src/lesson-tracks';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Button, ListTools, Text, controlStyles } from '../src/shared/ui/primitives';
export default function Catalog() {
 const router = useRouter(); const [query, setQuery] = useState('');
 const modules = [{ type: 'vocabulary', label: 'Từ vựng chuyên ngành', description: 'Học từ mới, ôn tập và kiểm tra từ vựng.', action: 'Học từ vựng' }, ...lessonTracks];
 return <FeatureScreen title="Danh mục học tập"><ListTools search={query} onSearch={setQuery} placeholder="Tìm chuyên đề học tập" filters={[]} value="" onFilter={() => {}}/>{modules.filter(item => `${item.label} ${item.description}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))).map(item => <View key={item.type} style={[controlStyles.card, { minHeight: 180, marginBottom: 12, gap: 12 }]}><Text style={{ fontSize: 18, fontWeight: '700' }}>{item.label}</Text><Text>{item.description}</Text><View style={controlStyles.footer}><Button onPress={() => router.push((item.type === 'vocabulary' ? '/flashcards/dashboard' : `/lessons?type=${item.type}`) as any)}>{item.action}</Button></View></View>)}</FeatureScreen>;
}
