import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

export default function MobileLessonDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<any>(`/lessons/${id}`);
      setLesson(response.data || response);
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
      alert('Đã đánh dấu hoàn thành bài học!');
      router.back();
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
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bài học</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.domainTag}>
          <Text style={styles.domainTagText}>{lesson.domain || 'Lĩnh vực khác'}</Text>
        </View>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.meta}>
          ⏱ {lesson.durationMinutes || lesson.duration || 15} phút · 📖 {lesson.vocabularyCount || lesson.termsCount || (lesson.vocabulary ? lesson.vocabulary.length : 0) || 0} thuật ngữ
        </Text>
        
        {lesson.description ? (
          <Text style={styles.description}>{lesson.description}</Text>
        ) : null}

        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionTitle}>Các phần nội dung:</Text>
          {(lesson.sections || []).map((sec: any, index: number) => (
            <View key={index} style={styles.sectionItem}>
              <MaterialIcons name="label-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionText}>{sec.title || sec}</Text>
            </View>
          ))}
          {(!lesson.sections || lesson.sections.length === 0) && (
            <Text style={{ color: colors.mutedText, marginTop: 8 }}>Không có dữ liệu phần nội dung.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnStudy}
          onPress={() => router.push(`/lessons/vocabulary/${id}` as any)}
        >
          <MaterialIcons name="local-library" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnStudyText}>Học từ vựng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnComplete, marking && { opacity: 0.7 }]}
          onPress={markComplete}
          disabled={marking}
        >
          <MaterialIcons name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnCompleteText}>
            {marking ? 'Đang xử lý...' : 'Đánh dấu hoàn thành'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  content: {
    padding: spacing.lg
  },
  domainTag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.md
  },
  domainTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm
  },
  meta: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: spacing.lg
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  sectionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: spacing.md
  },
  btnStudy: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnStudyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  btnComplete: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnCompleteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  }
});
