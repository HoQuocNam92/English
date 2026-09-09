import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FieldOption {
  id: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const fields: FieldOption[] = [
  { id: 'CLOUD', name: 'Cloud Computing', icon: 'cloud' },
  { id: 'CYBERSEC', name: 'Cybersecurity', icon: 'security' },
  { id: 'NETWORKING', name: 'Networking', icon: 'router' },
  { id: 'DATA_ENG', name: 'Data Engineering', icon: 'storage' },
  { id: 'SOFTWARE_ENG', name: 'Software Engineering', icon: 'code' },
  { id: 'DEVOPS', name: 'DevOps', icon: 'settings-suggest' },
];

export default function OnboardingFieldScreen() {
  const router = useRouter();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

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
      
      {/* Top Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.stepText}>Bước 2 / 4</Text>
          <View style={{ width: 40 }} /> {/* Spacer */}
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '50%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lĩnh vực bạn quan tâm?</Text>
        <Text style={styles.subtitle}>Chọn chuyên ngành CNTT bạn muốn tập trung học tiếng Anh.</Text>

        <View style={styles.gridContainer}>
          {fields.map((f) => {
            const isSelected = selectedFields.includes(f.id);
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                onPress={() => toggleField(f.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <MaterialIcons name={f.icon} size={24} color={isSelected ? colors.primary : '#464555'} />
                </View>
                <Text style={[styles.fieldName, isSelected && styles.fieldNameSelected]}>{f.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomBar}>
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
    borderColor: '#c7c4d8',
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
    borderRadius: 10, 
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
