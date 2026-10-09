import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, ScrollView } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../src/shared/api/api-client';

interface FieldOption {
  id: string;
  code: string;
  name: string;
  description: string;
}

const iconForDomain = (code: string): keyof typeof MaterialIcons.glyphMap => ({
  CLOUD: 'cloud', CYBERSEC: 'security', NETWORKING: 'router', DATA_ENG: 'storage', DATA_SCI: 'insights', SOFTWARE_ENG: 'code', DEVOPS: 'settings-suggest',
}[code] as keyof typeof MaterialIcons.glyphMap) || 'terminal';

export default function OnboardingFieldScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fields, setFields] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api.get<{ data: FieldOption[] }>('/domains?activeOnly=true')
      .then(response => setFields(response?.data ?? []))
      .catch(() => setLoadError('Không thể tải danh sách lĩnh vực.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleField = (id: string) => {
    setSelectedFields(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    await AsyncStorage.setItem('onboarding_domains', JSON.stringify(selectedFields));
    router.push('/(onboarding)/level' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.stepText}>Bước 2 / 4</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '50%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lĩnh vực bạn quan tâm?</Text>
        <Text style={styles.subtitle}>Chọn chuyên ngành CNTT bạn muốn tập trung học tiếng Anh.</Text>

        {loading && <ActivityIndicator color={colors.primary} size="large" />}
        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

        <View style={styles.gridContainer}>
          {fields.map((f) => {
            const isSelected = selectedFields.includes(f.code);
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                onPress={() => toggleField(f.code)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <MaterialIcons name={iconForDomain(f.code)} size={24} color={isSelected ? colors.primary : '#464555'} />
                </View>
                <Text style={[styles.fieldName, isSelected && styles.fieldNameSelected]}>{f.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(16, insets.bottom + 12) }]}>
        <TouchableOpacity
          style={[styles.nextButton, selectedFields.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedFields.length === 0}
        >
          <Text style={[styles.nextButtonText, selectedFields.length === 0 && styles.nextButtonTextDisabled]}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: '#ffffff'
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  backButton: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f2f4f6',
    borderRadius: 20
  },
  headerSpacer: {
    width: 40,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777587'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e6e8ea',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4
  },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.md, paddingBottom: 100 },
  title: { fontSize: 30, fontWeight: '700', color: '#191c1e', marginBottom: spacing.xs, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#464555', marginBottom: spacing.xl, lineHeight: 20 },
  errorText: { color: '#b42318', backgroundColor: '#fff0f0', padding: spacing.md, borderRadius: 14, marginBottom: spacing.md },
  
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  gridItem: {
    width: '48%', // approx half width minus gap
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e4e8f1',
    alignItems: 'flex-start',
    minHeight: 120
  },
  gridItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#e2dfff'
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eceef0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  iconBoxSelected: {
    backgroundColor: '#ffffff'
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    lineHeight: 20
  },
  fieldNameSelected: {
    color: '#191c1e' // per design
  },
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#ffffff', 
    padding: spacing.lg, 
    paddingBottom: 32, // safearea
    borderTopWidth: 1, 
    borderTopColor: '#eceef0' 
  },
  nextButton: { 
    backgroundColor: colors.primary, 
    height: 48, 
    borderRadius: 14,
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  nextButtonDisabled: { 
    backgroundColor: '#e6e8ea',
    shadowOpacity: 0,
    elevation: 0
  },
  nextButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  nextButtonTextDisabled: { color: '#464555' }
});
