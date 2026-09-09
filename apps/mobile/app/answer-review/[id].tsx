import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { safeText } from '../../src/shared/utils/safeText';

export default function MobileAnswerReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewedQuestions, setReviewedQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/exams/attempts/${id}`)
      .then((data: any) => {
        setScore(data.score || 0);
        const snapshot = data.questionsSnapshot || [];
        setTotal(snapshot.length);
        const mapped = snapshot.map((q: any, index: number) => {
          const userSelectedIds = q.userSelectedOptionIds || [];
          
          return {
            id: String(index),
            prompt: q.prompt || '',
            options: q.options || [],
            userSelectedIds,
            explanation: q.explanation || 'Không có giải thích chi tiết.'
          };
        });
        setReviewedQuestions(mapped);
      })
      .catch((err) => setError(err.message || 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || reviewedQuestions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ba1a1a' }}>{error || 'Không có dữ liệu'}</Text>
      </View>
    );
  }

  const currentQ = reviewedQuestions[currentIndex];
  // Calculate score base 10
  const scoreBase10 = (score / 100) * 10;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#464555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Test</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Score & Progress Header */}
        <View style={styles.progressBox}>
          <View style={styles.progressCol}>
            <Text style={styles.progressLabel}>Your Score</Text>
            <Text style={styles.progressValuePrimary}>{scoreBase10.toFixed(1)}/10</Text>
          </View>
          <View style={[styles.progressCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.progressLabel}>Question</Text>
            <Text style={styles.progressValueDark}>{currentIndex + 1} / {total}</Text>
          </View>
        </View>

        {/* Question Content */}
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>{safeText(currentQ.prompt)}</Text>
          
          <View style={styles.optionsList}>
            {currentQ.options.map((opt: any) => {
              const isUserSelected = currentQ.userSelectedIds.includes(opt.id) || currentQ.userSelectedIds.includes(opt.key);
              const isCorrect = opt.isCorrect;
              
              if (isCorrect) {
                // Correct Option
                return (
                  <View key={opt.id || opt.key} style={[styles.optionCard, styles.optionCorrect]}>
                    <View style={styles.optionContentRow}>
                      <MaterialIcons name="check-circle" size={20} color="#166534" />
                      <Text style={styles.optionTextCorrect}>{safeText(opt.text)}</Text>
                    </View>
                    <Text style={styles.optionTagCorrect}>Correct Answer</Text>
                  </View>
                );
              }
              
              if (isUserSelected && !isCorrect) {
                // Incorrect Option (Learner's Choice)
                return (
                  <View key={opt.id || opt.key} style={[styles.optionCard, styles.optionIncorrect]}>
                    <View style={styles.optionContentRow}>
                      <MaterialIcons name="cancel" size={20} color="#ba1a1a" />
                      <Text style={styles.optionTextIncorrect}>{safeText(opt.text)}</Text>
                    </View>
                    <Text style={styles.optionTagIncorrect}>Your Answer</Text>
                  </View>
                );
              }

              // Other Options (Neutral)
              return (
                <View key={opt.id || opt.key} style={[styles.optionCard, styles.optionNeutral]}>
                  <Text style={styles.optionTextNeutral}>{safeText(opt.text)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Detailed Explanation Card */}
        <View style={styles.explanationCard}>
          <View style={styles.expHeader}>
            <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
            <Text style={styles.expTitle}>Explanation</Text>
          </View>
          <Text style={styles.expText}>{safeText(currentQ.explanation)}</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomFixedArea}>
        <TouchableOpacity 
          style={styles.navBtnSecondary} 
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
        >
          <MaterialIcons name="chevron-left" size={20} color={currentIndex === 0 ? '#c7c4d8' : '#191c1e'} />
          <Text style={[styles.navBtnSecondaryText, currentIndex === 0 && { color: '#c7c4d8' }]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navBtnPrimary} 
          disabled={currentIndex === total - 1}
          onPress={() => setCurrentIndex(prev => Math.min(total - 1, prev + 1))}
        >
          <Text style={styles.navBtnPrimaryText}>Next</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ffffff" />
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
    paddingTop: 20, 
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#c7c4d8',
    marginTop: 20
  },
  headerIconBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: colors.primary 
  },
  scrollContent: { 
    padding: spacing.md, 
    gap: spacing.lg, 
    paddingBottom: 120 
  },
  progressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7c4d8'
  },
  progressCol: {
    flexDirection: 'col' as any
  },
  progressLabel: {
    fontSize: 12,
    color: '#464555',
    marginBottom: 2
  },
  progressValuePrimary: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary
  },
  progressValueDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    marginTop: 6
  },
  questionSection: {
    gap: spacing.md
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191c1e',
    lineHeight: 28
  },
  optionsList: {
    gap: spacing.sm,
    marginTop: spacing.md
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1
  },
  optionCorrect: {
    borderColor: '#166534',
    backgroundColor: '#dcfce3'
  },
  optionIncorrect: {
    borderColor: '#ba1a1a',
    backgroundColor: '#ffdad6'
  },
  optionNeutral: {
    borderColor: '#c7c4d8',
    backgroundColor: '#ffffff',
    opacity: 0.7
  },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  optionTextCorrect: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534'
  },
  optionTextIncorrect: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ba1a1a'
  },
  optionTextNeutral: {
    fontSize: 14,
    color: '#464555'
  },
  optionTagCorrect: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  optionTagIncorrect: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ba1a1a',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  explanationCard: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    backgroundColor: '#f2f4f6',
    gap: spacing.sm
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  expTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary
  },
  expText: {
    fontSize: 14,
    color: '#464555',
    lineHeight: 22
  },
  bottomFixedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#c7c4d8',
    padding: spacing.md,
    paddingBottom: 32, // safe area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  navBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c7c4d8',
    backgroundColor: 'transparent'
  },
  navBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e'
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    backgroundColor: colors.primary
  },
  navBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  }
});
