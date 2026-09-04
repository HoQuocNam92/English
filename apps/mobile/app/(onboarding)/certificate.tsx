import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../src/shared/api/api-client';

interface CertOption {
  id: string;   // certificate code khớp với BE (AWS-SAA, CKA, ...)
  name: string;
  code: string;
  provider: string;
  level: string;
}

const certs: CertOption[] = [
  { id: 'AWS-SAA', name: 'AWS Certified Solutions Architect Associate', code: 'SAA-C03', provider: 'Amazon Web Services', level: 'Associate' },
  { id: 'AWS-DVA', name: 'AWS Certified Developer Associate', code: 'DVA-C02', provider: 'Amazon Web Services', level: 'Associate' },
  { id: 'CKA', name: 'Certified Kubernetes Administrator', code: 'CKA', provider: 'CNCF', level: 'Professional' },
  { id: 'CompTIA Security+', name: 'CompTIA Security+', code: 'SY0-701', provider: 'CompTIA', level: 'Intermediate' },
  { id: 'GCP-ACE', name: 'Google Cloud Associate Cloud Engineer', code: 'GCP-ACE', provider: 'Google Cloud', level: 'Associate' },
  { id: 'Azure AZ-900', name: 'Microsoft Azure Fundamentals', code: 'AZ-900', provider: 'Microsoft', level: 'Foundational' },
];

export default function OnboardingCertificateScreen() {
  const router = useRouter();
  const [selectedCert, setSelectedCert] = useState('AWS-SAA');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Đọc các lựa chọn từ các bước trước
      const [levelCode, domainsRaw, careerGoalCode] = await Promise.all([
        AsyncStorage.getItem('onboarding_level'),
        AsyncStorage.getItem('onboarding_domains'),
        AsyncStorage.getItem('onboarding_career_goal'),
      ]);

      const domainCodes: string[] = domainsRaw ? JSON.parse(domainsRaw) : ['CLOUD'];

      // Gọi API hoàn tất onboarding
      await api.post('/learner-profiles/me/complete-onboarding', {
        levelCode: levelCode ?? 'intermediate',
        domainCodes,
        careerGoalCode: careerGoalCode ?? undefined,
        certificateCode: selectedCert,
        weeklyStudyTargetMinutes: 120,
      });

      // Xóa dữ liệu onboarding tạm
      await AsyncStorage.multiRemove([
        'onboarding_level',
        'onboarding_domains',
        'onboarding_career_goal',
      ]);

      router.replace('/(tabs)/home' as any);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message ?? 'Không thể hoàn tất onboarding. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Bước 4 / 4 - Hoàn tất</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Chứng chỉ mục tiêu của bạn?</Text>
        <Text style={styles.subtitle}>
          Bạn có thể thay đổi mục tiêu bất kỳ lúc nào trong cài đặt hồ sơ.
        </Text>

        <View style={styles.optionsList}>
          {certs.map((c) => {
            const isSelected = selectedCert === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedCert(c.id)}
                activeOpacity={0.8}
              >
                <View style={styles.certHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{c.code}</Text>
                  </View>
                  <Text style={styles.providerText}>{c.provider}</Text>
                </View>
                <Text style={[styles.certName, isSelected && styles.certNameSelected]}>{c.name}</Text>
                <Text style={styles.levelText}>Cấp độ: {c.level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.finishButtonText}>Bắt đầu học ngay</Text>
              <MaterialIcons name="rocket-launch" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: spacing.lg, paddingTop: 50, paddingBottom: 100 },
  progressHeader: { marginBottom: spacing.lg },
  stepIndicator: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  progressBar: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 13, color: colors.mutedText, marginBottom: spacing.lg, lineHeight: 18 },
  optionsList: { gap: spacing.md },
  optionCard: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: spacing.md,
    borderWidth: 1.5, borderColor: '#e2e8f0', gap: spacing.xs
  },
  optionCardSelected: { borderColor: colors.primary, backgroundColor: '#f5f3ff' },
  certHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#fde68a' },
  codeText: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  providerText: { fontSize: 12, color: colors.mutedText },
  certName: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },
  certNameSelected: { color: colors.primary },
  levelText: { fontSize: 12, color: colors.mutedText },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: spacing.lg, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  finishButton: { backgroundColor: colors.primary, height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  finishButtonText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' }
});

