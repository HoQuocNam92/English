import { Text, TouchableOpacity, ListTools, Badge } from '../../src/shared/ui/primitives';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { useTheme } from '../../src/shared/store/theme-context';

interface CertificateItem {
  id: string;
  code: string;
  name: string;
  provider: string;
  description: string;
  examUrl?: string;
  domains?: { domain: { id: string; code: string; name: string } }[];
  readinessPercent?: number;
}

export default function MobileCertificationsScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError('');
      const [certsRes, progressRes]: any = await Promise.allSettled([
        api.get<any>('/certificates'),
        api.get<any>('/progress/me'),
      ]);

      if (certsRes.status === 'rejected') throw certsRes.reason;
      const rawCerts = certsRes.status === 'fulfilled' ? (certsRes.value?.data ?? certsRes.value ?? []) : [];
      const certProgressList = progressRes.status === 'fulfilled' ? (progressRes.value?.certProgress ?? []) : [];
      const certProgressMap = new Map(certProgressList.map((cp: any) => [cp.certificateId, Math.round(cp.completionPercent ?? 0)]));

      const items: CertificateItem[] = (Array.isArray(rawCerts) ? rawCerts : []).map((c: any) => {
        const readiness = certProgressMap.get(c.id) ?? 0;
        return {
          ...c,
          readinessPercent: readiness,
        };
      });

      setCertificates(items);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCertification = (cert: CertificateItem) => {
    router.push({
      pathname: '/certifications/[id]',
      params: { id: cert.id || cert.code, code: cert.code, name: cert.name, progress: String(cert.readinessPercent ?? 0) },
    } as any);
  };

  const filteredCertificates = certificates.filter(cert => `${cert.name} ${cert.code} ${cert.provider}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))
    && (!filter || ((cert.readinessPercent ?? 0) > 0) === (filter === 'started')));

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 12, backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        {!embedded && <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={themeColors.onSurface} />
        </TouchableOpacity>}
        <Text style={[styles.headerTitle, { color: themeColors.onSurface }]}>Luyện thi chứng chỉ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={[styles.screenTitle, { color: themeColors.onSurface }]}>Luyện thi chứng chỉ</Text>
          <Text style={[styles.screenSubtitle, { color: themeColors.onSurfaceVariant }]}>
            Theo dõi quá trình học tập và mức độ sẵn sàng cho các kỳ thi chứng chỉ CNTT quốc tế.
          </Text>
        </View>

        <ListTools search={search} onSearch={setSearch} placeholder="Tìm tên, mã hoặc nhà cung cấp chứng chỉ" filters={[{ value: '', label: 'Tất cả tiến độ' }, { value: 'started', label: 'Đã bắt đầu học' }, { value: 'new', label: 'Chưa bắt đầu' }]} value={filter} onFilter={setFilter} />
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.onSurfaceVariant }]}>Đang tải dữ liệu chứng chỉ...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={48} color={themeColors.error} />
            <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCertifications}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : certificates.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="workspace-premium" size={48} color={themeColors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: themeColors.onSurfaceVariant }]}>Chưa có thông tin chứng chỉ nào.</Text>
          </View>
        ) : filteredCertificates.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="filter-list-off" size={48} color={themeColors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: themeColors.onSurfaceVariant, textAlign: 'center' }]}>
              {filter === 'started' ? 'Chưa có chứng chỉ nào bạn đã bắt đầu học.' : filter === 'new' ? 'Bạn đã bắt đầu học tất cả chứng chỉ.' : 'Không có chứng chỉ phù hợp với từ khóa.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => { setSearch(''); setFilter(''); }}>
              <Text style={styles.retryButtonText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredCertificates.map((cert) => {
              const readiness = cert.readinessPercent ?? 0;
              const readinessColor = colors.primary;

              return (
                <View
                  key={cert.id || cert.code}
                  style={[
                    styles.certCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    },
                  ]}
                >
                  {/* Top Color Indicator */}
                  <View style={[styles.topProgressTrack, { backgroundColor: themeColors.surfaceContainer }]}>
                    <View style={[styles.topProgressBar, { width: `${readiness}%`, backgroundColor: readinessColor }]} />
                  </View>

                  {/* Header info */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.providerText, { color: colors.primary }]}>{cert.provider}</Text>
                      <Text style={[styles.certName, { color: themeColors.onSurface }]}>{cert.name}</Text>
                      <Text style={[styles.codeBadge, { color: themeColors.onSurfaceVariant }]}>Mã: {cert.code}</Text>
                    </View>
                    <View style={styles.readinessBox}>
                      <Text style={[styles.readinessLabel, { color: themeColors.onSurfaceVariant }]}>Mức độ sẵn sàng</Text>
                      <Text style={[styles.readinessScore, { color: readinessColor }]}>{readiness}%</Text>
                    </View>
                  </View>

                  <Text style={[styles.certDesc, { color: themeColors.onSurfaceVariant }]} numberOfLines={3}>
                    {cert.description}
                  </Text>

                  <View style={styles.skillsContainer}>
                    {(cert.domains ?? []).map((item) => <Badge key={item.domain.id}>{item.domain.name}</Badge>)}
                    {!(cert.domains ?? []).length && <Text style={[styles.certDesc, { color: themeColors.onSurfaceVariant }]}>Chưa cấu hình Domain.</Text>}
                  </View>

                  {/* Actions */}
                  <View style={[styles.actionRow, { borderTopColor: themeColors.border }]}>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleOpenCertification(cert)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="auto-stories" size={18} color={colors.onPrimary} />
                      <Text style={styles.primaryBtnText}>Xem lộ trình</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    minHeight: 64,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  introBox: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    gap: spacing.md,
  },
  certCard: {
    minHeight: 300,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  topProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  topProgressBar: {
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: spacing.sm,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  certName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  codeBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  readinessBox: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  readinessLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  readinessScore: {
    fontSize: 22,
    fontWeight: '800',
  },
  certDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  skillsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  skillBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.sm,
  },
  skillBoxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  skillBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  skillItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  skillItemText: {
    fontSize: 12,
  },
  actionRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
