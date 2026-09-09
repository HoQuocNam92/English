import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

const FILTER_OPTIONS = ['Tất cả', 'Video', 'Reading', 'Vocabulary'];

export default function MobileLessonListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; type?: string; domainCode?: string }>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetchData();
    api.get<any>('/payment/subscription/me')
      .then(res => {
        const sub = res?.data || res;
        setIsPro(sub?.isPro ?? false);
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const query = new URLSearchParams({ limit: '50', status: 'published' });
      if (typeof params.type === 'string' && params.type) query.set('type', params.type);
      if (typeof params.domainCode === 'string' && params.domainCode) query.set('domainCode', params.domainCode);
      if (typeof params.q === 'string' && params.q) query.set('search', params.q);
      const response = await api.get<any>(`/lessons?${query.toString()}`);
      const data = response.data || response;
      setLessons(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonPress = (item: any) => {
    if (item.isProOnly && !isPro) {
      Alert.alert(
        '🌟 Gói PRO Chuyên Nghiệp',
        `Bài học "${item.title}" dành riêng cho tài khoản PRO. Bạn có muốn nâng cấp PRO để mở khóa toàn bộ bài học & đề thi không?`,
        [
          { text: 'Để sau', style: 'cancel' },
          { text: '🚀 Nâng cấp PRO', onPress: () => router.push('/payment') }
        ]
      );
      return;
    }
    router.push(`/lessons/${item._id || item.id}` as any);
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const type = (lesson.type || '').toLowerCase();
    let matchesFilter = true;
    if (activeFilter === 'Video') matchesFilter = type === 'video';
    else if (activeFilter === 'Reading') matchesFilter = ['technical_reading', 'api_documentation', 'case_study'].includes(type);
    else if (activeFilter === 'Vocabulary') matchesFilter = ['vocabulary', 'terminology'].includes(type);
    
    return matchesSearch && matchesFilter;
  });

  const getLessonIcon = (type: string) => {
    const lower = type?.toLowerCase() || '';
    if (lower.includes('video')) return 'play-circle';
    if (lower.includes('vocab')) return 'spellcheck';
    return 'article';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#191c1e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Cloud Computing</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#464555" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lessons..."
            placeholderTextColor="#464555"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity 
              key={opt}
              style={[styles.filterChip, activeFilter === opt && styles.filterChipActive]}
              onPress={() => setActiveFilter(opt)}
            >
              <Text style={[styles.filterChipText, activeFilter === opt && styles.filterChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity onPress={fetchData} style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 8 }}>
            <Text style={{ color: 'white' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredLessons.map((item, index) => {
            const lessonType = item.type || 'Reading';
            const progressVal = item.progressPercent || 0;

            return (
              <TouchableOpacity
                key={item._id || item.id}
                style={[styles.card, item.isProOnly && { borderColor: '#f59e0b', backgroundColor: '#fffbeb' }]}
                activeOpacity={0.8}
                onPress={() => handleLessonPress(item)}
              >
                <View style={styles.cardImageContainer}>
                  {item.thumbnailUrl ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <MaterialIcons name="text-snippet" size={32} color="#c7c4d8" />
                    </View>
                  )}
                  <View style={styles.typeBadgeIcon}>
                    <MaterialIcons name={getLessonIcon(lessonType)} size={14} color={colors.primary} />
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>{lessonType}</Text>
                    </View>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelTagText}>{typeof item.level === 'object' && item.level !== null ? (item.level.name ?? item.level.code ?? 'Beginner') : (item.level || 'Beginner')}</Text>
                    </View>
                    {item.isProOnly && (
                      <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#b45309' }}>PRO</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progressVal}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progressVal}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          {filteredLessons.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.mutedText }}>Không tìm thấy bài học phù hợp.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 40 // safearea
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4f6',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    height: 40,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#191c1e'
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8'
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555'
  },
  filterChipTextActive: {
    color: '#ffffff'
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 80
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f2f4f6',
    overflow: 'hidden',
    position: 'relative'
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8
  },
  typeBadgeIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 4,
    padding: 2
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  typeTag: {
    backgroundColor: '#e6e8ea',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#464555',
    textTransform: 'uppercase'
  },
  levelTag: {
    backgroundColor: '#eaddff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4
  },
  levelTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5c00ca',
    textTransform: 'uppercase'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: spacing.xs
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 'auto'
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e6e8ea',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  progressText: {
    fontSize: 12,
    color: '#464555'
  }
});
