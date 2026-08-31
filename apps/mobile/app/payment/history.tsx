import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  RefreshControl,
  Alert,
  Modal,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ITEMS_PER_PAGE = 5;

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal QR state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSub, resOrders] = await Promise.allSettled([
        api.get<any>('/payment/subscription/me'),
        api.get<any>('/payment/history/me'),
      ]);

      if (resSub.status === 'fulfilled') {
        setSubscription(resSub.value?.data || resSub.value);
      }
      if (resOrders.status === 'fulfilled') {
        const orderData = resOrders.value?.data || resOrders.value;
        setOrders(Array.isArray(orderData) ? orderData : []);
      }
    } catch (err: any) {
      console.error('Fetch payment history error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOrderPress = (item: any) => {
    if (item.status === 'paid' || item.status === 'completed') {
      Alert.alert('Đơn hàng đã hoàn tất', `Mã đơn ${item.shortRef} đã thanh toán thành công vào ${new Date(item.paidAt || item.createdAt).toLocaleDateString('vi-VN')}.`);
      return;
    }

    if (item.status === 'pending') {
      const expires = item.expiresAt ? new Date(item.expiresAt).getTime() : Date.now() + 900000;
      const remainingSecs = Math.max(0, Math.floor((expires - Date.now()) / 1000));

      if (remainingSecs <= 0) {
        Alert.alert('Đơn hàng đã hết hạn', 'Đơn hàng này đã quá thời gian 15 phút. Vui lòng quay lại tạo đơn hàng mới.');
        return;
      }

      setSelectedOrder(item);
      setTimeLeft(remainingSecs);
      setShowQRModal(true);
      return;
    }

    Alert.alert('Thông báo', `Đơn hàng ${item.shortRef} ở trạng thái: ${item.status}.`);
  };

  const handleDownloadQR = async () => {
    if (!selectedOrder?.qrUrl) return;
    try {
      setDownloading(true);
      const filename = `SePay_QR_${selectedOrder.shortRef || 'TE'}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloaded = await FileSystem.downloadAsync(selectedOrder.qrUrl, fileUri);
      
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
    if (!selectedOrder?.id) return;
    try {
      const res = await api.get<any>(`/payment/status/${selectedOrder.id}`);
      const status = res?.status || res?.data?.status;
      if (status === 'paid' || status === 'completed') {
        Alert.alert('Thành công', 'Thanh toán thành công! Tài khoản của bạn đã được nâng cấp lên PRO.', [
          { text: 'OK', onPress: () => { setShowQRModal(false); fetchData(); } }
        ]);
      } else {
        Alert.alert('Thông báo', 'Hệ thống đang kiểm tra giao dịch chuyển khoản. Vui lòng chờ trong giây lát.');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return { label: 'Đã thanh toán', bg: '#dcfce7', text: '#15803d' };
      case 'pending':
        return { label: 'Chờ thanh toán', bg: '#fef3c7', text: '#b45309' };
      case 'expired':
      case 'cancelled':
        return { label: 'Đã hủy / Hết hạn', bg: '#f1f5f9', text: '#64748b' };
      default:
        return { label: status, bg: '#f1f5f9', text: '#64748b' };
    }
  };

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
  const currentOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói dịch vụ & Lịch sử thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Current Subscription Card */}
          <View style={styles.subCard}>
            <View style={styles.subCardHeader}>
              <MaterialIcons 
                name={subscription?.isPro ? "workspace-premium" : "account-circle"} 
                size={28} 
                color={colors.primary} 
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.subCardTitle}>
                  {subscription?.isPro ? (subscription?.planName || 'Gói PRO đang dùng') : 'Tài khoản Miễn phí (Standard)'}
                </Text>
                <Text style={styles.subCardSubtitle}>
                  {subscription?.isPro 
                    ? `Hạn dùng: ${new Date(subscription.expiresAt).toLocaleDateString('vi-VN')} (${subscription.daysRemaining || 0} ngày)`
                    : 'Nâng cấp PRO để mở khóa không giới hạn bài học & đề thi'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.upgradeBtn, subscription?.isPro && { backgroundColor: '#1e293b' }]}
              onPress={() => router.push('/payment')}
            >
              <MaterialIcons name="bolt" size={18} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.upgradeBtnText}>
                {subscription?.isPro ? 'Gia hạn / Nâng cấp gói' : 'Nâng cấp PRO Ngay'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Lịch sử đơn hàng ({orders.length})</Text>
            {orders.length > 0 && (
              <Text style={styles.paginationMeta}>Trang {currentPage}/{totalPages}</Text>
            )}
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="receipt-long" size={40} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có lịch sử giao dịch thanh toán nào.</Text>
            </View>
          ) : (
            <>
              {currentOrders.map((item) => {
                const badge = getStatusBadge(item.status);
                const isPending = item.status === 'pending';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.orderItem, isPending && styles.orderItemPending]}
                    activeOpacity={0.8}
                    onPress={() => handleOrderPress(item)}
                  >
                    <View style={styles.orderItemTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderRef}>Mã đơn: {item.shortRef || item.id.slice(0, 8)}</Text>
                        <Text style={styles.orderPlan}>{item.planName}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    {isPending && (
                      <View style={styles.pendingHintBox}>
                        <MaterialIcons name="qr-code-scanner" size={16} color="#d97706" />
                        <Text style={styles.pendingHintText}>Chạm vào đây để xem lại Mã QR & Chuyển khoản</Text>
                      </View>
                    )}

                    <View style={styles.orderItemDivider} />

                    <View style={styles.orderItemBottom}>
                      <Text style={styles.orderDate}>
                        📅 {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </Text>
                      <Text style={styles.orderAmount}>
                        {item.amount ? `${item.amount.toLocaleString('vi-VN')}đ` : '0đ'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                    onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <MaterialIcons name="chevron-left" size={20} color={currentPage === 1 ? '#cbd5e1' : colors.text} />
                    <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>Trang trước</Text>
                  </TouchableOpacity>

                  <Text style={styles.pageIndicator}>{currentPage} / {totalPages}</Text>

                  <TouchableOpacity
                    style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                    onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>Trang sau</Text>
                    <MaterialIcons name="chevron-right" size={20} color={currentPage === totalPages ? '#cbd5e1' : colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* In-App VietQR Payment Modal for Pending Order */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Xem lại Mã QR Thanh toán</Text>
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
              {selectedOrder?.qrUrl ? (
                <View style={styles.qrImageContainer}>
                  <Image 
                    source={{ uri: selectedOrder.qrUrl }} 
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
                  <Text style={styles.infoValue}>{selectedOrder?.bankName || 'MBBank'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số tài khoản:</Text>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>{selectedOrder?.bankAcc || '0901234567'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chủ tài khoản:</Text>
                  <Text style={styles.infoValue}>{selectedOrder?.accountName || 'HO QUOC NAM'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tổng tiền:</Text>
                  <Text style={[styles.infoValue, { color: '#16a34a', fontSize: 16 }]}>
                    {selectedOrder?.amount ? `${selectedOrder.amount.toLocaleString('vi-VN')}đ` : '0đ'}
                  </Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Mã nội dung (TE):</Text>
                  <Text style={[styles.infoValue, { color: '#d97706', fontWeight: '800' }]}>
                    {selectedOrder?.shortRef}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  subCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: '#e2e8f0', gap: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  subCardHeader: { flexDirection: 'row', alignItems: 'center' },
  subCardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  subCardSubtitle: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
  upgradeBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  upgradeBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  paginationMeta: { fontSize: 12, color: colors.mutedText, fontWeight: '600' },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', gap: 8 },
  emptyText: { color: colors.mutedText, fontSize: 13 },
  orderItem: { backgroundColor: '#ffffff', borderRadius: 14, padding: spacing.md, borderWidth: 1, borderColor: '#e2e8f0', gap: 8 },
  orderItemPending: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  orderItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderRef: { fontSize: 12, fontWeight: '700', color: colors.mutedText },
  orderPlan: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 2 },
  pendingHintBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 2 },
  pendingHintText: { fontSize: 11, fontWeight: '700', color: '#b45309' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  orderItemDivider: { height: 1, backgroundColor: '#f1f5f9' },
  orderItemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: 12, color: colors.mutedText },
  orderAmount: { fontSize: 16, fontWeight: '800', color: colors.primary },
  
  // Pagination
  paginationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  pageBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: '#f8fafc', borderColor: '#f1f5f9' },
  pageBtnText: { fontSize: 13, fontWeight: '700', color: colors.text },
  pageBtnTextDisabled: { color: '#cbd5e1' },
  pageIndicator: { fontSize: 13, fontWeight: '800', color: colors.text },

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
