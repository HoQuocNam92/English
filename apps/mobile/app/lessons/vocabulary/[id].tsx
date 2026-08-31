import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [isFlipped, setIsFlipped] = useState(false);
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
      
      // Fallback: If no vocabulary linked to this specific lesson, fetch general vocabulary list
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
  const defEn     = safeText(currentCard.definitionEn ?? currentCard.meaningEn ?? currentCard.defEn ?? currentCard.definition);
  
  const exampleObj = Array.isArray(currentCard.examples) ? currentCard.examples[0] : currentCard.example;
  const exampleEn  = safeText(typeof exampleObj === 'object' ? (exampleObj?.sentenceEn ?? exampleObj?.sentence) : exampleObj);
  const exampleVi  = safeText(typeof exampleObj === 'object' ? (exampleObj?.translationVi ?? exampleObj?.translation) : '');

  const playSound = () => {
    if (term && term !== 'No Term') {
      Speech.speak(term, { language: 'en-US' });
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('Tuyệt vời! Bạn đã hoàn thành toàn bộ thẻ từ vựng của bài này!');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thẻ từ vựng ({currentIndex + 1}/{total})</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / total) * 100}%` }]} />
      </View>

      {/* Card Body */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.flashcard}
          activeOpacity={0.9}
          onPress={() => setIsFlipped(!isFlipped)}
        >
          <View style={styles.cardTop}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{type}</Text>
            </View>
            <TouchableOpacity style={styles.soundButton} onPress={playSound}>
              <MaterialIcons name="volume-up" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.cardMain}>
            <TouchableOpacity onPress={playSound} activeOpacity={0.7} style={{ alignItems: 'center' }}>
              <Text style={styles.termText}>{term}</Text>
              {phonetic ? <Text style={styles.phoneticText}>{phonetic}</Text> : null}
            </TouchableOpacity>

            {isFlipped ? (
              <View style={styles.flippedContent}>
                <View style={styles.divider} />
                <Text style={styles.defViText}>{defVi}</Text>
                {defEn ? <Text style={styles.defEnText}>{defEn}</Text> : null}
                {exampleEn ? (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleText}>💬 {exampleEn}</Text>
                    {exampleVi ? <Text style={[styles.exampleText, { color: colors.primary, marginTop: 4 }]}>👉 {exampleVi}</Text> : null}
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.tapPrompt}>
                <MaterialIcons name="touch-app" size={20} color={colors.outline} />
                <Text style={styles.tapPromptText}>Chạm vào thẻ để xem nghĩa & ví dụ</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Rating Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ratingBtn, styles.btnAgain]}
          onPress={handleNextCard}
        >
          <Text style={styles.btnAgainText}>Chưa nhớ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ratingBtn, styles.btnGood]}
          onPress={handleNextCard}
        >
          <Text style={styles.btnGoodText}>Đã thuộc (Dễ)</Text>
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
    paddingBottom: spacing.sm,
    backgroundColor: '#ffffff'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary
  },
  cardContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center'
  },
  flashcard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: spacing.xl,
    minHeight: 380,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    justifyContent: 'space-between'
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  typeBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'capitalize'
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardMain: {
    alignItems: 'center',
    marginVertical: spacing.lg
  },
  termText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center'
  },
  phoneticText: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 4,
    fontFamily: 'monospace'
  },
  tapPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 40
  },
  tapPromptText: {
    fontSize: 12,
    color: colors.outline
  },
  flippedContent: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: spacing.xs
  },
  defViText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center'
  },
  defEnText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    textAlign: 'center'
  },
  exampleBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs
  },
  exampleText: {
    fontSize: 12,
    color: colors.mutedText,
    fontStyle: 'italic'
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: spacing.md
  },
  ratingBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnAgain: {
    backgroundColor: '#fee2e2'
  },
  btnAgainText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '700'
  },
  btnGood: {
    backgroundColor: colors.primary
  },
  btnGoodText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
