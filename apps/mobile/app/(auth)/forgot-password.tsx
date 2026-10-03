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
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const sendLink = async () => {
    const error = validateEmail(email);
    setEmailError(error || '');
    if (error) return;
    setLoading(true);
    try {
      const result = await api.post<{ resetLinkSent: boolean }>('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (!result.resetLinkSent) throw new Error('Máy chủ chưa xác nhận gửi liên kết.');
      setSent(true);
    } catch (error: any) {
      Alert.alert('Không thể gửi liên kết', error.message);
    } finally { setLoading(false); }
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Khôi phục mật khẩu</Text><View style={{ width: 40 }} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{sent ? 'Kiểm tra hộp thư' : 'Quên mật khẩu'}</Text>
        <Text style={styles.cardSub}>{sent ? 'Mở liên kết trong email để đổi mật khẩu. Liên kết có hiệu lực 15 phút và chỉ dùng một lần.' : 'Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.'}</Text>
        {!sent && <View style={styles.inputGroup}>
          <Text style={styles.label}>Email tài khoản</Text>
          <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
            <MaterialIcons name="mail-outline" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="nhapemail@example.com" />
          </View>
          {!!emailError && <Text style={styles.errorTextSmall}>{emailError}</Text>}
        </View>}
        <TouchableOpacity disabled={loading} onPress={sent ? () => setSent(false) : sendLink} style={styles.submitBtn}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>{sent ? 'Gửi lại liên kết' : 'Gửi liên kết'}</Text>}
        </TouchableOpacity>
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

