import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FieldOption {
  id: string;       // domain code khớp với BE (CLOUD, DEVOPS, ...)
  name: string;
  desc: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const fields: FieldOption[] = [
  { id: 'CLOUD', name: 'Cloud Computing (AWS / GCP / Azure)', desc: 'Compute, S3/Blob Storage, IAM Policies, VPC Networking.', icon: 'cloud-queue' },
  { id: 'DEVOPS', name: 'DevOps, CI/CD & Kubernetes', desc: 'Docker containers, GitHub Actions, Helm charts, monitoring.', icon: 'all-inclusive' },
  { id: 'CYBERSEC', name: 'Cybersecurity & InfoSec', desc: 'Threat vectors, cryptographic terms, OAuth/JWT, compliance.', icon: 'security' },
  { id: 'SOFTWARE_ENG', name: 'Software Engineering & Microservices', desc: 'REST APIs, Clean Architecture, Design Patterns, gRPC.', icon: 'code' },
  { id: 'DATA_ENG', name: 'Data Engineering & Analytics', desc: 'BigQuery, ETL pipelines, distributed data stores, schemas.', icon: 'storage' },
];

export default function OnboardingFieldScreen() {
  const router = useRouter();
  const [selectedFields, setSelectedFields] = useState<string[]>(['CLOUD']);

  const toggleField = (id: string) => {
    setSelectedFields(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    const toSave = selectedFields.length > 0 ? selectedFields : ['CLOUD'];
    await AsyncStorage.setItem('onboarding_domains', JSON.stringify(toSave));
    router.push('/(onboarding)/career-goal' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Bước 2 / 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Lĩnh vực CNTT trọng tâm của bạn?</Text>
        <Text style={styles.subtitle}>Chọn một hoặc nhiều lĩnh vực — TechEnglish sẽ ưu tiên nội dung phù hợp nhất.</Text>

        <View style={styles.optionsList}>
          {fields.map((f) => {
            const isSelected = selectedFields.includes(f.id);
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => toggleField(f.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <MaterialIcons name={f.icon} size={22} color={isSelected ? colors.primary : colors.mutedText} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.fieldName, isSelected && styles.fieldNameSelected]}>{f.name}</Text>
                  <Text style={styles.fieldDesc}>{f.desc}</Text>
                </View>
                {isSelected && <MaterialIcons name="check-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextButton, selectedFields.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedFields.length === 0}
        >
          <Text style={styles.nextButtonText}>Tiếp tục</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
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
    borderWidth: 1.5, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: spacing.md
  },
  optionCardSelected: { borderColor: colors.primary, backgroundColor: '#f5f3ff' },
  iconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  iconBoxSelected: { backgroundColor: '#ede9fe' },
  optionContent: { flex: 1 },
  fieldName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  fieldNameSelected: { color: colors.primary },
  fieldDesc: { fontSize: 12, color: colors.mutedText, lineHeight: 16 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: spacing.lg, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  nextButton: { backgroundColor: colors.primary, height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  nextButtonDisabled: { backgroundColor: '#cbd5e1' },
  nextButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' }
});
