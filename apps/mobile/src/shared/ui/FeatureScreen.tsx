import { Text, TouchableOpacity } from './primitives';
import { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from './AppIcon';
import { useRouter } from 'expo-router';
import { useTheme } from '../store/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FeatureScreen({ title, subtitle, children, loading = false, error = '', onRetry, embedded = false }: {
  title: string; subtitle?: string; children: ReactNode; loading?: boolean; error?: string; onRetry?: () => void; embedded?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return <View style={[s.root, { backgroundColor: colors.background }]}>
    <View style={[s.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
      {!embedded && <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/learning' as any)} style={s.back}><MaterialIcons name="arrow-back" size={24} color={colors.onSurface} /></TouchableOpacity>}
      <View style={{ flex: 1 }}><Text style={[s.title, { color: colors.onSurface }]}>{title}</Text>{subtitle ? <Text style={[s.subtitle, { color: colors.onSurfaceVariant }]}>{subtitle}</Text> : null}</View>
    </View>
    {loading ? <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View> : error ? <View style={s.center}><MaterialIcons name="error-outline" size={42} color={colors.error} /><Text style={[s.error, { color: colors.error }]}>{error}</Text>{onRetry ? <TouchableOpacity onPress={onRetry} style={[s.retry, { backgroundColor: colors.primary }]}><Text style={{ color: '#fff', fontWeight: '700' }}>Thử lại</Text></TouchableOpacity> : null}</View> : <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]}>{children}</ScrollView>}
  </View>;
}

export function EmptyState({ icon, title, detail }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string }) {
  const { colors } = useTheme();
  return <View style={s.center}><MaterialIcons name={icon} size={48} color={colors.outline} /><Text style={[s.emptyTitle, { color: colors.onSurface }]}>{title}</Text><Text style={[s.emptyText, { color: colors.onSurfaceVariant }]}>{detail}</Text></View>;
}

const s = StyleSheet.create({
  root: { flex: 1 }, header: { paddingTop: 48, paddingBottom: 13, paddingHorizontal: 14, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { padding: 6 }, title: { fontSize: 20, fontWeight: '800' }, subtitle: { fontSize: 12, marginTop: 2 },
  content: { padding: 16, paddingBottom: 50 }, center: { flex: 1, minHeight: 360, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 12 },
  error: { textAlign: 'center' }, retry: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 9 }, emptyTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' }, emptyText: { textAlign: 'center', lineHeight: 20 },
});
