import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

export default function MobileLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('nam.learner@techenglish.edu.vn');
  const [password, setPassword] = useState('Learner@123456');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.replace('/(tabs)/home' as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="school" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>TechEnglish Pro</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình học tiếng Anh CNTT của bạn.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="mail-outline" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="nhapemail@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} activeOpacity={0.8} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    textAlign: 'center',
    maxWidth: 280
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: spacing.md
  },
  inputGroup: {
    gap: spacing.xs
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm,
    height: 48
  },
  inputIcon: {
    marginRight: spacing.xs
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text
  },
  eyeIcon: {
    padding: spacing.xs
  },
  forgotPassword: {
    alignSelf: 'flex-end'
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  },
  loginButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  footerText: {
    fontSize: 13,
    color: colors.mutedText
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  }
});
