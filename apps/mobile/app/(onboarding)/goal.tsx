import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '@techenglish/design-tokens';

type Goal = 'certification' | 'vocabulary';

const OPTIONS: Array<{ id: Goal; title: string; description: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { id: 'certification', title: 'Luyện chứng chỉ CNTT', description: 'Học theo Domain, Topic, từ vựng và Quiz của chứng chỉ.', icon: 'workspace-premium' },
  { id: 'vocabulary', title: 'Luyện từ vựng CNTT', description: 'Tập trung từ vựng theo lĩnh vực chuyên ngành.', icon: 'translate' },
];

export default function OnboardingGoalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<Goal | null>(null);

  const next = async () => {
    if (!selected) return;
    await AsyncStorage.multiSet([
      ['onboarding_goal', selected],
      ['onboarding_domains', '[]'],
      ['onboarding_certificate_code', ''],
      ['onboarding_certificate_id', ''],
    ]);
    router.push(selected === 'certification' ? '/(onboarding)/certificate' as any : '/(onboarding)/it-field' as any);
  };

  return <View style={styles.container}>
    <StatusBar style="dark" />
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}><Text style={styles.brand}>TechEnglish Pro</Text><Text style={styles.step}>Bước 1/4</Text></View>
    <View style={styles.progress}><View style={[styles.progressFill, { width: '25%' }]} /></View>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Bạn muốn học theo hướng nào?</Text>
      <Text style={styles.subtitle}>Chọn một mục tiêu chính. Bạn có thể thay đổi sau trong hồ sơ.</Text>
      {OPTIONS.map(item => {
        const active = selected === item.id;
        return <TouchableOpacity key={item.id} style={[styles.card, active && styles.cardActive]} onPress={() => setSelected(item.id)} activeOpacity={0.8}>
          <View style={[styles.icon, active && styles.iconActive]}><MaterialIcons name={item.icon} size={26} color={active ? '#fff' : colors.primary} /></View>
          <View style={styles.copy}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardDescription}>{item.description}</Text></View>
          <MaterialIcons name={active ? 'check-circle' : 'radio-button-unchecked'} size={22} color={active ? colors.primary : colors.outline} />
        </TouchableOpacity>;
      })}
      <View style={styles.zeroNote}><MaterialIcons name="restart-alt" size={20} color={colors.primary} /><Text style={styles.zeroText}>Tài khoản mới luôn bắt đầu với tiến trình 0%.</Text></View>
    </ScrollView>
    <View style={[styles.bottom, { paddingBottom: Math.max(16, insets.bottom + 12) }]}><TouchableOpacity disabled={!selected} style={[styles.button, !selected && styles.buttonDisabled]} onPress={next}><Text style={styles.buttonText}>Tiếp tục</Text><MaterialIcons name="arrow-forward" size={20} color="#fff" /></TouchableOpacity></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { fontSize: 15, fontWeight: '800', color: colors.primary }, step: { fontSize: 13, fontWeight: '700', color: '#777587' },
  progress: { height: 4, backgroundColor: '#e6e8ea' }, progressFill: { height: 4, backgroundColor: colors.primary },
  content: { flexGrow: 1, padding: spacing.lg, paddingTop: 36 }, title: { fontSize: 26, fontWeight: '800', color: '#191c1e' }, subtitle: { marginTop: 8, marginBottom: 28, color: '#464555', lineHeight: 20 },
  card: { minHeight: 124, borderWidth: 1, borderColor: '#e4e8f1', borderRadius: 20, padding: spacing.md, marginBottom: spacing.md, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardActive: { borderColor: colors.primary, borderWidth: 2 }, icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f0efff', justifyContent: 'center', alignItems: 'center' }, iconActive: { backgroundColor: colors.primary },
  copy: { flex: 1 }, cardTitle: { fontSize: 16, fontWeight: '800', color: '#191c1e' }, cardDescription: { marginTop: 6, fontSize: 13, color: '#464555', lineHeight: 19 },
  zeroNote: { marginTop: 8, borderRadius: 12, backgroundColor: '#f0efff', padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, zeroText: { flex: 1, fontSize: 13, color: '#464555' },
  bottom: { padding: spacing.md, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e6e8ea' }, button: { height: 50, backgroundColor: colors.primary, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, buttonDisabled: { opacity: 0.4 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
