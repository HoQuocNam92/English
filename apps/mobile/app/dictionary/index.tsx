import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/shared/store/theme-context';
import { api } from '../../src/shared/api/api-client';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function DictionaryScreen() {
  const { colors } = useTheme();
  
  const [query, setQuery] = useState('');
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWords = async (search: string) => {
    try {
      setLoading(true);
      const raw: any = await api.get(`/vocabulary?search=${search}&limit=30`);
      const data = Array.isArray(raw) ? raw : (raw?.data || raw?.items || []);
      setWords(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchWords(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerContainer: { padding: 16, paddingTop: 40 },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48
    },
    searchInput: { flex: 1, marginLeft: 8, color: colors.text },
    alphaScroll: { marginVertical: 12 },
    alphaBtn: { 
      width: 32, 
      height: 32, 
      borderRadius: 16, 
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    alphaText: { color: colors.text, fontWeight: 'bold' },
    wordItem: { 
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border
    },
    wordHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    wordText: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    badge: { backgroundColor: `${colors.primary}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 12, color: colors.primary },
    meaning: { color: colors.text, marginTop: 8 },
    example: { color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
    expandedArea: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 }
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Từ điển kỹ thuật IT</Text>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm từ vựng..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.alphaScroll}
          data={ALPHABET}
          keyExtractor={i => i}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.alphaBtn} onPress={() => setQuery(item)}>
              <Text style={styles.alphaText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item, index) => item.id || index.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy từ vựng nào</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.wordItem}
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <View style={styles.wordHeader}>
                <Text style={styles.wordText}>{item.word || item.term || 'Unknown'}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.type || 'noun'}</Text>
                </View>
              </View>
              <Text style={styles.meaning}>{item.meaning || item.definition || 'Không có nghĩa'}</Text>
              
              {expandedId === item.id ? (
                <View style={styles.expandedArea}>
                  <Text style={styles.example}>VD: {item.example || 'Không có ví dụ'}</Text>
                  {item.relatedWords && (
                    <Text style={[styles.meaning, { marginTop: 8 }]}>Từ liên quan: {item.relatedWords.join(', ')}</Text>
                  )}
                </View>
              ) : (
                <Text style={styles.example} numberOfLines={1}>VD: {item.example || 'Không có ví dụ'}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
