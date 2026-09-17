import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../src/shared/api/api-client';

interface Certificate {
  id: string;
  code: string;
  name: string;
  provider: string;
  description: string;
}

// Icon mapping based on cert provider/code keywords
const getCertIcon = (code: string, provider: string): keyof typeof MaterialIcons.glyphMap => {
  const combined = `${code} ${provider}`.toUpperCase();
  if (combined.includes('AWS') || combined.includes('AMAZON')) return 'cloud';
  if (combined.includes('AZURE') || combined.includes('MICROSOFT')) return 'cloud-queue';
  if (combined.includes('GCP') || combined.includes('GOOGLE')) return 'cloud-circle';
  if (combined.includes('CISCO') || combined.includes('CCNA')) return 'router';
  if (combined.includes('SECURITY') || combined.includes('COMPTIA')) return 'security';
  if (combined.includes('KUBERNETES') || combined.includes('CKA')) return 'hub';
  if (combined.includes('LINUX') || combined.includes('LFCS')) return 'terminal';
  if (combined.includes('GITHUB')) return 'code';
  return 'workspace-premium';
};

export default function OnboardingCertificateScreen() {
  const router = useRouter();
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Certificate[]>('/certificates')
      .then(data => {
        setCerts(Array.isArray(data) ? data : []);
      })
      .catch(() => setCerts([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleCert = (code: string) => {
    setSelectedCerts(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const [levelCode, domainsRaw, careerGoalsRaw] = await Promise.all([
        AsyncStorage.getItem('onboarding_level'),
        AsyncStorage.getItem('onboarding_domains'),
        AsyncStorage.getItem('onboarding_career_goals'),
      ]);

      const domainCodes: string[] = domainsRaw ? JSON.parse(domainsRaw) : ['CLOUD'];
      const careerGoalCodes: string[] = careerGoalsRaw ? JSON.parse(careerGoalsRaw) : [];

      await api.post('/learner-profiles/me/complete-onboarding', {
        levelCode: levelCode ?? 'intermediate',
        domainCodes,
        careerGoalCodes: careerGoalCodes.length > 0 ? careerGoalCodes : undefined,
        certificateCodes: selectedCerts.length > 0 ? selectedCerts : undefined,
        weeklyStudyTargetMinutes: 120,
      });

      await AsyncStorage.multiRemove([
        'onboarding_level',
        'onboarding_domains',
        'onboarding_career_goals',
      ]);

      router.replace('/(tabs)/home' as any);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message ?? 'Không thể hoàn tất onboarding. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hoàn tất thiết lập</Text>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>4/4</Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.stepDotRow}>
            <Text style={styles.stepText}>BƯỚC 4/4</Text>
            <View style={styles.dot} />
            <Text style={styles.stepSubText}>Mục tiêu cuối cùng</Text>
          </View>
        </View>

        <Text style={styles.title}>Chứng chỉ IT mục tiêu?</Text>
        <Text style={styles.subtitle}>Chọn chứng chỉ bạn muốn ôn luyện. Có thể chọn nhiều hoặc bỏ qua.</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách chứng chỉ...</Text>
          </View>
        ) : (
          <View style={styles.optionsList}>
            {certs.map((c) => {
              const isSelected = selectedCerts.includes(c.code);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => toggleCert(c.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionContentRow}>
                    <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                      <MaterialIcons name={getCertIcon(c.code, c.provider)} size={22} color={isSelected ? colors.primary : '#464555'} />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <View style={styles.optionTitleRow}>
                        <Text style={styles.certName}>{c.name}</Text>
                        {isSelected ? (
                          <View style={styles.checkIconActive}>
                            <MaterialIcons name="check" size={16} color="#ffffff" />
                          </View>
                        ) : (
                          <View style={styles.checkIconInactive} />
                        )}
                      </View>
                      <Text style={styles.certDesc}>{c.provider}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.insightBanner}>
          <MaterialIcons name="insights" size={20} color={colors.primary} />
          <Text style={styles.insightText}>Lộ trình sẽ tích hợp bài đọc tài liệu kỹ thuật & từ vựng tương ứng với <Text style={{fontWeight: '700', color: '#191c1e'}}>chứng chỉ đã chọn</Text>.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.finishButtonText}>
                {selectedCerts.length === 0 ? 'Bỏ qua & Bắt đầu học' : 'Hoàn tất & Bắt đầu học'}
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.bottomHint}>Bạn có thể thay đổi mục tiêu bất kỳ lúc nào trong cài đặt</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#ffffff',
    marginTop: 40 // safearea
  },
  backButton: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -8
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e'
  },
  stepBadge: {
    backgroundColor: '#e2dfff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#e6e8ea',
    width: '100%'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollContent: { padding: spacing.md, paddingBottom: 120 },
  headerRow: { marginBottom: spacing.sm },
  stepDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  stepText: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#c7c4d8' },
  stepSubText: { fontSize: 12, color: '#464555' },
  title: { fontSize: 24, fontWeight: '700', color: '#191c1e', marginBottom: spacing.xs, letterSpacing: -0.2 },
  subtitle: { fontSize: 14, color: '#464555', marginBottom: spacing.lg, lineHeight: 20 },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: spacing.sm, fontSize: 14, color: '#464555' },
  optionsList: { gap: spacing.sm },
  optionCard: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: '#c7c4d8'
  },
  optionCardSelected: { borderColor: colors.primary, backgroundColor: '#ffffff', borderWidth: 2 },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },
  iconBoxSelected: { backgroundColor: '#e2dfff' },
  optionTextContainer: {
    flex: 1,
    paddingRight: 4
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  certName: { fontSize: 14, fontWeight: '600', color: '#191c1e', flex: 1, paddingRight: 8 },
  certDesc: { fontSize: 12, color: '#464555', lineHeight: 18 },
  checkIconActive: {
    width: 20, height: 20,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkIconInactive: {
    width: 20, height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  insightBanner: {
    marginTop: spacing.xl,
    padding: spacing.sm,
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: '#e6e8ea',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  insightText: {
    fontSize: 12,
    color: '#464555',
    flex: 1,
    lineHeight: 18
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    paddingBottom: 32, // safearea
    borderTopWidth: 1,
    borderTopColor: '#e6e8ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4
  },
  finishButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs
  },
  finishButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  bottomHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777587'
  }
});
