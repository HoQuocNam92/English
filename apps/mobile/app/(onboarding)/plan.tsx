import { Text, TextInput, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { scheduleLearningReminder } from '../../src/shared/notifications/learning-reminders';

const STORAGE_KEYS = ['onboarding_goal', 'onboarding_level', 'onboarding_domains', 'onboarding_certificate_code', 'onboarding_certificate_id'];

export default function OnboardingPlanScreen() {
  const router = useRouter();
  const [dailyVocabularyTarget, setDailyVocabularyTarget] = useState('20');
  const [weeklyExamTarget, setWeeklyExamTarget] = useState('2');
  const [dailyStudyTargetMinutes, setDailyStudyTargetMinutes] = useState('30');
  const [takePlacementTest, setTakePlacementTest] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [submitting, setSubmitting] = useState(false);

  const finish = async () => {
    setSubmitting(true);
    try {
      const values = await AsyncStorage.multiGet(STORAGE_KEYS);
      const stored = Object.fromEntries(values);
      const goal = stored.onboarding_goal;
      const levelCode = stored.onboarding_level || 'beginner';
      const domainCodes: string[] = goal === 'vocabulary' && stored.onboarding_domains ? JSON.parse(stored.onboarding_domains) : [];
      const certificateCode = goal === 'certification' ? stored.onboarding_certificate_code : '';
      const certificateId = goal === 'certification' ? stored.onboarding_certificate_id : '';
      if (!goal || (goal === 'certification' && !certificateCode) || (goal === 'vocabulary' && domainCodes.length === 0)) {
        Alert.alert('Thiếu thông tin', 'Vui lòng quay lại và chọn mục tiêu học tập.');
        return;
      }

      const vocabularyTarget = Math.min(200, Math.max(1, Number(dailyVocabularyTarget) || 20));
      const examTarget = Math.min(50, Math.max(1, Number(weeklyExamTarget) || 2));
      const minuteTarget = Math.min(1440, Math.max(5, Number(dailyStudyTargetMinutes) || 30));
      await api.post('/learner-profiles/me/complete-onboarding', {
        levelCode,
        domainCodes,
        certificateCodes: certificateCode ? [certificateCode] : [],
        weeklyStudyTargetMinutes: minuteTarget * 7,
        learningPathMode: 'smart',
        dailyVocabularyTarget: vocabularyTarget,
        weeklyExamTarget: examTarget,
        dailyStudyTargetMinutes: minuteTarget,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
      });
      if (reminderEnabled) await scheduleLearningReminder(reminderTime).catch(() => false);
      await AsyncStorage.multiRemove(STORAGE_KEYS);

      if (takePlacementTest) {
        router.replace({ pathname: '/placement-test', params: { next: certificateId ? `/certifications/${certificateId}` : '/flashcards' } } as any);
        return;
      }
      router.replace(certificateId ? `/certifications/${certificateId}` as any : '/flashcards' as any);
    } catch (error: any) {
      Alert.alert('Không thể tạo lộ trình', error?.message || 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return <View style={styles.container}>
    <StatusBar style="dark" />
    <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color="#191c1e" /></TouchableOpacity><Text style={styles.step}>Bước 4/4</Text><View style={{ width: 24 }} /></View>
    <View style={styles.progress}><View style={styles.progressFill} /></View>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Thiết lập kế hoạch học</Text>
      <Text style={styles.subtitle}>Các mục tiêu chỉ dùng để nhắc và theo dõi. Tiến trình ban đầu vẫn là 0%.</Text>
      <View style={styles.card}>
        <NumberInput label="Từ vựng mỗi ngày" value={dailyVocabularyTarget} onChangeText={setDailyVocabularyTarget} />
        <NumberInput label="Bài Quiz mỗi tuần" value={weeklyExamTarget} onChangeText={setWeeklyExamTarget} />
        <NumberInput label="Phút học mỗi ngày" value={dailyStudyTargetMinutes} onChangeText={setDailyStudyTargetMinutes} />
      </View>
      <TouchableOpacity style={styles.option} onPress={() => setTakePlacementTest(value => !value)}><MaterialIcons name={takePlacementTest ? 'check-box' : 'check-box-outline-blank'} size={23} color={colors.primary} /><View style={styles.optionCopy}><Text style={styles.optionTitle}>Làm bài kiểm tra đầu vào</Text><Text style={styles.optionText}>Nếu chưa có đề phù hợp, app sẽ đưa bạn vào lộ trình đã chọn.</Text></View></TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => setReminderEnabled(value => !value)}><MaterialIcons name={reminderEnabled ? 'check-box' : 'check-box-outline-blank'} size={23} color={colors.primary} /><View style={styles.optionCopy}><Text style={styles.optionTitle}>Nhắc học mỗi ngày</Text><Text style={styles.optionText}>Bật thông báo nhắc học trên thiết bị.</Text></View></TouchableOpacity>
      {reminderEnabled && <View style={styles.timeWrap}><Text style={styles.label}>Giờ nhắc học (HH:mm)</Text><TextInput value={reminderTime} onChangeText={setReminderTime} style={styles.input} placeholder="20:00" /></View>}
      <View style={styles.zeroNote}><MaterialIcons name="verified" size={21} color={colors.primary} /><Text style={styles.zeroText}>Lưu mục tiêu không đánh dấu bài học, từ vựng hay bài thi là đã hoàn thành.</Text></View>
    </ScrollView>
    <View style={styles.bottom}><TouchableOpacity disabled={submitting} style={[styles.button, submitting && { opacity: 0.6 }]} onPress={finish}>{submitting ? <ActivityIndicator color="#fff" /> : <><Text style={styles.buttonText}>Tạo lộ trình</Text><MaterialIcons name="check" size={20} color="#fff" /></>}</TouchableOpacity></View>
  </View>;
}

function NumberInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} keyboardType="number-pad" style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' }, header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, step: { fontSize: 13, fontWeight: '700', color: '#777587' },
  progress: { height: 4, backgroundColor: '#e6e8ea' }, progressFill: { width: '100%', height: 4, backgroundColor: colors.primary }, content: { padding: spacing.lg, paddingBottom: 130 }, title: { fontSize: 25, fontWeight: '800', color: '#191c1e', marginTop: 12 }, subtitle: { color: '#464555', marginTop: 8, marginBottom: 24, lineHeight: 20 },
  card: { padding: spacing.md, borderWidth: 1, borderColor: '#c7c4d8', borderRadius: 14, backgroundColor: '#fff', gap: spacing.md }, field: { gap: 6 }, label: { fontSize: 12, fontWeight: '700', color: '#464555' }, input: { height: 46, borderWidth: 1, borderColor: '#c7c4d8', borderRadius: 10, paddingHorizontal: spacing.md, backgroundColor: '#fff', color: '#191c1e', fontSize: 15 },
  option: { marginTop: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: '#c7c4d8', borderRadius: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }, optionCopy: { flex: 1 }, optionTitle: { fontSize: 14, fontWeight: '800', color: '#191c1e' }, optionText: { marginTop: 3, fontSize: 12, lineHeight: 17, color: '#464555' }, timeWrap: { marginTop: spacing.md, gap: 6 },
  zeroNote: { marginTop: spacing.lg, padding: spacing.md, borderRadius: 12, backgroundColor: '#f0efff', flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, zeroText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#464555' },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e6e8ea' }, button: { height: 50, backgroundColor: colors.primary, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
