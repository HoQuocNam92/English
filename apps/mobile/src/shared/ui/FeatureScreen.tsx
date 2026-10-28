import { featureIconColor } from './icon-colors';
import { Text, Button } from './primitives';
import { NotificationBell } from '../notifications/NotificationBell';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ActivityIndicator, IconButton, Surface } from 'react-native-paper';
import { MaterialIcons } from './AppIcon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FeatureScreen({ title, subtitle, children, loading = false, error = '', onRetry, embedded = false }: {
  title: string; subtitle?: string; children: ReactNode; loading?: boolean; error?: string; onRetry?: () => void; embedded?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.root}>
    <Surface elevation={0} style={[s.header, { paddingTop: insets.top + 8 }]}>
      {!embedded && <IconButton icon="arrow-left" accessibilityLabel="Quay lại" size={24} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/learning' as any)} style={s.back} />}
      <View style={{ flex: 1, minWidth: 0 }}><Text accessibilityRole="header" style={[s.title, embedded && { fontSize: 28 }]}>{title}</Text>{subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}</View>
      <NotificationBell />
    </Surface>
    {loading ? <View style={s.center}><ActivityIndicator size="large" /><Text style={s.emptyText}>Đang tải nội dung…</Text></View> : error ? <View style={s.center}><MaterialIcons name="error-outline" size={42} color="#ba1a1a" /><Text accessibilityRole="alert" style={s.error}>{error}</Text>{onRetry ? <Button onPress={onRetry}>Thử lại</Button> : null}</View> : <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]}>{children}</ScrollView>}
  </KeyboardAvoidingView>;
}

export function EmptyState({ icon, title, detail, children }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string; children?: ReactNode }) {
  return <View style={s.empty}><View style={[s.emptyIcon, { backgroundColor: `${featureIconColor(icon)}14` }]}><MaterialIcons name={icon} size={32} color={featureIconColor(icon)} /></View><Text accessibilityRole="header" style={s.emptyTitle}>{title}</Text><Text style={s.emptyText}>{detail}</Text>{children && <View style={{ marginTop: 12, gap: 12 }}>{children}</View>}</View>;
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fc' }, header: { paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f7f8fc' },
  back: { margin: 0, marginLeft: -8 }, title: { fontSize: 22, fontWeight: '700', color: '#17213a' }, subtitle: { fontSize: 14, color: '#59657c', marginTop: 4 },
  content: { padding: 20, paddingTop: 4 }, center: { flex: 1, minHeight: 300, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 16 },
  error: { color: '#ba1a1a', textAlign: 'center' }, empty: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40, gap: 12 }, emptyIcon: { padding: 20, borderRadius: 24, backgroundColor: '#eeecff' }, emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#17213a' }, emptyText: { color: '#59657c', textAlign: 'center', fontSize: 15 },
});
