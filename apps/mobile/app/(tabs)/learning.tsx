import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

interface ModuleSection {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lessons: {
    id: string;
    title: string;
    duration: number;
    termsCount: number;
    status: 'completed' | 'in_progress' | 'locked';
  }[];
}

export default function MobileLearningScreen() {
  const router = useRouter();
  const [modules, setModules] = useState<ModuleSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<any>('/lessons?limit=20');
      const data = response.data || response;
      const lessonsArray = Array.isArray(data) ? data : data.items || [];

      const grouped = lessonsArray.reduce((acc: any, lesson: any) => {
        const domain = lesson.domain || 'Lĩnh vực khác';
        if (!acc[domain]) {
          acc[domain] = {
            id: domain,
            title: domain,
            progress: 0,
            totalLessons: 0,
            completedLessons: 0,
            lessons: []
          };
        }
        acc[domain].totalLessons += 1;
        // Just mock some progress logic based on real data
        const isCompleted = lesson.status === 'completed';
        if (isCompleted) acc[domain].completedLessons += 1;
        
        acc[domain].lessons.push({
          id: lesson._id || lesson.id,
          title: lesson.title,
          duration: lesson.durationMinutes || lesson.duration || 15,
          termsCount: lesson.vocabularyCount || lesson.termsCount || (lesson.vocabulary ? lesson.vocabulary.length : 0) || 0,
          status: lesson.status || 'in_progress'
        });
        return acc;
      }, {});
      
      // Calculate progress percentage
      Object.values(grouped).forEach((mod: any) => {
        mod.progress = mod.totalLessons > 0 ? Math.round((mod.completedLessons / mod.totalLessons) * 100) : 0;
      });

      setModules(Object.values(grouped));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lộ trình học tập</Text>
          <Text style={styles.subtitle}>Danh sách bài học của bạn</Text>
        </View>
        <View style={styles.overallBadge}>
          <Text style={styles.overallBadgeText}>Đang cập nhật</Text>
        </View>
      </View>

      {/* Modules List */}
      <View style={styles.modulesContainer}>
        {modules.map((mod) => (
          <View key={mod.id} style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <View style={styles.moduleHeaderLeft}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleMeta}>
                  {mod.completedLessons}/{mod.totalLessons} bài học hoàn thành
                </Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>{mod.progress}%</Text>
              </View>
            </View>

            <View style={styles.lessonsList}>
              {mod.lessons.map((lesson) => {
                const isLocked = lesson.status === 'locked';
                const isCompleted = lesson.status === 'completed';

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.lessonItem, isLocked && styles.lessonItemLocked]}
                    disabled={isLocked}
                    onPress={() => router.push(`/lessons/${lesson.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.statusIcon,
                        isCompleted && styles.statusIconCompleted,
                        isLocked && styles.statusIconLocked
                      ]}
                    >
                      <MaterialIcons
                        name={isCompleted ? 'check' : isLocked ? 'lock' : 'play-arrow'}
                        size={18}
                        color={isCompleted ? '#ffffff' : isLocked ? colors.outline : colors.primary}
                      />
                    </View>

                    <View style={styles.lessonInfo}>
                      <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]} numberOfLines={2}>
                        {lesson.title}
                      </Text>
                      <Text style={styles.lessonSubtitle}>
                        ⏱ {lesson.duration} phút · 📖 {lesson.termsCount} thuật ngữ
                      </Text>
                    </View>

                    {!isLocked && <MaterialIcons name="chevron-right" size={20} color={colors.outline} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        {modules.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 20, color: colors.mutedText }}>Chưa có bài học nào.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: 50,
    paddingBottom: 40,
    gap: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 2
  },
  overallBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  overallBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary
  },
  modulesContainer: {
    gap: spacing.lg
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.md
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  moduleHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text
  },
  moduleMeta: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2
  },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary
  },
  progressCircleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary
  },
  lessonsList: {
    gap: spacing.sm
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    gap: spacing.sm
  },
  lessonItemLocked: {
    opacity: 0.6
  },
  statusIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusIconCompleted: {
    backgroundColor: '#16a34a'
  },
  statusIconLocked: {
    backgroundColor: '#e2e8f0'
  },
  lessonInfo: {
    flex: 1
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  lessonTitleLocked: {
    color: colors.outline
  },
  lessonSubtitle: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2
  }
});
