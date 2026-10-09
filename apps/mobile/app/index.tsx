import { Text, TouchableOpacity } from '../src/shared/ui/primitives';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '../src/shared/ui/AppIcon';
import { colors, spacing } from '@techenglish/design-tokens';
import { useAuth } from '../src/shared/store/auth-context';

export default function EntryScreen() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.primary} /></View>;
  if (isLoggedIn) return <Redirect href="/(tabs)/home" />;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.logoContainer}>
        <Image source={require('../assets/icon.png')} style={{ width: 96, height: 96, borderRadius: 24, marginBottom: spacing.md }} accessibilityLabel="Logo Tech English" />
        <Text style={styles.title}>Tech English</Text>
        <Text style={styles.subtitle}>Tiếng Anh chuyên ngành Công nghệ thông tin</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => router.push('/(auth)/login' as any)}>
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)} style={{ paddingVertical: 12 }}><Text style={{ textAlign: 'center', color: colors.primary, fontWeight: '700' }}>Chưa có tài khoản? Đăng ký ngay</Text></TouchableOpacity>
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
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700'
  }
});
