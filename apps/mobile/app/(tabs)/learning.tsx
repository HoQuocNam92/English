import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

const DOMAIN_CHIPS = ['Tất cả', 'Cloud', 'Security', 'Networking', 'Data', 'Software', 'DevOps'];
const DOMAIN_CODES: Record<string, string> = { Cloud: 'CLOUD', Security: 'CYBERSEC', Networking: 'NETWORKING', Data: 'DATA_AI', Software: 'SOFTWARE_ENG', DevOps: 'DEVOPS' };

const CATEGORIES = [
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    desc: 'Xây dựng vốn từ vựng nền tảng IT.',
    icon: 'sort',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    wide: false,
    route: '/lessons?type=vocabulary',
  },
  {
    id: 'terminology',
    title: 'Technical Terminology',
    desc: 'Hiểu sâu các thuật ngữ chuyên ngành cốt lõi.',
    icon: 'terminal',
    iconBg: '#F0F9FF',
    iconColor: '#0058be',
    wide: false,
    route: '/lessons?type=terminology',
  },
  {
    id: 'api-docs',
    title: 'API Documentation',
    desc: 'Phân tích và hiểu tài liệu API chuẩn.',
    icon: 'api',
    iconBg: '#FFF1F2',
    iconColor: '#ba1a1a',
    wide: false,
    route: '/lessons?type=api_documentation',
  },
  {
    id: 'system-design',
    title: 'System Design',
    desc: 'Thiết kế hệ thống qua góc nhìn tiếng Anh.',
    icon: 'architecture',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    wide: false,
    route: '/lessons?type=system_design',
  },
  {
    id: 'case-study',
    title: 'Case Study',
    desc: 'Phân tích các tình huống thực tế trong ngành.',
    icon: 'assignment',
    iconBg: '#F0F9FF',
    iconColor: '#0058be',
    wide: true,
    route: '/lessons?type=case_study',
  },
];

export default function MobileLearningScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('Tất cả');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<any>('/recommendations/my').then((res) => {
      setRecommendation(res);
    }).catch(() => {});
  }, []);

  const handleCategoryPress = (route: string) => {
    const separator = route.includes('?') ? '&' : '?';
    const domainQuery = activeChip === 'Tất cả' ? '' : `${separator}domainCode=${DOMAIN_CODES[activeChip]}`;
    router.push(`${route}${domainQuery}` as any);
  };

  // Render wide card (col-span-2) or normal card
  const renderCategory = (cat: typeof CATEGORIES[0], idx: number) => {
    if (cat.wide) {
      return (
        <TouchableOpacity
          key={cat.id}
          style={[styles.categoryCard, styles.categoryCardWide]}
          onPress={() => handleCategoryPress(cat.route)}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={[styles.categoryIconBox, { backgroundColor: cat.iconBg }]}>
              <MaterialIcons name={cat.icon as any} size={24} color={cat.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
              <Text style={styles.categoryDesc} numberOfLines={2}>{cat.desc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#c7c4d8" />
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        key={cat.id}
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(cat.route)}
        activeOpacity={0.85}
      >
        <View style={[styles.categoryIconBox, { backgroundColor: cat.iconBg }]}>
          <MaterialIcons name={cat.icon as any} size={22} color={cat.iconColor} />
        </View>
        <Text style={styles.categoryTitle}>{cat.title}</Text>
        <Text style={styles.categoryDesc} numberOfLines={2}>{cat.desc}</Text>
      </TouchableOpacity>
    );
  };

  // Split categories: wide ones go full width, normal ones go in 2-col rows
  const rows: React.ReactElement[] = [];
  let i = 0;
  while (i < CATEGORIES.length) {
    const cat = CATEGORIES[i];
    if (cat.wide) {
      rows.push(renderCategory(cat, i));
      i++;
    } else {
      // Pair two normal cards
      const next = CATEGORIES[i + 1];
      if (next && !next.wide) {
        rows.push(
          <View key={`row-${i}`} style={styles.categoryRow}>
            {renderCategory(cat, i)}
            {renderCategory(next, i + 1)}
          </View>
        );
        i += 2;
      } else {
        rows.push(renderCategory(cat, i));
        i++;
      }
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Sticky Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Học tập</Text>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#777587" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài học, từ vựng..."
            placeholderTextColor="#777587"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push(`/lessons?q=${searchQuery}` as any)}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Domain Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {DOMAIN_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[
                styles.chip,
                activeChip === chip && styles.chipActive,
              ]}
              onPress={() => setActiveChip(chip)}
            >
              <Text style={[
                styles.chipText,
                activeChip === chip && styles.chipTextActive,
              ]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bento Grid Categories */}
        <View style={styles.grid}>
          {rows}
        </View>

        {/* AI Recommendation Banner */}
        <View style={styles.aiBanner}>
          <MaterialIcons name="smart-toy" size={20} color="#4F46E5" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiBannerTitle}>Gợi ý cho bạn</Text>
            <Text style={styles.aiBannerDesc}>
              {recommendation?.reason
                ? recommendation.reason
                : 'Dựa trên tiến độ, hãy tiếp tục với "Technical Terminology: Cloud Computing".'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(199,196,216,0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#191c1e',
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#eceef0',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555',
    whiteSpace: 'nowrap',
  } as any,
  chipTextActive: {
    color: '#ffffff',
  },
  grid: {
    gap: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  categoryCardWide: {
    flex: undefined,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191c1e',
    marginTop: 4,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#464555',
    lineHeight: 18,
    flex: 1,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#4F46E5',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: spacing.md,
  },
  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  aiBannerDesc: {
    fontSize: 12,
    color: '#464555',
    marginTop: 4,
    lineHeight: 18,
  },
});
