import { Text, TextInput, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, Image, Modal, Switch } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { validateDisplayName, validatePhone } from '../../src/shared/utils/validators';
import { validateLearningTargets } from '../../src/shared/utils/learning-targets';
import { FeatureScreen } from '../../src/shared/ui/FeatureScreen';
import { useAuth } from '../../src/shared/store/auth-context';
import { scheduleLearningReminder } from '../../src/shared/notifications/learning-reminders';

export default function MobileEditProfileScreen() {
  const router = useRouter();
  const { fetchUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [dailyVocabularyTarget, setDailyVocabularyTarget] = useState('10');
  const [weeklyExamTarget, setWeeklyExamTarget] = useState('2');
  const [dailyStudyTargetMinutes, setDailyStudyTargetMinutes] = useState('30');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(20);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [learningGoal, setLearningGoal] = useState<'certification' | 'vocabulary' | 'both'>('vocabulary');
  const [levelCode, setLevelCode] = useState('');
  const [domainCodes, setDomainCodes] = useState<string[]>([]);
  const [certificateCodes, setCertificateCodes] = useState<string[]>([]);
  const [careerGoalCodes, setCareerGoalCodes] = useState<string[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [careerGoals, setCareerGoals] = useState<any[]>([]);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    Promise.allSettled([
      api.get('/users/me'),
      api.get('/learner-profiles/me'),
      api.get('/levels'),
      api.get('/domains?activeOnly=true'),
      api.get('/certificates?activeOnly=true'),
      api.get('/career-goals'),
    ]).then(([meRes, profileRes, levelsRes, domainsRes, certsRes, careerGoalsRes]) => {
      const failure = [meRes, profileRes, levelsRes, domainsRes, certsRes, careerGoalsRes].find(result => result.status === 'rejected');
      if (failure?.status === 'rejected') throw failure.reason;
      if (meRes.status === 'fulfilled') {
        const data = meRes.value as any;
        setDisplayName(data.displayName || '');
        setAvatarUrl(data.avatarUrl || data.userDetail?.avatarUrl || null);
        setPhoneNumber(data.phoneNumber || '');
        setBio(data.bio || '');
      }
      if (profileRes.status === 'fulfilled') {
        const profile = profileRes.value as any;
        setLevelCode(profile.level?.code || '');
        setDomainCodes(profile.domains?.map((item: any) => item.domain?.code).filter(Boolean) || []);
        const savedCertificateCodes = profile.certGoals?.map((item: any) => item.certificate?.code).filter(Boolean) || [];
        setCertificateCodes(savedCertificateCodes);
        setCareerGoalCodes(profile.careerGoals?.map((item: any) => item.careerGoal?.code).filter(Boolean) || []);
        setLearningGoal(['certification', 'vocabulary', 'both'].includes(profile.learningGoal) ? profile.learningGoal : savedCertificateCodes.length ? 'certification' : 'vocabulary');
        setReminderEnabled(Boolean(profile.reminderEnabled));
        setDailyVocabularyTarget(String(profile.dailyVocabularyTarget || 10));
        setWeeklyExamTarget(String(profile.weeklyExamTarget || 2));
        setDailyStudyTargetMinutes(String(profile.dailyStudyTargetMinutes || 30));
        setReminderTime(profile.reminderTime || '20:00');
      }
      const items = (value: any) => Array.isArray(value) ? value : (value?.data || value?.items || []);
      if (levelsRes.status === 'fulfilled') setLevels(items(levelsRes.value));
      if (domainsRes.status === 'fulfilled') setDomains(items(domainsRes.value));
      if (certsRes.status === 'fulfilled') setCertificates(items(certsRes.value));
      if (careerGoalsRes.status === 'fulfilled') setCareerGoals(items(careerGoalsRes.value));
    }).catch((cause: unknown) => setLoadError(cause instanceof Error ? cause.message : 'Không thể tải hồ sơ. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);
      if (!asset.base64) throw new Error('Không đọc được dữ liệu ảnh đã chọn');
      const data = await api.post<{ url: string }>('/upload/avatar-base64', {
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
      setAvatarUrl(data.url);
      
      await api.patch('/users/me', { avatarUrl: data.url });
      await fetchUser().catch(() => undefined);
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (saving || loading || loadError) return;
    const nameErr = validateDisplayName(displayName);
    if (nameErr) return Alert.alert('Lỗi', nameErr);
    const phoneErr = validatePhone(phoneNumber);
    if (phoneErr) return Alert.alert('Lỗi', phoneErr);
    if (bio.length > 500) return Alert.alert('Lỗi', 'Giới thiệu tối đa 500 ký tự.');
    const targetErr = validateLearningTargets(dailyVocabularyTarget, weeklyExamTarget, dailyStudyTargetMinutes);
    if (targetErr) return Alert.alert('Lỗi', targetErr);
    if (!levelCode) return Alert.alert('Thiếu thông tin', 'Vui lòng chọn trình độ tiếng Anh.');
    if (learningGoal !== 'vocabulary' && certificateCodes.length === 0) return Alert.alert('Thiếu thông tin', 'Vui lòng chọn một chứng chỉ mục tiêu.');
    if (domainCodes.length === 0) return Alert.alert('Thiếu thông tin', 'Vui lòng chọn ít nhất một lĩnh vực CNTT.');

    setSaving(true);
    try {
      await api.patch('/users/me', { displayName: displayName.trim(), phoneNumber: phoneNumber.replace(/\s/g, '') || null, bio });
      await api.put('/learner-profiles/me/goals', {
        learningGoal,
        levelCode,
        domainCodes,
        certificateCodes: learningGoal !== 'vocabulary' ? certificateCodes.slice(0, 1) : [],
        careerGoalCodes,
        weeklyStudyTargetMinutes: Number(dailyStudyTargetMinutes) * 7,
        dailyVocabularyTarget: Number(dailyVocabularyTarget),
        weeklyExamTarget: Number(weeklyExamTarget),
        dailyStudyTargetMinutes: Number(dailyStudyTargetMinutes),
        reminderTime,
        reminderEnabled,
        learningPathMode: 'smart',
      });
      await scheduleLearningReminder(reminderEnabled ? reminderTime : null).catch(() => false);
      await fetchUser();
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân thành công!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError) return <FeatureScreen title="Chỉnh sửa hồ sơ" error={loadError} onRetry={() => setReloadKey(value => value + 1)}>{null}</FeatureScreen>;

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'N';

  const toggleCode = (code: string, selected: string[], setter: (next: string[]) => void) => {
    setter(selected.includes(code) ? selected.filter(item => item !== code) : [...selected, code]);
  };

  const openTimePicker = () => {
    const [hour, minute] = reminderTime.split(':').map(Number);
    setPickerHour(Number.isFinite(hour) ? hour : 20);
    setPickerMinute(Number.isFinite(minute) ? minute : 0);
    setShowTimePicker(true);
  };

  const saveTime = () => {
    setReminderTime(`${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`);
    setShowTimePicker(false);
  };

  const renderChoiceGroup = (
    label: string,
    options: any[],
    selected: string[],
    onPress: (code: string) => void,
    single = false,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceWrap}>
        {options.map(option => {
          const active = selected.includes(option.code);
          return (
            <TouchableOpacity
              key={option.id || option.code}
              style={[styles.choiceChip, active && styles.choiceChipActive]}
              onPress={() => onPress(option.code)}
              accessibilityRole={single ? 'radio' : 'checkbox'}
              accessibilityState={{ selected: active, checked: active }}
            >
              <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{option.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#464555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
            <View style={styles.avatarBox}>
              {uploading ? (
                <ActivityIndicator color="#ffffff" />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96, borderRadius: 48 }} />
              ) : (
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              )}
              <View style={styles.editAvatarIcon}>
                <MaterialIcons name="edit" size={16} color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nguyen Van A"
              placeholderTextColor="#777587"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="Nhập số điện thoại" placeholderTextColor="#777587" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới thiệu</Text>
            <TextInput style={[styles.input, styles.bioInput]} value={bio} onChangeText={setBio} multiline placeholder="Giới thiệu ngắn về bạn" placeholderTextColor="#777587" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>1. Mục tiêu học chính</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity style={[styles.modeCard, learningGoal === 'certification' && styles.modeCardActive]} onPress={() => setLearningGoal('certification')}>
                <MaterialIcons name="workspace-premium" size={22} color={colors.primary} />
                <Text style={styles.modeTitle}>Luyện chứng chỉ</Text>
                <Text style={styles.modeDescription}>Domain, Topic và Quiz theo chứng chỉ.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeCard, learningGoal === 'vocabulary' && styles.modeCardActive]} onPress={() => setLearningGoal('vocabulary')}>
                <MaterialIcons name="translate" size={22} color={colors.primary} />
                <Text style={styles.modeTitle}>Luyện từ vựng</Text>
                <Text style={styles.modeDescription}>Từ vựng theo lĩnh vực CNTT.</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={[styles.modeCard, learningGoal === 'both' && styles.modeCardActive]} onPress={() => setLearningGoal('both')}>
            <Text style={styles.modeTitle}>Kết hợp từ vựng và chứng chỉ</Text>
            <Text style={styles.modeDescription}>Học từ vựng CNTT cùng lộ trình chứng chỉ.</Text>
          </TouchableOpacity>
          {renderChoiceGroup('2. Lĩnh vực CNTT', domains, domainCodes, code => toggleCode(code, domainCodes, setDomainCodes))}
          {learningGoal !== 'vocabulary' && renderChoiceGroup('Chứng chỉ mục tiêu', certificates, certificateCodes, code => setCertificateCodes(current => current.includes(code) ? [] : [code]), true)}
          {renderChoiceGroup('3. Trình độ tiếng Anh', levels, levelCode ? [levelCode] : [], setLevelCode, true)}
          {renderChoiceGroup('4. Mục tiêu nghề nghiệp', careerGoals, careerGoalCodes, code => toggleCode(code, careerGoalCodes, setCareerGoalCodes))}
          <Text style={styles.label}>5. Kế hoạch học</Text>
          <View style={styles.targetRow}>
            <View style={[styles.inputGroup, styles.targetItem]}><Text style={styles.label}>Từ/ngày</Text><TextInput style={styles.input} value={dailyVocabularyTarget} onChangeText={setDailyVocabularyTarget} keyboardType="number-pad" /></View>
            <View style={[styles.inputGroup, styles.targetItem]}><Text style={styles.label}>Quiz/tuần</Text><TextInput style={styles.input} value={weeklyExamTarget} onChangeText={setWeeklyExamTarget} keyboardType="number-pad" /></View>
            <View style={[styles.inputGroup, styles.targetItem]}><Text style={styles.label}>Phút/ngày</Text><TextInput style={styles.input} value={dailyStudyTargetMinutes} onChangeText={setDailyStudyTargetMinutes} keyboardType="number-pad" /></View>
          </View>
          <View style={styles.targetRow}><Text style={styles.label}>Nhắc học hằng ngày</Text><Switch accessibilityLabel="Nhắc học hằng ngày" value={reminderEnabled} onValueChange={setReminderEnabled} /></View>
          {reminderEnabled && <View style={styles.inputGroup}><Text style={styles.label}>Giờ nhắc học hằng ngày</Text><TouchableOpacity style={styles.timePickerField} onPress={openTimePicker}><MaterialIcons name="schedule" size={22} color={colors.primary} /><Text style={styles.timePickerValue}>{reminderTime}</Text><MaterialIcons name="keyboard-arrow-down" size={22} color="#777587" /></TouchableOpacity></View>}
        </View>
      </ScrollView>

      <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalBackdrop}><View style={styles.timeModal}>
          <View style={styles.timeModalHeader}><MaterialIcons name="schedule" size={24} color={colors.primary} /><Text style={styles.timeModalTitle}>Chọn giờ nhắc học</Text></View>
          <View style={styles.clockRow}>
            <View style={styles.clockUnit}><TouchableOpacity onPress={() => setPickerHour(value => (value + 1) % 24)}><MaterialIcons name="keyboard-arrow-up" size={32} color={colors.primary} /></TouchableOpacity><Text style={styles.clockNumber}>{String(pickerHour).padStart(2, '0')}</Text><TouchableOpacity onPress={() => setPickerHour(value => (value + 23) % 24)}><MaterialIcons name="keyboard-arrow-down" size={32} color={colors.primary} /></TouchableOpacity></View>
            <Text style={styles.clockColon}>:</Text>
            <View style={styles.clockUnit}><TouchableOpacity onPress={() => setPickerMinute(value => (value + 5) % 60)}><MaterialIcons name="keyboard-arrow-up" size={32} color={colors.primary} /></TouchableOpacity><Text style={styles.clockNumber}>{String(pickerMinute).padStart(2, '0')}</Text><TouchableOpacity onPress={() => setPickerMinute(value => (value + 55) % 60)}><MaterialIcons name="keyboard-arrow-down" size={32} color={colors.primary} /></TouchableOpacity></View>
          </View>
          <View style={styles.modalActions}><TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Hủy</Text></TouchableOpacity><TouchableOpacity onPress={saveTime} style={styles.modalConfirm}><Text style={styles.modalConfirmText}>Chọn giờ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    marginTop: 20
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 100
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  avatarBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e3e5'
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff'
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  formContainer: {
    gap: spacing.md
  },
  inputGroup: {
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555'
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: 14,
    color: '#191c1e',
    backgroundColor: '#ffffff'
  },
  timePickerField: { height: 48, borderWidth: 1, borderColor: '#c7c4d8', borderRadius: 8, paddingHorizontal: spacing.md, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timePickerValue: { flex: 1, fontSize: 16, fontWeight: '700', color: '#191c1e' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  timeModal: { width: '100%', maxWidth: 360, borderRadius: 20, backgroundColor: '#ffffff', padding: spacing.lg },
  timeModalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeModalTitle: { fontSize: 18, fontWeight: '800', color: '#191c1e' },
  clockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg },
  clockUnit: { alignItems: 'center', backgroundColor: '#f4f2ff', borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  clockNumber: { fontSize: 36, fontWeight: '800', color: colors.primary, minWidth: 56, textAlign: 'center' },
  clockColon: { marginHorizontal: spacing.md, fontSize: 36, fontWeight: '800', color: '#191c1e' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  modalCancel: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modalCancelText: { color: '#5f5d6d', fontWeight: '700' },
  modalConfirm: { borderRadius: 10, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modalConfirmText: { color: '#ffffff', fontWeight: '800' },
  bioInput: { height: 88, paddingTop: spacing.sm, textAlignVertical: 'top' },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  targetRow: { flexDirection: 'row', gap: spacing.xs },
  targetItem: { flex: 1 },
  choiceChip: {
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 18,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#ffffff',
  },
  choiceChipActive: {
    backgroundColor: '#e2dfff',
    borderColor: colors.primary,
  },
  choiceChipText: {
    fontSize: 13,
    color: '#464555',
  },
  choiceChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeCard: { flex: 1, minHeight: 116, borderWidth: 1, borderColor: '#c7c4d8', borderRadius: 12, padding: spacing.sm, backgroundColor: '#ffffff' },
  modeCardActive: { borderColor: colors.primary, backgroundColor: '#f0edff' },
  modeTitle: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#191c1e' },
  modeDescription: { marginTop: 4, fontSize: 11, lineHeight: 16, color: '#5f5d6d' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    paddingBottom: 32, // Safe area inset
    borderTopWidth: 1,
    borderTopColor: '#c7c4d8',
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
});
