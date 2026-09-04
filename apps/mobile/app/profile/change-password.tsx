import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { validatePassword } from '../../src/shared/utils/validators';

export default function MobileChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const rules = [
    { label: 'Ít nhất 8 ký tự', ok: newPassword.length >= 8 },
    { label: 'Có chữ hoa (A-Z)', ok: /[A-Z]/.test(newPassword) },
    { label: 'Có chữ số (0-9)', ok: /[0-9]/.test(newPassword) },
    { label: 'Có ký tự đặc biệt (!@#...)', ok: /[^A-Za-z0-9]/.test(newPassword) },
  ];
  const allRulesMet = rules.every(r => r.ok);

  const handleUpdate = async () => {
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
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          {/* Mật khẩu hiện tại */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent(!showCurrent)}>
                <MaterialIcons name={showCurrent ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mật khẩu mới */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(!showNew)}>
                <MaterialIcons name={showNew ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>

            {/* Password requirements */}
            <View style={styles.rulesBox}>
              {rules.map(r => (
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
          </View>

          {/* Xác nhận mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                <MaterialIcons name={showConfirm ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>Mật khẩu xác nhận không khớp</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, (!allRulesMet || saving) && styles.saveBtnDisabled]}
          onPress={handleUpdate}
          disabled={saving || !allRulesMet}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Cập nhật mật khẩu</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
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
    borderRadius: 16,
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
    height: 50,
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
    backgroundColor: '#f8fafc',
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
    color: '#94a3b8'
  },
  ruleTextOk: {
    color: '#16a34a'
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4
  }
});

