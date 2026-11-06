import { PasswordField } from '../../src/shared/ui/PasswordField';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { validatePassword } from '../../src/shared/utils/validators';
import { useAuth } from '../../src/shared/store/auth-context';

export default function MobileChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const newPasswordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);
  const allRulesMet = newPassword.length >= 6 && newPassword.length <= 72;
  const saveDisabled = saving || !allRulesMet || !currentPassword || newPassword !== confirmPassword;

  const handleUpdate = async () => {
    if (saving) return;
    if (!currentPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    const passErr = validatePassword(newPassword);
    if (passErr) {
      Alert.alert('Lỗi', passErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      await logout();
      router.replace('/(auth)/login');
      Alert.alert('Đã đổi mật khẩu', 'Tất cả phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại bằng mật khẩu mới.');
    } catch (err: any) {
      Alert.alert('Lỗi', /current password is incorrect/i.test(err.message ?? '') ? 'Mật khẩu hiện tại không chính xác.' : err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12, height: undefined }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <PasswordField label="Mật khẩu hiện tại" placeholder="Nhập mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} autoComplete="current-password" editable={!saving} returnKeyType="next" onSubmitEditing={() => newPasswordRef.current?.focus()} />
          <PasswordField ref={newPasswordRef} label="Mật khẩu mới" placeholder="Tối thiểu 6 ký tự" value={newPassword} onChangeText={setNewPassword} showHint editable={!saving} returnKeyType="next" onSubmitEditing={() => confirmPasswordRef.current?.focus()} />
          <PasswordField ref={confirmPasswordRef} label="Xác nhận mật khẩu mới" placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChangeText={setConfirmPassword} error={confirmPassword.length > 0 && newPassword !== confirmPassword ? 'Mật khẩu xác nhận không khớp' : ''} editable={!saving} returnKeyType="done" onSubmitEditing={() => { if (!saveDisabled) void handleUpdate(); }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button onPress={handleUpdate} disabled={saveDisabled}>{saving ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.md
  },
  inputGroup: {
    gap: spacing.xs
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    height: 46,
    fontSize: 14,
    color: colors.text,
    backgroundColor: 'transparent'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnDisabled: {
    backgroundColor: '#a5b4fc'
  },
  saveBtnText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingRight: 4
  },
  eyeBtn: {
    padding: 10
  },
  rulesBox: {
    marginTop: 8,
    backgroundColor: '#f7f8fc',
    borderRadius: 10,
    padding: 10,
    gap: 6
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  ruleText: {
    fontSize: 12,
    color: '#64748b'
  },
  ruleTextOk: {
    color: '#15803d'
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    marginLeft: 4
  }
});

