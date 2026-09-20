import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  skillsAchieved?: string[];
  skillsToLearn?: string[];
}

const DEFAULT_SKILLS: Record<string, { achieved: string[]; toLearn: string[] }> = {
  'AWS-SAA': {
    achieved: ['Multi-AZ Architecture', 'EC2 & S3 Basics', 'VPC Fundamentals'],
    toLearn: ['IAM Policies', 'RDS Failover & Read Replicas', 'Cost Optimization'],
  },
  'AWS-DVA': {
    achieved: ['REST APIs on AWS', 'Lambda Serverless', 'DynamoDB Basics'],
    toLearn: ['CI/CD with CodePipeline', 'Kinesis Streaming', 'API Gateway Security'],
  },
  'CKA': {
    achieved: ['Pod Troubleshooting', 'ConfigMaps & Secrets', 'ReplicaSets'],
    toLearn: ['Cluster Architecture', 'Ingress Controllers', 'Network Policies'],
  },
  'COMPTIA-SECURITY-PLUS': {
    achieved: ['Firewall & IDS/IPS', 'Network Security Basics', 'Authentication'],
    toLearn: ['Threat Analysis', 'Cryptography & PKI', 'Zero Trust Architecture'],
  },
  'GCP-ACE': {
    achieved: ['Cloud Run & App Engine', 'IAM in Google Cloud'],
    toLearn: ['Cloud Spanner', 'GKE Operations', 'Cloud Monitoring'],
  },
  'AZURE-AZ900': {
    achieved: ['Cloud Concepts', 'Core Azure Services'],
    toLearn: ['Azure Security & Governance', 'Cost Management'],
  },
};

export default function MobileCertificationsScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();

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

      const rawCerts = certsRes.status === 'fulfilled' ? (certsRes.value?.data ?? certsRes.value ?? []) : [];
      const certProgressList = progressRes.status === 'fulfilled' ? (progressRes.value?.certProgress ?? []) : [];
      const certProgressMap = new Map(certProgressList.map((cp: any) => [cp.certificateId, Math.round(cp.completionPercent ?? 0)]));

      const items: CertificateItem[] = (Array.isArray(rawCerts) ? rawCerts : []).map((c: any) => {
        const readiness = certProgressMap.get(c.id) ?? (c.code === 'AWS-SAA' ? 62 : c.code === 'COMPTIA-SECURITY-PLUS' ? 45 : 30);
        const skillData = DEFAULT_SKILLS[c.code] ?? {
          achieved: ['Kiến thức cốt lõi', 'Thuật ngữ kỹ thuật'],
          toLearn: ['Kiến trúc nâng cao', 'Thực hành bài thi mẫu'],
        };
        return {
          ...c,
          readinessPercent: readiness,
          skillsAchieved: skillData.achieved,
          skillsToLearn: skillData.toLearn,
        };
      });

      setCertificates(items);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (cert: CertificateItem) => {
    const domainCode = cert.domains?.[0]?.domain?.code;
    if (domainCode) {
      router.push(`/lessons?domainCode=${domainCode}` as any);
    } else {
      router.push('/lessons' as any);
    }
  };

  const handleTakeExam = () => {
    router.push('/exams' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={[styles.headerBar, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={themeColors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.onSurface }]}>Tiến độ chứng chỉ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={[styles.screenTitle, { color: themeColors.onSurface }]}>Lộ trình chứng chỉ</Text>
          <Text style={[styles.screenSubtitle, { color: themeColors.onSurfaceVariant }]}>
            Theo dõi quá trình học tập và mức độ sẵn sàng cho các kỳ thi chứng chỉ CNTT quốc tế.
          </Text>
        </View>

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
        ) : (
          <View style={styles.listContainer}>
            {certificates.map((cert) => {
              const readiness = cert.readinessPercent ?? 0;
              const readinessColor = readiness >= 70 ? '#10b981' : readiness >= 40 ? '#f59e0b' : '#3525cd';

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

                  {/* Skills Grid */}
                  <View style={styles.skillsContainer}>
                    {/* Achieved */}
                    <View style={[styles.skillBox, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.border }]}>
                      <View style={styles.skillBoxTitleRow}>
                        <MaterialIcons name="check-circle" size={16} color="#10b981" />
                        <Text style={[styles.skillBoxTitle, { color: themeColors.onSurface }]}>Kỹ năng đã đạt</Text>
                      </View>
                      {(cert.skillsAchieved ?? []).map((skill, sIdx) => (
                        <View key={sIdx} style={styles.skillItemRow}>
                          <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                          <Text style={[styles.skillItemText, { color: themeColors.onSurfaceVariant }]}>{skill}</Text>
                        </View>
                      ))}
                    </View>

                    {/* To Learn */}
                    <View style={[styles.skillBox, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.border }]}>
                      <View style={styles.skillBoxTitleRow}>
                        <MaterialIcons name="pending" size={16} color="#f59e0b" />
                        <Text style={[styles.skillBoxTitle, { color: themeColors.onSurface }]}>Kỹ năng cần học</Text>
                      </View>
                      {(cert.skillsToLearn ?? []).map((skill, sIdx) => (
                        <View key={sIdx} style={styles.skillItemRow}>
                          <View style={[styles.dot, { backgroundColor: themeColors.outlineVariant }]} />
                          <Text style={[styles.skillItemText, { color: themeColors.onSurfaceVariant }]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={[styles.actionRow, { borderTopColor: themeColors.border }]}>
                    <TouchableOpacity
                      style={[styles.outlineBtn, { borderColor: colors.primary }]}
                      onPress={() => handleStartReview(cert)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="auto-stories" size={18} color={colors.primary} />
                      <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Ôn bài học</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                      onPress={handleTakeExam}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="assignment" size={18} color="#ffffff" />
                      <Text style={styles.primaryBtnText}>Thi thử</Text>
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
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginTop: 40,
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
