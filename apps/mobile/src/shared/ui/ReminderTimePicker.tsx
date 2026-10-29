import { useState } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Text, TouchableOpacity, Button } from './primitives';
import { MaterialIcons } from './AppIcon';

export function reminderDate(value: string): Date {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  const date = new Date();
  date.setHours(match && +match[1] < 24 ? +match[1] : 20, match && +match[2] < 60 ? +match[2] : 0, 0, 0);
  return date;
}
export const formatReminderTime = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export function ReminderTimePicker({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => reminderDate(value));
  const show = () => {
    const selected = reminderDate(value);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: selected, mode: 'time', display: 'clock', is24Hour: true,
        positiveButton: { label: 'Chọn giờ', textColor: '#3525cd' }, negativeButton: { label: 'Hủy', textColor: '#59657c' },
        onChange: (event, date) => { if (event.type === 'set' && date) onChange(formatReminderTime(date)); },
      });
    } else { setDraft(selected); setOpen(true); }
  };
  return <>
    <TouchableOpacity accessibilityLabel={`Giờ nhắc học: ${value}`} onPress={show} style={s.field}>
      <View style={s.icon}><MaterialIcons name="schedule" size={22} color="#3525cd" /></View>
      <View style={{ flex: 1 }}><Text style={s.caption}>Giờ nhắc học</Text><Text style={s.value}>{value}</Text></View>
      <View style={s.changeButton}><Text style={s.change}>Đổi giờ</Text><MaterialIcons name="edit" size={16} color="#3525cd" /></View>
    </TouchableOpacity>
    {Platform.OS !== 'android' && <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={s.backdrop}><View style={s.sheet} accessibilityViewIsModal>
        <View style={s.handle} /><Text accessibilityRole="header" style={s.title}>Chọn giờ nhắc học</Text><Text style={s.caption}>Dành một khoảng thời gian mỗi ngày cho việc học.</Text>
        <DateTimePicker value={draft} mode="time" display="spinner" locale="vi-VN" themeVariant="light" textColor="#17213a" onChange={(_, date) => { if (date) setDraft(date); }} />
        <View style={s.actions}><Button mode="text" onPress={() => setOpen(false)}>Hủy</Button><Button onPress={() => { onChange(formatReminderTime(draft)); setOpen(false); }}>Chọn giờ</Button></View>
      </View></View>
    </Modal>}
  </>;
}
const s = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e4dfff', borderRadius: 16, padding: 12, backgroundColor: '#f7f5ff' },
  changeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 40, borderRadius: 12, backgroundColor: '#eeecff' },
  icon: { padding: 10, borderRadius: 12, backgroundColor: '#eeecff' }, caption: { fontSize: 13, color: '#59657c' }, value: { fontSize: 22, fontWeight: '700', color: '#17213a' }, change: { color: '#3525cd', fontSize: 13, fontWeight: '600' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#10182b66' }, sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, gap: 8 }, handle: { width: 40, height: 4, borderRadius: 4, backgroundColor: '#d8d5e8', alignSelf: 'center', marginBottom: 16 }, title: { fontSize: 22, fontWeight: '700' }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
});
