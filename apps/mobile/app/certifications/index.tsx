import { Text, Button, ListTools, Badge } from '../../src/shared/ui/primitives';
import { Card, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { FeatureScreen, EmptyState } from '../../src/shared/ui/FeatureScreen';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { colors } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

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

  return <FeatureScreen title="Chứng chỉ" subtitle="Xây kiến thức vững, tự tin bước vào kỳ thi" embedded={embedded}>
    <ListTools search={search} onSearch={setSearch} placeholder="Tìm chứng chỉ, nhà cung cấp…" filters={[{ value: '', label: 'Tất cả' }, { value: 'started', label: 'Đang học' }, { value: 'new', label: 'Chưa bắt đầu' }]} value={filter} onFilter={setFilter} />
    <View style={styles.intro}><View style={{ flex: 1 }}><Text style={styles.heading}>Chọn mục tiêu tiếp theo</Text><Text style={styles.secondary}>{filteredCertificates.length} chứng chỉ phù hợp</Text></View><View style={styles.introIcon}><MaterialIcons name="workspace-premium" size={28} color="#6054c8" /></View></View>
    {loading ? <ActivityIndicator style={{ marginVertical: 40 }} color={colors.primary} /> : error ? <View style={styles.state}><Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text><Button onPress={fetchCertifications}>Thử lại</Button></View> : <View style={{ gap: 16 }}>
      {filteredCertificates.map(cert => {
        const readiness = Math.min(100, Math.max(0, cert.readinessPercent ?? 0));
        return <Card key={cert.id || cert.code} mode="outlined" style={styles.card} onPress={() => handleOpenCertification(cert)} accessibilityLabel={`Xem lộ trình ${cert.name}`}>
          <Card.Content style={{ gap: 14, padding: 20 }}>
            <View style={styles.providerRow}><Text style={styles.provider}>{cert.provider || 'Chứng chỉ CNTT'}</Text><Text style={styles.code}>{cert.code}</Text></View>
            <Text style={styles.name}>{cert.name}</Text>
            {cert.description ? <Text numberOfLines={3} style={styles.description}>{cert.description}</Text> : null}
            <View style={styles.domains}>{(cert.domains ?? []).map(item => <Badge key={item.domain.id} tone="muted">{item.domain.name}</Badge>)}</View>
            <View style={styles.progressLabel}><Text style={styles.secondary}>Tiến độ học tập</Text><Text style={styles.percent}>{readiness}%</Text></View>
            <ProgressBar progress={readiness / 100} color={colors.primary} style={styles.progress} />
            <View style={styles.footer}><Text style={styles.link}>{readiness > 0 ? 'Tiếp tục lộ trình' : 'Khám phá lộ trình'}</Text><MaterialIcons name="arrow-forward" size={22} color="#6054c8" /></View>
          </Card.Content>
        </Card>;
      })}
      {!filteredCertificates.length && <View style={styles.state}><EmptyState icon="workspace-premium" title="Chưa có chứng chỉ phù hợp" detail="Thử đổi từ khóa hoặc xóa bộ lọc để xem các lộ trình khác." /><Button mode="outlined" onPress={() => { setSearch(''); setFilter(''); }}>Xóa bộ lọc</Button></View>}
    </View>}
  </FeatureScreen>;
}
const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, marginTop: 8 }, heading: { fontSize: 22, fontWeight: '700', color: '#17213a', marginBottom: 4 }, introIcon: { padding: 14, borderRadius: 18, backgroundColor: '#eeecff' }, secondary: { fontSize: 14, color: '#59657c' },
  card: { borderColor: '#e4e8f1', borderRadius: 22, backgroundColor: '#ffffff', overflow: 'hidden' }, providerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, provider: { fontSize: 13, color: '#6054c8', fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }, code: { fontSize: 13, color: '#59657c', backgroundColor: '#f0f2f8', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  name: { fontSize: 20, fontWeight: '700', lineHeight: 29, color: '#17213a' }, description: { fontSize: 15, lineHeight: 23, color: '#59657c' }, domains: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, progressLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, percent: { fontSize: 15, color: '#6054c8', fontWeight: '700' }, progress: { height: 6, borderRadius: 3, backgroundColor: '#eeecff' }, footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#eef0f5' }, link: { flex: 1, fontSize: 15, fontWeight: '700', color: '#6054c8' }, state: { alignItems: 'center', gap: 12 },
});
