import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

/** Convert any API value (string | object | null) to a renderable string */
function safeText(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val || fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    return String(val.text ?? val.name ?? val.title ?? val.content ?? val.value ?? fallback);
  }
  return fallback;
}

export default function MobileLessonDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [resLesson, resProgress] = await Promise.allSettled([
        api.get<any>(`/lessons/${id}`),
        api.get<any>('/progress/me')
      ]);

      if (resLesson.status === 'fulfilled') {
        setLesson(resLesson.value.data || resLesson.value);
      } else {
        throw new Error('Lỗi tải bài học.');
      }

      if (resProgress.status === 'fulfilled') {
        const progData = resProgress.value.data || resProgress.value;
        const progressList = progData.progress || [];
        const found = progressList.some((p: any) => 
          (p.resourceId === id || p.lessonId === id) && 
          (p.status === 'completed' || p.completedAt || p.isCompleted)
        );
        setIsCompleted(found);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    try {
      setMarking(true);
      await api.post(`/progress/mark-lesson/${id}`, {});
      setIsCompleted(true);
      alert('Tuyệt vời! Bạn đã hoàn thành bài học này!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đánh dấu. Vui lòng thử lại.');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error || 'Không tìm thấy bài học.'}</Text>
        <TouchableOpacity onPress={fetchData} style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#464555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {safeText(lesson.domain, 'Lesson Details')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{safeText(lesson.title, 'Bài học')}</Text>
        
        {lesson.description ? (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{safeText(lesson.description)}</Text>
          </View>
        ) : null}

        <View style={styles.article}>
          <View style={styles.sectionsContainer}>
            <Text style={styles.sectionTitle}>Nội dung bài học</Text>
            {(lesson.sections || []).map((sec: any, index: number) => (
              <View key={sec.id || index} style={styles.sectionItem}>
                <View style={styles.sectionBullet}>
                  <Text style={styles.sectionBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.sectionText}>
                  {safeText(sec.title) || safeText(sec.content) || `Phần ${index + 1}`}
                </Text>
              </View>
            ))}
            {(!lesson.sections || lesson.sections.length === 0) && (
              <Text style={{ color: '#464555', marginTop: 8 }}>Không có dữ liệu phần nội dung.</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 12, padding: 14 }} onPress={() => router.push(`/ai-tutor?lessonId=${id}` as any)}>
          <MaterialIcons name="forum" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700' }}>Hỏi AI Tutor về bài này</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Actions Fixed */}
      <View style={styles.bottomFixedArea}>
        <TouchableOpacity
          style={styles.btnStudy}
          onPress={() => router.push(`/lessons/vocabulary/${id}` as any)}
        >
          <MaterialIcons name="menu-book" size={20} color={colors.primary} />
          <Text style={styles.btnStudyText}>Học từ vựng ({lesson.vocabularyCount || lesson.termsCount || (lesson.vocabulary ? lesson.vocabulary.length : 0) || 0})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.btnComplete,
            isCompleted && { backgroundColor: '#16a34a' },
            marking && { opacity: 0.7 }
          ]}
          onPress={markComplete}
          disabled={marking || isCompleted}
        >
          <MaterialIcons 
            name="check-circle" 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.btnCompleteText}>
            {marking ? 'Đang xử lý...' : (isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 20, // adjust for safe area roughly
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    marginTop: 20 // safearea
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#191c1e'
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 160 // Room for bottom bar
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
    lineHeight: 38
  },
  descriptionBox: {
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  descriptionText: {
    fontSize: 14,
    color: '#464555',
    lineHeight: 22
  },
  article: {
    gap: spacing.lg
  },
  sectionsContainer: {
    marginTop: spacing.sm
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: spacing.sm
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  sectionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2dfff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  sectionBulletText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  sectionText: {
    flex: 1,
    fontSize: 16,
    color: '#191c1e',
    lineHeight: 24
  },
  bottomFixedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: spacing.md,
    paddingBottom: 32, // safe area
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f2f4f6'
  },
  btnStudy: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.primary,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnStudyText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  btnComplete: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnCompleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
});
