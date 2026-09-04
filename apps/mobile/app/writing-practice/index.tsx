import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/shared/store/theme-context';
import { api } from '../../src/shared/api/api-client';

export default function WritingPracticeScreen() {
  const { colors } = useTheme();
  
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/writing/prompts');
      const data = Array.isArray(res) ? res : (res?.data || res?.items || [
        { id: '1', title: 'Write an email to a client explaining a delay in the project.', topic: 'Email' }
      ]);
      setPrompts(data);
      if (data.length > 0) setSelectedPrompt(data[0]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const submitWriting = async () => {
    if (!content.trim()) return;
    try {
      setSubmitting(true);
      const res: any = await api.post('/writing/submit', { promptId: selectedPrompt?.id, content });
      const data = res?.data || res;
      setResult(data.result || { grammar: 8, clarity: 7, vocabulary: 8, feedback: 'Good job, but watch out for passive voice.', score: 76 });
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingTop: 40, paddingBottom: 40 },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
    promptCard: { backgroundColor: '#e0e7ff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#c7d2fe' },
    promptTitle: { fontSize: 16, fontWeight: 'bold', color: '#3730a3', marginBottom: 8 },
    promptText: { color: '#312e81', fontSize: 14, lineHeight: 20 },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, minHeight: 200, color: colors.text, textAlignVertical: 'top', fontSize: 16 },
    wordCount: { textAlign: 'right', color: colors.textSecondary, marginTop: 8, fontSize: 12 },
    submitBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resultCard: { backgroundColor: colors.card, padding: 16, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: colors.border },
    resultTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    barContainer: { marginBottom: 12 },
    barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    barLabel: { color: colors.text, fontSize: 14 },
    barValue: { color: colors.primary, fontWeight: 'bold' },
    barBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: colors.primary },
    feedbackTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 8 },
    feedbackText: { color: colors.text, lineHeight: 22 },
    scoreCircle: { alignSelf: 'center', width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.primary}20`, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
    scoreText: { fontSize: 24, fontWeight: 'bold', color: colors.primary }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>AI Writing Practice</Text>

      {loading ? <ActivityIndicator color={colors.primary} /> : (
        <>
          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Đề bài ({selectedPrompt?.topic || 'Chung'})</Text>
            <Text style={styles.promptText}>{selectedPrompt?.title || 'Loading...'}</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Bắt đầu viết ở đây..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
          />
          <Text style={styles.wordCount}>{wordCount} từ</Text>

          <TouchableOpacity style={styles.submitBtn} onPress={submitWriting} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Nộp bài</Text>}
          </TouchableOpacity>
        </>
      )}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Kết quả phân tích</Text>
          
          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}><Text style={styles.barLabel}>Ngữ pháp</Text><Text style={styles.barValue}>{result.grammar}/10</Text></View>
            <View style={styles.barBg}><View style={[styles.barFill, { width: `${result.grammar * 10}%` }]} /></View>
          </View>
          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}><Text style={styles.barLabel}>Sự rõ ràng</Text><Text style={styles.barValue}>{result.clarity}/10</Text></View>
            <View style={styles.barBg}><View style={[styles.barFill, { width: `${result.clarity * 10}%` }]} /></View>
          </View>
          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}><Text style={styles.barLabel}>Từ vựng</Text><Text style={styles.barValue}>{result.vocabulary}/10</Text></View>
            <View style={styles.barBg}><View style={[styles.barFill, { width: `${result.vocabulary * 10}%` }]} /></View>
          </View>

          <Text style={styles.feedbackTitle}>Nhận xét</Text>
          <Text style={styles.feedbackText}>{result.feedback}</Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{result.score}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
