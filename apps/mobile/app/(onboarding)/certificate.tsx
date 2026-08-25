import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

interface CertOption {
  id: string;
  name: string;
  code: string;
  provider: string;
  level: string;
}

const certs: CertOption[] = [
  {
    id: 'aws-ccp',
    name: 'AWS Certified Cloud Practitioner',
    code: 'CLF-C02',
    provider: 'Amazon Web Services',
    level: 'Foundational'
  },
  {
    id: 'aws-saa',
    name: 'AWS Certified Solutions Architect Associate',
    code: 'SAA-C03',
    provider: 'Amazon Web Services',
    level: 'Associate'
  },
  {
    id: 'comptia-sec',
    name: 'CompTIA Security+',
    code: 'SY0-701',
    provider: 'CompTIA',
    level: 'Intermediate'
  },
  {
    id: 'gcp-pde',
    name: 'Google Professional Data Engineer',
    code: 'GCP-PDE',
    provider: 'Google Cloud',
    level: 'Professional'
  }
];

export default function OnboardingCertificateScreen() {
  const router = useRouter();
  const [selectedCert, setSelectedCert] = useState('aws-ccp');

  const handleFinish = () => {
    router.replace('/(tabs)/home' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress header */}
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

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Bắt đầu học ngay</Text>
          <MaterialIcons name="rocket-launch" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 50,
    paddingBottom: 100
  },
  progressHeader: {
    marginBottom: spacing.lg
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: spacing.lg,
    lineHeight: 18
  },
  optionsList: {
    gap: spacing.md
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f5f3ff'
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  codeBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a'
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400e'
  },
  providerText: {
    fontSize: 12,
    color: colors.mutedText
  },
  certName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4
  },
  certNameSelected: {
    color: colors.primary
  },
  levelText: {
    fontSize: 12,
    color: colors.mutedText
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  finishButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  }
});
