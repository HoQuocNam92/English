import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';

const allLessons = [
  { id: 'les-1', order: 1, title: 'Understanding REST APIs & HTTP Verbs', domain: 'Software Eng', duration: 20, terms: 12 },
  { id: 'les-2', order: 2, title: 'AWS Cloud Foundations: Compute & Storage', domain: 'Cloud Computing', duration: 25, terms: 18 },
  { id: 'les-3', order: 3, title: 'IAM Roles, Policies & Shared Responsibility', domain: 'Cloud Computing', duration: 30, terms: 15 },
  { id: 'les-4', order: 4, title: 'Docker Containers & Kubernetes Pods', domain: 'DevOps', duration: 35, terms: 20 },
  { id: 'les-5', order: 5, title: 'Cybersecurity Vectors: XSS, CSRF & SQLi', domain: 'Cybersecurity', duration: 25, terms: 14 }
];

export default function MobileLessonListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả bài học</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {allLessons.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/lessons/${item.id}` as any)}
          >
            <View style={styles.orderCircle}>
              <Text style={styles.orderText}>#{item.order}</Text>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.domainTag}>
                <Text style={styles.domainTagText}>{item.domain}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>⏱ {item.duration} phút · 📖 {item.terms} thuật ngữ</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  listContent: {
    padding: spacing.lg,
    gap: spacing.md
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  orderCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  orderText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text
  },
  cardInfo: {
    flex: 1,
    gap: 2
  },
  domainTag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  domainTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2
  },
  cardMeta: {
    fontSize: 11,
    color: colors.mutedText
  }
});
