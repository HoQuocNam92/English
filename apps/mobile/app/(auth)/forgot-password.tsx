import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { validateEmail } from '../../src/shared/utils/validators';

export default function MobileForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setEmailError('');
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      Alert.alert(
        'Đã gửi mã OTP',
        'Nếu email tồn tại trên hệ thống, mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (hoặc Console log của BE).',
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setOtpError('');
    setPasswordError('');

    if (!otp || otp.trim().length !== 6) {
      setOtpError('Mã OTP phải bao gồm 6 chữ số');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword
      });

      Alert.alert(
        'Thành công',
        'Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.',
        [{ text: 'Đăng nhập', onPress: () => router.replace('/(auth)/login' as any) }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khôi phục mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {step === 1 ? 'Quên mật khẩu' : 'Nhập mã OTP & Mật khẩu mới'}
        </Text>
        <Text style={styles.cardSub}>
          {step === 1
            ? 'Nhập địa chỉ email đăng ký tài khoản. Chúng tôi sẽ gửi mã xác thực OTP 6 số để bạn đặt lại mật khẩu.'
            : `Nhập mã OTP đã được gửi đến email ${email} và mật khẩu mới của bạn.`}
        </Text>

        {step === 1 ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email tài khoản</Text>
              <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                <MaterialIcons name="mail-outline" size={20} color={colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nhapemail@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              {emailError ? <Text style={styles.errorTextSmall}>{emailError}</Text> : null}
            </View>

            <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleSendOtp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Gửi mã OTP</Text>
                  <MaterialIcons name="send" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã OTP (6 chữ số)</Text>
              <View style={[styles.inputWrapper, otpError ? styles.inputError : null]}>
                <MaterialIcons name="security" size={20} color={colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
              {otpError ? <Text style={styles.errorTextSmall}>{otpError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                <MaterialIcons name="lock-outline" size={20} color={colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorTextSmall}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleResetPassword} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Xác nhận đổi mật khẩu</Text>
                  <MaterialIcons name="check" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendBtn} onPress={() => setStep(1)} disabled={loading}>
              <Text style={styles.resendBtnText}>Gửi lại mã OTP mới</Text>
            </TouchableOpacity>
          </>
        )}
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
    paddingTop: 50,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.md
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  cardSub: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18
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
  submitBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  submitBtnText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary
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

