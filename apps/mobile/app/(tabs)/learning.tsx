import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { FeatureScreen } from '../../src/shared/ui/FeatureScreen';
import { Text, TextInput, TouchableOpacity } from '../../src/shared/ui/primitives';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { useTheme } from '../../src/shared/store/theme-context';
import { learningMenu } from '../../src/shared/learning-menu';

export default function LearningScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLocaleLowerCase('vi');
  const groups = learningMenu.map(group => ({ ...group, items: group.items.filter(item => normalize(`${item.label} ${item.detail}`).includes(normalize(query.trim()))) })).filter(group => group.items.length);
  return <FeatureScreen title="Học tập" subtitle="Bài học, từ vựng, chứng chỉ và lộ trình" embedded>
    <TextInput accessibilityLabel="Tìm chức năng học tập" placeholder="Tìm bài học, từ vựng, lộ trình…" value={query} onChangeText={setQuery} style={[s.search, { borderColor: colors.outlineVariant }]} />
    {query ? <TouchableOpacity onPress={() => setQuery('')}><Text style={{ color: colors.primary }}>Xóa tìm kiếm</Text></TouchableOpacity> : null}
    {groups.map(group => <View key={group.title} style={s.section}>
      <Text style={s.heading}>{group.title}</Text>
      {group.items.map(item => <TouchableOpacity key={item.href} accessibilityLabel={item.label} onPress={() => router.push(item.href as any)} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={[s.icon, { backgroundColor: colors.primaryContainer }]}><MaterialIcons name={item.icon} size={25} color={colors.primary} /></View>
        <View style={s.body}><Text style={s.label}>{item.label}</Text><Text style={[s.detail, { color: colors.onSurfaceVariant }]}>{item.detail}</Text></View>
        <MaterialIcons name="chevron-right" size={22} color={colors.primary} />
      </TouchableOpacity>)}
    </View>)}
    {!groups.length && <Text>Không tìm thấy chức năng phù hợp. Thử từ khóa khác.</Text>}
  </FeatureScreen>;
}
const s = StyleSheet.create({
  search: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }, section: { gap: 10, marginBottom: 22 }, heading: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 }, icon: { padding: 10, borderRadius: 12 }, body: { flex: 1 }, label: { fontSize: 15, fontWeight: '700' }, detail: { fontSize: 12, marginTop: 4 },
});
