import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

export default function MobilePaymentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ paymentUrl: string }>('/payment/create-order', { planId });
      if (res.paymentUrl) {
        await Linking.openURL(res.paymentUrl);
      } else {
        Alert.alert('Lỗi', 'Không lấy được URL thanh toán');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nâng cấp PRO</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Chọn gói phù hợp với bạn</Text>

        <TouchableOpacity style={styles.planCard} onPress={() => handleSelectPlan('pro_monthly')} disabled={loading}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Pro Monthly</Text>
            <Text style={styles.planPrice}>99,000đ<Text style={styles.planPeriod}>/tháng</Text></Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.planCard} onPress={() => handleSelectPlan('pro_yearly')} disabled={loading}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Pro Yearly</Text>
            <Text style={styles.planPrice}>799,000đ<Text style={styles.planPeriod}>/năm</Text></Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TIẾT KIỆM</Text>
          </View>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  planCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: spacing.lg, borderWidth: 2, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planInfo: { gap: 4 },
  planName: { fontSize: 16, fontWeight: '700', color: colors.text },
  planPrice: { fontSize: 20, fontWeight: '800', color: colors.primary },
  planPeriod: { fontSize: 14, fontWeight: '600', color: colors.mutedText },
  badge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#92400e' },
});
