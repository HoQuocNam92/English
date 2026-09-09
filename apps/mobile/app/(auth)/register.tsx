import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api, ApiError } from '../../src/shared/api/api-client';
import { validateEmail, validatePassword, validateDisplayName } from '../../src/shared/utils/validators';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MobileRegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
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

    if (nameErr || emailErr || passErr || confErr) return;

    setIsLoading(true);
    try {
      const result = await api.post<any>('/auth/register', { displayName, email, password });
      // Lưu token để các bước onboarding gọi API được xác thực
      await Promise.all([
        AsyncStorage.setItem('access_token', result.accessToken),
        AsyncStorage.setItem('refresh_token', result.refreshToken ?? ''),
      ]);
      router.replace('/(onboarding)/level' as any);
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
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()} disabled={isLoading}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IT English Pro</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.title}>Tạo tài khoản mới</Text>
          <Text style={styles.subtitle}>Tham gia cộng đồng IT English Pro ngay hôm nay.</Text>
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
                placeholder="example@email.com"
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
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isLoading}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorTextSmall}>{passwordError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={[styles.inputWrapper, confirmError ? styles.inputError : null]}>
              <MaterialIcons name="lock-outline" size={20} color={colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} disabled={isLoading}>
                <MaterialIcons name={showConfirmPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>
            {confirmError ? <Text style={styles.errorTextSmall}>{confirmError}</Text> : null}
          </View>

          <TouchableOpacity style={styles.registerButton} activeOpacity={0.8} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
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
    marginTop: 40 // simple offset for statusbar, or use safeareaview
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#f8fafc',
    gap: spacing.md
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
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1
  }
});

