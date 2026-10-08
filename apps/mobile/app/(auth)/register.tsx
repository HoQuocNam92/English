import { Text, TextInput, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, View, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '@techenglish/design-tokens';
import { api, ApiError } from '../../src/shared/api/api-client';
import { validateEmail, validatePassword, validateDisplayName } from '../../src/shared/utils/validators';
import { useAuth } from '../../src/shared/store/auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </Svg>;
}

export default function MobileRegisterScreen() {
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const confirmPasswordRef = useRef<any>(null);
  const [request, response, promptAsync] = Google.useAuthRequest(
    GOOGLE_WEB_CLIENT_ID
      ? { clientId: GOOGLE_WEB_CLIENT_ID, androidClientId: GOOGLE_ANDROID_CLIENT_ID ?? GOOGLE_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID ?? GOOGLE_CLIENT_ID, webClientId: GOOGLE_WEB_CLIENT_ID, scopes: ['openid', 'profile', 'email'] }
      : null as any
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken ?? response.params.id_token;
      if (idToken) void handleGoogleRegister(idToken);
      else Alert.alert('Lỗi đăng ký Google', 'Google không trả về ID token. Vui lòng thử lại.');
    } else if (response?.type === 'error') {
      Alert.alert('Lỗi đăng ký Google', response.error?.message ?? 'Không thể xác thực với Google.');
    }
  }, [response]);

  const handleGoogleRegister = async (idToken: string) => {
    setIsLoading(true);
    try {
      const result = await api.post<any>('/auth/google/mobile', { idToken });
      await loginWithTokens(result);
      router.replace('/(onboarding)/goal' as any);
    } catch (err: any) {
      Alert.alert('Lỗi đăng ký Google', err.message ?? 'Không thể xác thực với Google.');
    } finally { setIsLoading(false); }
  };

  const startGoogleRegister = async () => {
    if (Platform.OS === 'web') {
      try { await promptAsync(); }
      catch (err: any) { Alert.alert('Lỗi đăng ký Google', err.message ?? 'Không thể mở Google.'); }
      return;
    }
    if (Constants.appOwnership === 'expo') {
      Alert.alert('Cần bản cài ứng dụng', 'Đăng ký Google không hỗ trợ Expo Go. Hãy mở bản development build hoặc APK TechEnglish Pro.');
      return;
    }
    setIsLoading(true);
    try {
      const { GoogleSignin, isSuccessResponse, statusCodes, isErrorWithCode } = await import('@react-native-google-signin/google-signin');
      GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}) });
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const result = await GoogleSignin.signIn();
        if (!isSuccessResponse(result)) return;
        if (!result.data.idToken) throw new Error('Google không trả về ID token. Kiểm tra Web client ID.');
        await handleGoogleRegister(result.data.idToken);
      } catch (err) {
        if (isErrorWithCode(err) && (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS)) return;
        throw err;
      }
    } catch (err: any) {
      Alert.alert('Lỗi đăng ký Google', err.message ?? 'Không thể xác thực với Google.');
    } finally { setIsLoading(false); }
  };

  const handleRegister = async () => {
    if (isLoading) return;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setTermsError('');
    setRegisterError('');

    const nameErr = validateDisplayName(displayName);
    if (nameErr) setNameError(nameErr);
    
    const emailErr = validateEmail(email);
    if (emailErr) setEmailError(emailErr);
    
    const passErr = validatePassword(password);
    if (passErr) setPasswordError(passErr);
    
    let confErr = '';
    if (password !== confirmPassword) {
      confErr = 'Mật khẩu xác nhận không khớp';
      setConfirmError(confErr);
    }

    if (!agreeTerms) {
      setTermsError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
    }

    if (nameErr || emailErr || passErr || confErr || !agreeTerms) return;

    setIsLoading(true);
    try {
      const result = await api.post<any>('/auth/register', {
        displayName: displayName.trim(), email: email.trim().toLowerCase(), password,
      });
      await loginWithTokens(result);
      router.replace('/(onboarding)/goal' as any);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setRegisterError(err.message);
      } else {
        setRegisterError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header Bar */}
      <View style={[styles.headerBar, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)} disabled={isLoading}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TechEnglish Pro</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Nền tảng học tiếng Anh chuyên ngành CNTT</Text>
        </View>

        <View style={styles.card}>
          {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={[styles.inputWrapper, nameError ? styles.inputError : null]}>
              <MaterialIcons name="person-outline" size={20} color={colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên của bạn"
                value={displayName}
                onChangeText={setDisplayName}
                autoComplete="name"
                returnKeyType="next"
                editable={!isLoading}
              />
            </View>
            {nameError ? <Text style={styles.errorTextSmall}>{nameError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
              <MaterialIcons name="mail-outline" size={20} color={colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
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
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isLoading} focusable={false}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorTextSmall}>{passwordError}</Text> : null}
            <Text style={styles.passwordHint}>Mật khẩu tối thiểu 6 ký tự (nên chứa chữ hoa, chữ số và ký tự đặc biệt).</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={[styles.inputWrapper, confirmError ? styles.inputError : null]}>
              <MaterialIcons name="lock-outline" size={20} color={colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                ref={confirmPasswordRef}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                returnKeyType="done"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} disabled={isLoading} focusable={false}>
                <MaterialIcons name={showConfirmPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>
            {confirmError ? <Text style={styles.errorTextSmall}>{confirmError}</Text> : null}
          </View>

          <View style={styles.termsRow}>
            <TouchableOpacity
              style={styles.termsCheckbox}
              onPress={() => { setAgreeTerms(value => !value); setTermsError(''); }}
              disabled={isLoading}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeTerms }}
              accessibilityLabel="Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật"
            >
              <MaterialIcons name={agreeTerms ? 'check-box' : 'check-box-outline-blank'} size={20} color={agreeTerms ? colors.primary : colors.outline} />
            </TouchableOpacity>
            <Text style={styles.termsText}>Tôi đồng ý với <Text focusable={false} onPress={() => router.push('/terms' as any)} style={styles.termsLink}>Điều khoản dịch vụ</Text> và <Text focusable={false} onPress={() => router.push('/privacy' as any)} style={styles.termsLink}>Chính sách bảo mật</Text> của hệ thống</Text>
          </View>
          {termsError ? <Text style={styles.errorTextSmall}>{termsError}</Text> : null}

          <TouchableOpacity style={styles.registerButton} activeOpacity={0.8} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.registerButtonText}>Đang tạo tài khoản...</Text>
              </>
            ) : (
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} disabled={isLoading}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

          {GOOGLE_WEB_CLIENT_ID ? <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity style={styles.googleButton} activeOpacity={0.8} onPress={startGoogleRegister} disabled={isLoading || (Platform.OS === 'web' && !request)}>
              <GoogleIcon />
              <Text style={styles.googleButtonText}>Đăng ký bằng Google</Text>
            </TouchableOpacity>
          </> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  headerBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 40
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center'
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
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
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
  registerButton: {
    backgroundColor: colors.primary,
    gap: spacing.sm,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  registerButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  termsCheckbox: {
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.mutedText,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  googleButton: { height: 48, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#e2e8f0' },
  googleButtonText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  footerText: {
    fontSize: 14,
    color: colors.mutedText
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
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
  passwordHint: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1
  }
});
