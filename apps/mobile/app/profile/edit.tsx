import { ReminderTimePicker } from '../../src/shared/ui/ReminderTimePicker';
import { featureIconColor } from '../../src/shared/ui/icon-colors';
import { ProfileAvatar } from '../../src/shared/ui/ProfileAvatar';
import { RequiredMark } from '../../src/shared/ui/RequiredMark';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TextInput, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, Switch, useWindowDimensions } from 'react-native';
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 480;
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
  const [learningGoal, setLearningGoal] = useState<'certification' | 'vocabulary' | 'both'>('vocabulary');
  const [levelCode, setLevelCode] = useState('');
  const [domainCodes, setDomainCodes] = useState<string[]>([]);
  const [certificateCodes, setCertificateCodes] = useState<string[]>([]);
  const [showCertificates, setShowCertificates] = useState(false);
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
    if (domainCodes.length === 0) return Alert.alert('Thiếu thông tin', 'Vui lòng chọn ít nhất một chuyên ngành CNTT.');

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

  const renderChoiceGroup = (
    label: string,
    options: any[],
    selected: string[],
    onPress: (code: string) => void,
    single = false,
    required = false,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}{required && <RequiredMark />}</Text>
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
      <View style={[styles.header, { paddingTop: insets.top + 12, height: undefined }]}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#464555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <ProfileAvatar letter={avatarLetter} imageUrl={avatarUrl} loading={uploading} accessibilityLabel="Đổi ảnh đại diện" onPress={handlePickImage} />
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên<RequiredMark /></Text>
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
            <Text style={styles.label}>1. Mục tiêu học chính<RequiredMark /></Text>
            <View style={styles.modeRow}>
              <TouchableOpacity style={[styles.modeCard, learningGoal === 'certification' && styles.modeCardActive]} onPress={() => setLearningGoal('certification')}>
                <MaterialIcons name="workspace-premium" size={22} color={featureIconColor('workspace-premium')} />
                <Text style={styles.modeTitle}>Luyện chứng chỉ</Text>
                <Text style={styles.modeDescription}>Học kiến thức theo chủ đề và làm bài luyện tập cho chứng chỉ đã chọn.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeCard, learningGoal === 'vocabulary' && styles.modeCardActive]} onPress={() => setLearningGoal('vocabulary')}>
                <MaterialIcons name="translate" size={22} color={featureIconColor('translate')} />
                <Text style={styles.modeTitle}>Luyện từ vựng</Text>
                <Text style={styles.modeDescription}>Từ vựng theo chuyên ngành CNTT.</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={[styles.modeCard, learningGoal === 'both' && styles.modeCardActive]} onPress={() => setLearningGoal('both')}>
            <Text style={styles.modeTitle}>Kết hợp từ vựng và chứng chỉ</Text>
            <Text style={styles.modeDescription}>Học từ vựng CNTT cùng lộ trình chứng chỉ.</Text>
          </TouchableOpacity>
          {renderChoiceGroup('2. Trình độ tiếng Anh', levels, levelCode ? [levelCode] : [], setLevelCode, true, true)}
          {renderChoiceGroup('3. Chuyên ngành CNTT', domains, domainCodes, code => toggleCode(code, domainCodes, setDomainCodes), false, true)}
          {learningGoal !== 'vocabulary' && <View style={{ gap: 12 }}>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showCertificates }} onPress={() => setShowCertificates(value => !value)} style={[styles.choiceChip, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}><MaterialIcons name={showCertificates ? 'expand-less' : 'expand-more'} size={20} color={colors.primary} /><Text style={styles.choiceChipTextActive}>{showCertificates ? 'Thu gọn danh sách' : certificateCodes.length ? 'Đổi chứng chỉ mục tiêu' : 'Chọn chứng chỉ mục tiêu'}</Text></TouchableOpacity>
            {renderChoiceGroup('4. Chứng chỉ mục tiêu', certificates.filter(cert => showCertificates || !certificateCodes.length || certificateCodes.includes(cert.code)), certificateCodes, code => { setCertificateCodes([code]); setShowCertificates(false); }, true, true)}
          </View>}
          {renderChoiceGroup('Mục tiêu nghề nghiệp', careerGoals, careerGoalCodes, code => toggleCode(code, careerGoalCodes, setCareerGoalCodes))}
          <Text style={styles.label}>{learningGoal === 'vocabulary' ? '4' : '5'}. Kế hoạch học</Text>
          <View style={[styles.targetRow, compact && { flexDirection: 'column', gap: 12 }]}>
            <View style={[styles.inputGroup, styles.targetItem]}><Text style={styles.label}>Từ vựng mỗi ngày<RequiredMark /></Text><TextInput accessibilityLabel="Từ vựng mỗi ngày" style={styles.input} value={dailyVocabularyTarget} onChangeText={setDailyVocabularyTarget} keyboardType="number-pad" /></View>
            <View style={[styles.inputGroup, styles.targetItem]}><Text style={styles.label}>Bài luyện tập mỗi tuần<RequiredMark /></Text><TextInput accessibilityLabel="Bài luyện tập mỗi tuần" style={styles.input} value={weeklyExamTarget} onChangeText={setWeeklyExamTarget} keyboardType="number-pad" /></View>
            <View style={[styles.inputGroup, styles.targetItem]}><Text style={styles.label}>Phút học mỗi ngày<RequiredMark /></Text><TextInput accessibilityLabel="Phút học mỗi ngày" style={styles.input} value={dailyStudyTargetMinutes} onChangeText={setDailyStudyTargetMinutes} keyboardType="number-pad" /></View>
          </View>
          <View style={styles.targetRow}><Text style={styles.label}>Nhắc học hằng ngày</Text><Switch accessibilityLabel="Nhắc học hằng ngày" value={reminderEnabled} onValueChange={setReminderEnabled} /></View>
          {reminderEnabled && <View style={styles.inputGroup}><Text style={styles.label}>Giờ nhắc học hằng ngày<RequiredMark /></Text><ReminderTimePicker value={reminderTime} onChange={setReminderTime} /></View>}
        </View>
      </ScrollView>


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
    backgroundColor: '#f7f8fc'
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
    minHeight: 52,
    fontSize: 14,
    color: '#191c1e',
    backgroundColor: '#ffffff'
  },
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
    maxWidth: '100%',
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
    flexShrink: 1,
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
