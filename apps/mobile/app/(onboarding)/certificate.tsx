import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

interface Certificate { id: string; code: string; name: string; provider: string; description: string }

export default function OnboardingCertificateScreen() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api.get<{ data: Certificate[] }>('/certificates?activeOnly=true')
      .then(response => setCertificates(response?.data ?? []))
      .catch(() => setLoadError('Không thể tải danh sách chứng chỉ.'))
      .finally(() => setLoading(false));
  }, []);

  const next = async () => {
    if (!selected) return;
    await AsyncStorage.multiSet([
      ['onboarding_certificate_code', selected.code],
      ['onboarding_certificate_id', selected.id],
    ]);
    router.push('/(onboarding)/level' as any);
  };

  return <View style={styles.container}>
    <StatusBar style="dark" />
    <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color="#191c1e" /></TouchableOpacity><Text style={styles.step}>Bước 2/4</Text><View style={{ width: 24 }} /></View>
    <View style={styles.progress}><View style={[styles.progressFill, { width: '50%' }]} /></View>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Chọn chứng chỉ mục tiêu</Text>
      <Text style={styles.subtitle}>Danh sách được lấy trực tiếp từ chứng chỉ đang hoạt động trong hệ thống.</Text>
      {loading && <ActivityIndicator color={colors.primary} size="large" />}
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      {!loading && certificates.length === 0 && !loadError ? <Text style={styles.empty}>Chưa có chứng chỉ đang hoạt động.</Text> : null}
      {certificates.map(item => {
        const active = selected?.id === item.id;
        return <TouchableOpacity key={item.id} style={[styles.card, active && styles.cardActive]} onPress={() => setSelected(item)} activeOpacity={0.8}>
          <View style={[styles.icon, active && styles.iconActive]}><MaterialIcons name="workspace-premium" size={24} color={active ? '#fff' : colors.primary} /></View>
          <View style={styles.copy}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.cardMeta}>{item.provider} · {item.code}</Text><Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text></View>
          <MaterialIcons name={active ? 'check-circle' : 'radio-button-unchecked'} size={22} color={active ? colors.primary : '#c7c4d8'} />
        </TouchableOpacity>;
      })}
    </ScrollView>
    <View style={styles.bottom}><TouchableOpacity disabled={!selected} style={[styles.button, !selected && styles.buttonDisabled]} onPress={next}><Text style={styles.buttonText}>Tiếp tục</Text><MaterialIcons name="arrow-forward" size={20} color="#fff" /></TouchableOpacity></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' }, header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, step: { fontSize: 13, fontWeight: '700', color: '#777587' },
  progress: { height: 4, backgroundColor: '#e6e8ea' }, progressFill: { height: 4, backgroundColor: colors.primary }, content: { padding: spacing.lg, paddingBottom: 120 },
  title: { fontSize: 25, fontWeight: '800', color: '#191c1e', marginTop: 12 }, subtitle: { color: '#464555', marginTop: 8, marginBottom: 24, lineHeight: 20 },
  card: { borderWidth: 1, borderColor: '#c7c4d8', borderRadius: 13, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }, cardActive: { borderColor: colors.primary, borderWidth: 2 },
  icon: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#f0efff', alignItems: 'center', justifyContent: 'center' }, iconActive: { backgroundColor: colors.primary }, copy: { flex: 1 }, cardTitle: { fontSize: 14, fontWeight: '800', color: '#191c1e' }, cardMeta: { marginTop: 3, fontSize: 12, fontWeight: '700', color: colors.primary }, cardDescription: { marginTop: 5, fontSize: 12, lineHeight: 17, color: '#464555' },
  error: { padding: spacing.md, borderRadius: 10, backgroundColor: '#fff0f0', color: '#b42318' }, empty: { padding: spacing.md, borderRadius: 10, backgroundColor: '#fff8e7', color: '#7a5200' },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e6e8ea' }, button: { height: 50, backgroundColor: colors.primary, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, buttonDisabled: { opacity: 0.4 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
