import { RequiredMark } from '../../src/shared/ui/RequiredMark';
import { Button, Text, TextInput, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { colors, spacing } from '@techenglish/design-tokens';
import { api, ApiError } from '../../src/shared/api/api-client';
import { validateRegistrationEmail, validatePassword, validateDisplayName } from '../../src/shared/utils/validators';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function MobileRegisterScreen() {
  const router = useRouter();
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
    
    const emailErr = validateRegistrationEmail(email);
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
      await api.post('/auth/register', {
        displayName: displayName.trim(), email: email.trim().toLowerCase(), password,
      });
      Alert.alert('Đăng ký thành công', 'Vui lòng đăng nhập để tiếp tục.');
      router.replace('/(auth)/login' as any);
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
            <Text style={styles.label}>Họ và tên<RequiredMark /></Text>
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
            <Text style={styles.label}>Email<RequiredMark /></Text>
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
            <Text style={styles.label}>Mật khẩu<RequiredMark /></Text>
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isLoading} accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorTextSmall}>{passwordError}</Text> : null}
            <Text style={styles.passwordHint}>Mật khẩu tối thiểu 6 ký tự (nên chứa chữ hoa, chữ số và ký tự đặc biệt).</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu<RequiredMark /></Text>
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
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} disabled={isLoading} accessibilityLabel={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}>
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
            <Text style={styles.termsText}>Tôi đồng ý với <Text focusable={false} onPress={() => router.push('/terms' as any)} style={styles.termsLink}>Điều khoản dịch vụ</Text> và <Text focusable={false} onPress={() => router.push('/privacy' as any)} style={styles.termsLink}>Chính sách bảo mật</Text> của hệ thống<RequiredMark /></Text>
          </View>
          {termsError ? <Text style={styles.errorTextSmall}>{termsError}</Text> : null}

          <Button onPress={handleRegister} disabled={isLoading}>{isLoading ? 'Đang xử lý…' : 'Đăng ký'}</Button>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} disabled={isLoading}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc'
  },
  headerBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e8f1',
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
    fontSize: 28,
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
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e4e8f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 0,
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
    borderRadius: 14,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 2,
    elevation: 1
  },
  inputIcon: {
    marginRight: spacing.xs
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: colors.text
  },
  eyeIcon: {
    minWidth: 44,
    flexShrink: 0,
    alignItems: 'center',
    padding: spacing.xs
  },
  registerButton: {
    backgroundColor: colors.primary,
    gap: spacing.sm,
    minHeight: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0
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
    fontSize: 14,
    lineHeight: 18,
    color: colors.mutedText,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '700',
  },
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
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  errorTextSmall: {
    color: '#dc2626',
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
