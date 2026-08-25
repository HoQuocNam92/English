import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

export default function EntryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="school" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>TechEnglish Pro</Text>
        <Text style={styles.subtitle}>Tiếng Anh chuyên ngành Công nghệ thông tin</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => router.push('/(auth)/login' as any)}>
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => router.push('/(onboarding)/level' as any)}>
          <Text style={styles.secondaryButtonText}>Bắt đầu thiết lập lộ trình mới</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.textButton} activeOpacity={0.8} onPress={() => router.push('/(tabs)/home' as any)}>
          <Text style={styles.textButtonText}>Vào thẳng trang chủ (Demo Mode)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingVertical: 60
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    maxWidth: 260
  },
  actionsContainer: {
    gap: spacing.md,
    width: '100%'
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  secondaryButton: {
    backgroundColor: '#EEF2FF',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  textButtonText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '600'
  }
});
