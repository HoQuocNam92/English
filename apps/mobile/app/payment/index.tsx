import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  Image, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface PaymentOrderResponse {
  orderId: string;
  status: string;
  planId: string;
  amount: number;
  shortRef: string;
  bankName: string;
  bankAcc: string;
  accountName: string;
  qrUrl: string;
  expiresAt?: string;
}

export default function MobilePaymentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 phút đếm ngược
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showQRModal && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showQRModal, timeLeft]);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    setSelectedPlanId(planId);
    try {
      const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const res = await api.post<any>(
        '/payment/create-order',
        { planId },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );

      const data = res?.data || res;
      if (data && (data.qrUrl || data.orderId)) {
        setOrderData(data);
        setTimeLeft(900);
        setShowQRModal(true);
      } else {
        Alert.alert('Khởi tạo thành công', 'Vui lòng chuyển khoản theo mã thanh toán.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      Alert.alert('Lỗi thanh toán', err.message || 'Đã có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setLoading(false);
      setSelectedPlanId(null);
    }
  };

  const handleDownloadQR = async () => {
    if (!orderData?.qrUrl) return;
    try {
      setDownloading(true);
      const filename = `SePay_QR_${orderData.shortRef || 'TE'}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloaded = await FileSystem.downloadAsync(orderData.qrUrl, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloaded.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Lưu hoặc chia sẻ mã QR SePay',
          UTI: 'public.jpeg'
        });
      } else {
        Alert.alert('Đã tải ảnh', `Mã QR đã được lưu tại: ${downloaded.uri}`);
      }
    } catch (err: any) {
      console.error('Download QR failed:', err);
      Alert.alert('Thông báo', 'Bạn có thể chụp màn hình mã QR này để lưu lại.');
    } finally {
      setDownloading(false);
    }
  };

  const checkStatus = async () => {
    if (!orderData?.orderId) return;
    try {
      const res = await api.get<any>(`/payment/status/${orderData.orderId}`);
      const status = res?.status || res?.data?.status;
      if (status === 'paid' || status === 'completed') {
        Alert.alert('Thành công', 'Thanh toán thành công! Tài khoản của bạn đã được nâng cấp lên PRO.', [
          { text: 'OK', onPress: () => { setShowQRModal(false); router.replace('/(tabs)/profile'); } }
        ]);
      } else {
        Alert.alert('Thông báo', 'Hệ thống đang kiểm tra giao dịch chuyển khoản. Vui lòng chờ trong giây lát hoặc làm mới lại.');
      }
    } catch (err) {
      Alert.alert('Thông báo', 'Đang cập nhật trạng thái thanh toán từ ngân hàng.');
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nâng cấp PRO</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/payment/history' as any)}>
          <MaterialIcons name="history" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Chọn gói phù hợp với bạn</Text>

        {/* Gói 1 Tháng */}
        <TouchableOpacity 
          style={styles.planCard} 
          onPress={() => handleSelectPlan('pro_monthly')} 
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Gói PRO 1 Tháng</Text>
            <Text style={styles.planDesc}>Luyện tập cơ bản linh hoạt theo tháng</Text>
            <Text style={styles.planPrice}>99,000đ<Text style={styles.planPeriod}>/tháng</Text></Text>
          </View>
          {loading && selectedPlanId === 'pro_monthly' && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Gói 3 Tháng */}
        <TouchableOpacity 
          style={styles.planCard} 
          onPress={() => handleSelectPlan('pro_quarterly')} 
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.planInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.planName}>Gói PRO 3 Tháng</Text>
              <View style={[styles.badge, { backgroundColor: '#e0f2fe' }]}>
                <Text style={[styles.badgeText, { color: '#0369a1' }]}>TIẾT KIỆM 16%</Text>
              </View>
            </View>
            <Text style={styles.planDesc}>Chỉ ~83k/tháng · Tiết kiệm 16% chi phí</Text>
            <Text style={styles.planPrice}>249,000đ<Text style={styles.planPeriod}>/3 tháng</Text></Text>
          </View>
          {loading && selectedPlanId === 'pro_quarterly' && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Gói 6 Tháng */}
        <TouchableOpacity 
          style={styles.planCard} 
          onPress={() => handleSelectPlan('pro_halfyear')} 
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.planInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.planName}>Gói PRO 6 Tháng</Text>
              <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.badgeText, { color: '#15803d' }]}>TIẾT KIỆM 25%</Text>
              </View>
            </View>
            <Text style={styles.planDesc}>Chỉ ~74k/tháng · Phù hợp lộ trình trung hạn</Text>
            <Text style={styles.planPrice}>449,000đ<Text style={styles.planPeriod}>/6 tháng</Text></Text>
          </View>
          {loading && selectedPlanId === 'pro_halfyear' && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Gói 1 Năm */}
        <TouchableOpacity 
          style={styles.planCard} 
          onPress={() => handleSelectPlan('pro_yearly')} 
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.planInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.planName}>Gói PRO 1 Năm</Text>
              <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.badgeText, { color: '#b45309' }]}>👑 ƯU ĐÃI KHỦNG -33%</Text>
              </View>
            </View>
            <Text style={styles.planDesc}>Chỉ ~66k/tháng · Tiết kiệm tối đa 33% chi phí</Text>
            <Text style={styles.planPrice}>799,000đ<Text style={styles.planPeriod}>/năm</Text></Text>
          </View>
          {loading && selectedPlanId === 'pro_yearly' && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </TouchableOpacity>

        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>Quyền lợi tất cả các gói PRO:</Text>
          <View style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={18} color="#16a34a" />
            <Text style={styles.featureText}>Không giới hạn lượt thi thử & luyện tập</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={18} color="#16a34a" />
            <Text style={styles.featureText}>Xem đáp án & giải thích Tiếng Việt chi tiết</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={18} color="#16a34a" />
            <Text style={styles.featureText}>Phát âm chuẩn giọng đọc từ vựng Chuyên ngành</Text>
          </View>
        </View>
      </ScrollView>

      {/* In-App VietQR Payment Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Thanh toán VietQR SePay</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.qrModalBody} showsVerticalScrollIndicator={false}>
              {/* Expiration Timer Badge */}
              <View style={styles.timerBadge}>
                <MaterialIcons name="timer" size={16} color="#b45309" />
                <Text style={styles.timerBadgeText}>Mã hết hạn sau: <Text style={{ fontWeight: '800' }}>{formatTimer(timeLeft)}</Text></Text>
              </View>

              {/* VietQR Image Container */}
              {orderData?.qrUrl ? (
                <View style={styles.qrImageContainer}>
                  <Image 
                    source={{ uri: orderData.qrUrl }} 
                    style={styles.qrImage} 
                    resizeMode="contain" 
                  />
                  <Text style={styles.qrScanHint}>Quét mã QR bằng App Ngân hàng bất kỳ</Text>
                </View>
              ) : null}

              {/* Transfer Information Breakdown */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ngân hàng:</Text>
                  <Text style={styles.infoValue}>{orderData?.bankName || 'MBBank'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số tài khoản:</Text>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>{orderData?.bankAcc || '0901234567'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chủ tài khoản:</Text>
                  <Text style={styles.infoValue}>{orderData?.accountName || 'HO QUOC NAM'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tổng tiền:</Text>
                  <Text style={[styles.infoValue, { color: '#16a34a', fontSize: 16 }]}>
                    {orderData?.amount ? `${orderData.amount.toLocaleString('vi-VN')}đ` : '0đ'}
                  </Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Mã nội dung (TE):</Text>
                  <Text style={[styles.infoValue, { color: '#d97706', fontWeight: '800' }]}>
                    {orderData?.shortRef}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity 
                  style={styles.downloadBtn} 
                  onPress={handleDownloadQR}
                  disabled={downloading}
                >
                  {downloading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <MaterialIcons name="download" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.downloadBtnText}>Tải / Chia sẻ QR</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.confirmPaidBtn} 
                  onPress={checkStatus}
                >
                  <MaterialIcons name="check-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmPaidText}>Tôi đã chuyển</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  planCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: spacing.lg, borderWidth: 1.5, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planCardBestValue: { borderColor: colors.primary, backgroundColor: '#faf5ff' },
  planInfo: { flex: 1, gap: 4 },
  planName: { fontSize: 16, fontWeight: '800', color: colors.text },
  planDesc: { fontSize: 12, color: colors.mutedText },
  planPrice: { fontSize: 20, fontWeight: '800', color: colors.primary, marginTop: 4 },
  planPeriod: { fontSize: 14, fontWeight: '600', color: colors.mutedText },
  badge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#b45309' },
  featureBox: { marginTop: spacing.md, backgroundColor: '#ffffff', borderRadius: 14, padding: spacing.md, gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  featureTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: colors.text },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  qrModalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: spacing.xl },
  qrModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  qrModalTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  qrModalBody: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  timerBadgeText: { fontSize: 12, color: '#92400e' },
  qrImageContainer: { alignItems: 'center', backgroundColor: '#ffffff', padding: spacing.md, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  qrImage: { width: 220, height: 220 },
  qrScanHint: { fontSize: 11, color: colors.mutedText, marginTop: 6, fontWeight: '600' },
  infoCard: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 14, padding: spacing.md, borderWidth: 1, borderColor: '#e2e8f0' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 13, color: colors.mutedText, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  modalActionRow: { flexDirection: 'row', width: '100%', gap: spacing.md, marginTop: spacing.xs },
  downloadBtn: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: colors.primary, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  downloadBtnText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  confirmPaidBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmPaidText: { color: '#ffffff', fontSize: 14, fontWeight: '800' }
});
