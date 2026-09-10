import { useCallback, useEffect, useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';
import { EmptyState, FeatureScreen, featureStyles as s } from '../../src/shared/ui/FeatureScreen';

export default function CertificationsScreen() {
  const { colors } = useTheme(); const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); try { const raw: any = await api.get('/certificates'); setItems(raw.items ?? raw.data ?? raw ?? []); setError(''); } catch (e: any) { setError(e.message || 'Không thể tải chứng chỉ.'); } finally { setLoading(false); } }, []); useEffect(() => { load(); }, [load]);
  return <FeatureScreen title="Chứng chỉ" subtitle="Các chứng chỉ công nghệ trong hệ thống" loading={loading} error={error} onRetry={load}>{!items.length ? <EmptyState icon="workspace-premium" title="Chưa có chứng chỉ" detail="Danh mục chứng chỉ đang được cập nhật." /> : items.map(item => <View key={item.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><View style={s.row}><MaterialIcons name="workspace-premium" size={30} color={colors.primary} /><View style={{ flex: 1 }}><Text style={[s.cardTitle, { color: colors.onSurface }]}>{item.name}</Text><Text style={{ color: colors.primary, fontWeight: '700' }}>{item.provider} · {item.code}</Text></View></View><Text style={[s.muted, { color: colors.onSurfaceVariant, marginTop: 10 }]}>{item.description}</Text>{item.examUrl ? <TouchableOpacity onPress={() => Linking.openURL(item.examUrl)} style={[s.button, { borderWidth: 1, borderColor: colors.primary, marginTop: 12 }]}><Text style={{ color: colors.primary, fontWeight: '800' }}>Xem trang kỳ thi</Text></TouchableOpacity> : null}</View>)}</FeatureScreen>;
}
