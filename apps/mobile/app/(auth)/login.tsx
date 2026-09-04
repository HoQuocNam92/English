import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '@techenglish/design-tokens';
import { useAuth } from '../../src/shared/store/auth-context';
import { validateEmail } from '../../src/shared/utils/validators';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { api } from '../../src/shared/api/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </Svg>
  );
}

export default function MobileLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest(
    GOOGLE_CLIENT_ID
      ? { clientId: GOOGLE_CLIENT_ID }
      : null as any
  );

  // Password rules
  const rules = [
    { label: 'Ít nhất 8 ký tự', ok: password.length >= 8 },
    { label: 'Có chữ hoa (A-Z)', ok: /[A-Z]/.test(password) },
    { label: 'Có chữ số (0-9)', ok: /[0-9]/.test(password) },
    { label: 'Có ký tự đặc biệt (!@#...)', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const showRules = passwordFocused && password.length > 0;

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    try {
      const result = await api.post<any>('/auth/google/mobile', { idToken });
      // Lưu token vào AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('access_token', result.accessToken),
        AsyncStorage.setItem('refresh_token', result.refreshToken ?? ''),
      ]);
      router.replace('/(tabs)/home' as any);
    } catch (err: any) {
      Alert.alert('Lỗi đăng nhập Google', err.message ?? 'Không thể xác thực với Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    const emailErr = validateEmail(email);
    if (emailErr) setEmailError(emailErr);

    let passErr = '';
    if (!password) passErr = 'Mật khẩu không được để trống';
    else if (password.length < 8) passErr = 'Mật khẩu phải có ít nhất 8 ký tự';

    if (passErr) setPasswordError(passErr);
    if (emailErr || passErr) return;

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/home' as any);
    } catch (err: any) {
      setLoginError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
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
        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
            <MaterialIcons name="mail-outline" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="nhapemail@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>
          {emailError ? <Text style={styles.errorTextSmall}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
            <MaterialIcons name="lock-outline" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isLoading}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorTextSmall}>{passwordError}</Text> : null}

          {/* Password requirements */}
          {showRules && (
            <View style={styles.rulesBox}>
              {rules.map((r) => (
                <View key={r.label} style={styles.ruleRow}>
                  <MaterialIcons
                    name={r.ok ? 'check-circle' : 'radio-button-unchecked'}
                    size={14}
                    color={r.ok ? '#16a34a' : '#94a3b8'}
                  />
                  <Text style={[styles.ruleText, r.ok && styles.ruleTextOk]}>{r.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/(auth)/forgot-password' as any)} disabled={isLoading}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} activeOpacity={0.8} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        {/* Google login — chỉ hiện nếu có Client ID */}
        {GOOGLE_CLIENT_ID ? (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.8}
              onPress={() => promptAsync()}
              disabled={!request || isLoading}
            >
              <GoogleIcon />
              <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
            </TouchableOpacity>
          </>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)} disabled={isLoading}>
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
    color: colors.onPrimary,
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
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  errorTextSmall: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1
  },
  rulesBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: spacing.sm,
    gap: 6,
    marginTop: 4
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  ruleText: {
    fontSize: 12,
    color: '#94a3b8'
  },
  ruleTextOk: {
    color: '#16a34a'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8'
  },
  googleButton: {
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0'
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155'
  }
});

