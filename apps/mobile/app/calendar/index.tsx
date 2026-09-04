import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/shared/store/theme-context';
import { api } from '../../src/shared/api/api-client';

export default function CalendarScreen() {
  const { colors } = useTheme();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('30');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      const raw: any = await api.get(`/planner/my?from=${from}&to=${to}`);
      setPlans(Array.isArray(raw) ? raw : (raw?.data || raw?.items || []));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const addPlan = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post('/planner/my', { title: newTitle, durationMinutes: parseInt(newTime), date: new Date(today.getFullYear(), today.getMonth(), selectedDate).toISOString() });
      setShowModal(false);
      setNewTitle('');
      fetchPlans();
    } catch (err) {
      console.log(err);
    }
  };

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const selectedDayPlans = plans.filter(p => {
    if (!p.date && !p.plannedFor) return false;
    const d = new Date(p.date || p.plannedFor);
    return d.getDate() === selectedDate;
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 40 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    monthText: { fontSize: 16, color: colors.primary, fontWeight: 'bold' },
    summaryCard: { backgroundColor: `${colors.primary}10`, margin: 16, padding: 16, borderRadius: 12 },
    summaryText: { color: colors.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
    dayCell: { width: '14.28%', aspectRatio: 1, padding: 4 },
    dayInner: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
    dayInnerSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}20` },
    dayText: { color: colors.text, fontWeight: 'bold' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 4 },
    panel: { padding: 16, marginTop: 16 },
    panelTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    planItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    planInfo: { flex: 1, marginLeft: 12 },
    planTitle: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
    planTime: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
    btnAdd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: 16, margin: 16, borderRadius: 12, gap: 8 },
    btnAddText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.background, padding: 20, borderRadius: 16, width: '100%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 12, color: colors.text },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 12 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: colors.border },
    modalBtnPrimary: { backgroundColor: colors.primary }
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch học</Text>
        <Text style={styles.monthText}>Tháng {today.getMonth() + 1}, {today.getFullYear()}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Đã lên kế hoạch {plans.length} bài trong tháng này</Text>
      </View>

      <View style={styles.calendarGrid}>
        {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
          <View key={d} style={styles.dayCell}><Text style={{ textAlign: 'center', color: colors.textSecondary }}>{d}</Text></View>
        ))}
        {daysArray.map(day => {
          const hasPlan = plans.some(p => {
            if (!p.date && !p.plannedFor) return false;
            return new Date(p.date || p.plannedFor).getDate() === day;
          });
          return (
            <TouchableOpacity key={day} style={styles.dayCell} onPress={() => setSelectedDate(day)}>
              <View style={[styles.dayInner, selectedDate === day && styles.dayInnerSelected]}>
                <Text style={styles.dayText}>{day}</Text>
                {hasPlan && <View style={styles.dot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ngày {selectedDate}/{today.getMonth() + 1}</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : selectedDayPlans.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>Chưa có kế hoạch nào.</Text>
        ) : (
          selectedDayPlans.map((p, i) => (
            <View key={i} style={styles.planItem}>
              <MaterialIcons name={p.isCompleted ? "check-circle" : "radio-button-unchecked"} size={24} color={p.isCompleted ? "#10b981" : colors.textSecondary} />
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{p.title}</Text>
                <Text style={styles.planTime}>{p.durationMinutes || 15} phút</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.btnAdd} onPress={() => setShowModal(true)}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.btnAddText}>Thêm kế hoạch</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm kế hoạch (Ngày {selectedDate})</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên bài học..."
              placeholderTextColor={colors.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Thời gian (phút)..."
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={newTime}
              onChangeText={setNewTime}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowModal(false)}>
                <Text style={{ color: colors.text }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={addPlan}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
