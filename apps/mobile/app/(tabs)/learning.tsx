import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

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

const modules: ModuleSection[] = [
  {
    id: 'mod-1',
    title: 'Module 1: Cloud Concepts & Architecture',
    progress: 100,
    totalLessons: 3,
    completedLessons: 3,
    lessons: [
      { id: 'les-1', title: 'What is Cloud Computing & Global Infrastructure', duration: 15, termsCount: 12, status: 'completed' },
      { id: 'les-2', title: 'Shared Responsibility Model & Well-Architected Framework', duration: 20, termsCount: 15, status: 'completed' },
      { id: 'les-3', title: 'High Availability vs Fault Tolerance', duration: 18, termsCount: 10, status: 'completed' }
    ]
  },
  {
    id: 'mod-2',
    title: 'Module 2: AWS IAM & Access Control',
    progress: 66,
    totalLessons: 3,
    completedLessons: 2,
    lessons: [
      { id: 'les-4', title: 'IAM Users, Groups, and Roles Terminology', duration: 25, termsCount: 18, status: 'completed' },
      { id: 'les-5', title: 'JSON Policy Structure: Effect, Principal, Action', duration: 30, termsCount: 22, status: 'in_progress' },
      { id: 'les-6', title: 'Multi-Factor Authentication (MFA) & Root User Best Practices', duration: 15, termsCount: 8, status: 'in_progress' }
    ]
  },
  {
    id: 'mod-3',
    title: 'Module 3: Storage & Database Terminology',
    progress: 0,
    totalLessons: 4,
    completedLessons: 0,
    lessons: [
      { id: 'les-7', title: 'Amazon S3 Object Storage vs EBS Block Storage', duration: 20, termsCount: 16, status: 'locked' },
      { id: 'les-8', title: 'Amazon RDS vs DynamoDB NoSQL Key-Value', duration: 25, termsCount: 14, status: 'locked' }
    ]
  }
];

export default function MobileLearningScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lộ trình học tập</Text>
          <Text style={styles.subtitle}>AWS Cloud Practitioner Pathway</Text>
        </View>
        <View style={styles.overallBadge}>
          <Text style={styles.overallBadgeText}>68% Hoàn thành</Text>
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
                      <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]}>
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
