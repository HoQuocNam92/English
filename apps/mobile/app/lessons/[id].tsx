import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

export default function MobileLessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'theory' | 'terms'>('theory');

  const lesson = {
    id: id || 'les-1',
    title: 'Understanding REST APIs & HTTP Verbs',
    domain: 'Software Engineering',
    level: 'Intermediate',
    durationMinutes: 20,
    intro: 'REST (Representational State Transfer) is a software architectural style that defines a set of constraints to be used for creating Web services. In this lesson, you will learn the exact English terminology used in API design.',
    theoryContent: `1. HTTP Verbs & Idempotency:
- GET: Retrieve resource without side effects (Safe & Idempotent).
- POST: Create a subordinate resource (Not idempotent).
- PUT: Replace resource or create if missing (Idempotent).
- PATCH: Apply partial modifications (Not necessarily idempotent).
- DELETE: Remove specified resource (Idempotent).

2. Common Status Codes:
- 200 OK, 201 Created, 204 No Content.
- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found.
- 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.`,
    terms: [
      { term: 'Endpoint', def: 'A specific URL where an API receives requests.', example: 'GET /v1/users is a read-only endpoint.' },
      { term: 'Payload', def: 'The actual data transmitted in the body of HTTP message.', example: 'The JSON payload contains user credentials.' },
      { term: 'Idempotency', def: 'The property of an operation being able to be applied multiple times without changing the result beyond the initial application.', example: 'Payment APIs require an idempotency key to prevent double charging.' }
    ]
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết bài học</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/lessons/vocabulary/${lesson.id}` as any)}>
          <MaterialIcons name="style" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.tagRow}>
            <View style={styles.domainTag}>
              <Text style={styles.domainTagText}>{lesson.domain}</Text>
            </View>
            <Text style={styles.durationText}>⏱ {lesson.durationMinutes} phút</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonIntro}>{lesson.intro}</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'theory' && styles.tabButtonActive]}
            onPress={() => setActiveTab('theory')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'theory' && styles.tabButtonTextActive]}>
              Lý thuyết & Cấu trúc
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'terms' && styles.tabButtonActive]}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'terms' && styles.tabButtonTextActive]}>
              Thuật ngữ ({lesson.terms.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'theory' ? (
          <View style={styles.theoryBox}>
            <Text style={styles.theoryText}>{lesson.theoryContent}</Text>
          </View>
        ) : (
          <View style={styles.termsList}>
            {lesson.terms.map((t) => (
              <View key={t.term} style={styles.termCard}>
                <Text style={styles.termName}>{t.term}</Text>
                <Text style={styles.termDef}>{t.def}</Text>
                <Text style={styles.termExample}>💬 Ví dụ: {t.example}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar CTAs */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.vocabButton}
          onPress={() => router.push(`/lessons/vocabulary/${lesson.id}` as any)}
        >
          <MaterialIcons name="style" size={18} color={colors.primary} />
          <Text style={styles.vocabButtonText}>Học Flashcards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => router.push(`/quiz/${lesson.id}` as any)}
        >
          <Text style={styles.quizButtonText}>Làm bài Quiz</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
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
    color: colors.text,
    maxWidth: 220
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
    gap: spacing.md
  },
  bannerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.xs
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  domainTag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  domainTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  durationText: {
    fontSize: 11,
    color: colors.mutedText
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  lessonIntro: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18,
    marginTop: 4
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 3
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: '#ffffff'
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText
  },
  tabButtonTextActive: {
    color: colors.primary
  },
  theoryBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  theoryText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontFamily: 'monospace'
  },
  termsList: {
    gap: spacing.sm
  },
  termCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4
  },
  termName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary
  },
  termDef: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16
  },
  termExample: {
    fontSize: 11,
    color: colors.mutedText,
    fontStyle: 'italic',
    marginTop: 2
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: spacing.sm
  },
  vocabButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  vocabButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  quizButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  quizButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
