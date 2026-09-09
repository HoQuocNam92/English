import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../../src/shared/api/api-client';
import { safeText } from '../../../src/shared/utils/safeText';
import * as Speech from 'expo-speech';

export default function MobileVocabularyLessonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<any>(`/vocabulary?lessonId=${id}`);
      const data = response.data || response;
      let items = Array.isArray(data) ? data : data.items || [];
      
      if (items.length === 0) {
        const fallbackRes = await api.get<any>('/vocabulary?limit=20');
        const fallbackData = fallbackRes.data || fallbackRes;
        items = Array.isArray(fallbackData) ? fallbackData : fallbackData.items || [];
      }
      
      setFlashcards(items);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải từ vựng. Vui lòng thử lại.');
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

  if (error || flashcards.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error || 'Chưa có từ vựng cho bài học này.'}</Text>
        {error && (
          <TouchableOpacity onPress={fetchData} style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 8, marginBottom: 10 }}>
            <Text style={{ color: 'white' }}>Thử lại</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];
  const total = flashcards.length;

  const term      = safeText(currentCard.term ?? currentCard.word, 'No Term');
  const phonetic  = safeText(currentCard.pronunciationIpa ?? currentCard.phonetic ?? currentCard.pronunciation);
  const type      = safeText(currentCard.partOfSpeech ?? currentCard.type, 'word');
  const defVi     = safeText(currentCard.definitionVi ?? currentCard.meaningVi ?? currentCard.defVi, 'Chưa có nghĩa tiếng Việt');
  
  const exampleObj = Array.isArray(currentCard.examples) ? currentCard.examples[0] : currentCard.example;
  const exampleEn  = safeText(typeof exampleObj === 'object' ? (exampleObj?.sentenceEn ?? exampleObj?.sentence) : exampleObj);

  const playSound = () => {
    if (term && term !== 'No Term') {
      Speech.speak(term, { language: 'en-US' });
    }
  };

  const handleNextCard = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    alert('Tuyệt vời! Bạn đã hoàn thành bài học từ vựng.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#464555" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>Từ vựng bài học</Text>
          <View style={styles.progressHeaderBar}>
            <View style={[styles.progressHeaderFill, { width: `${((currentIndex + 1) / total) * 100}%` }]} />
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tagBadge}>
          <MaterialIcons name="code" size={16} color={colors.primary} />
          <Text style={styles.tagBadgeText}>{type}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHero}>
            <Text style={styles.termText}>{term}</Text>
            <View style={styles.phoneticRow}>
              {phonetic ? <Text style={styles.phoneticText}>{phonetic}</Text> : null}
              <TouchableOpacity style={styles.soundButton} onPress={playSound}>
                <MaterialIcons name="volume-up" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardMeaning}>
            <Text style={styles.sectionLabel}>Ý NGHĨA</Text>
            <Text style={styles.meaningText}>{defVi}</Text>
          </View>

          {exampleEn ? (
            <View style={styles.cardExample}>
              <Text style={styles.sectionLabel}>VÍ DỤ</Text>
              <Text style={styles.exampleText}>"{exampleEn}"</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.navControls}>
          <TouchableOpacity 
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]} 
            onPress={handlePrevCard}
            disabled={currentIndex === 0}
          >
            <MaterialIcons name="navigate-before" size={20} color={currentIndex === 0 ? '#c7c4d8' : '#191c1e'} />
            <Text style={[styles.navBtnText, currentIndex === 0 && { color: '#c7c4d8' }]}>Từ trước</Text>
          </TouchableOpacity>
          <Text style={styles.navCountText}>{currentIndex + 1} / {total}</Text>
          <TouchableOpacity 
            style={[styles.navBtn, currentIndex === total - 1 && styles.navBtnDisabled]} 
            onPress={handleNextCard}
            disabled={currentIndex === total - 1}
          >
            <Text style={[styles.navBtnText, currentIndex === total - 1 && { color: '#c7c4d8' }]}>Từ tiếp</Text>
            <MaterialIcons name="navigate-next" size={20} color={currentIndex === total - 1 ? '#c7c4d8' : '#191c1e'} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions Fixed */}
      <View style={styles.bottomFixedArea}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => {}}>
          <Text style={styles.btnSecondaryText}>Luyện tập ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleFinish}>
          <MaterialIcons name="check-circle" size={20} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>Đánh dấu đã học</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 20, // safe area
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    marginTop: 20
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191c1e',
    marginBottom: 4
  },
  progressHeaderBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e6e8ea',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressHeaderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 160,
    alignItems: 'center'
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eaddff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: spacing.md
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5c00ca',
    textTransform: 'uppercase'
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  termText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  phoneticText: {
    fontSize: 14,
    color: '#464555',
    fontFamily: 'monospace' // Or standard if preferred
  },
  soundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2dfff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777587',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  cardMeaning: {
    borderTopWidth: 1,
    borderTopColor: '#e6e8ea',
    paddingTop: spacing.md,
    marginBottom: spacing.md
  },
  meaningText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e'
  },
  cardExample: {
    backgroundColor: '#f2f4f6',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 216, 0.5)'
  },
  exampleText: {
    fontSize: 14,
    color: '#191c1e',
    fontStyle: 'italic',
    lineHeight: 20
  },
  navControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    backgroundColor: '#ffffff'
  },
  navBtnDisabled: {
    borderColor: '#e6e8ea',
    backgroundColor: '#f2f4f6'
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e'
  },
  navCountText: {
    fontSize: 14,
    color: '#464555',
    fontWeight: '500'
  },
  bottomFixedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: spacing.md,
    paddingBottom: 32, // safe area
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f2f4f6'
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  btnSecondaryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
});
