import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/shared/store/theme-context';
import { useI18n } from '../../src/shared/store/i18n-context';
import { api } from '../../src/shared/api/api-client';

const TOPICS = [
  { id: 'networking', name: 'Networking', emoji: '🌐' },
  { id: 'cloud', name: 'Cloud', emoji: '☁️' },
  { id: 'security', name: 'Security', emoji: '🔒' },
  { id: 'devops', name: 'DevOps', emoji: '⚙️' }
];

const DIFFICULTIES = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

export default function MockInterviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();

  const [phase, setPhase] = useState<'setup' | 'interview' | 'result'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup state
  const [topic, setTopic] = useState(TOPICS[0].id);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);

  // Interview state
  const [interviewId, setInterviewId] = useState('');
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('Can you explain what a VPC is?');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  
  // Result state
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  const startInterview = async () => {
    try {
      setLoading(true);
      setError('');
      const res: any = await api.post('/interview/start', { topic, difficulty });
      const data = res.data || res;
      setInterviewId(data.id || 'mock-id');
      setPhase('interview');
      setStep(1);
      setFeedback('');
      setAnswer('');
      // In a real app, question would come from API
    } catch (err: any) {
      setError(err.message || 'Lỗi khởi tạo interview');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    try {
      setLoading(true);
      setError('');
      const res: any = await api.post(`/interview/${interviewId}/answer`, { answer });
      const data = res.data || res;
      setFeedback(data.feedback || 'Good answer!');
      if (step >= 5) {
        setScore(data.score || 85);
        fetchMyInterviews();
        setPhase('result');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi câu trả lời');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setStep(s => s + 1);
    setAnswer('');
    setFeedback('');
    setQuestion('Next question ' + (step + 1));
  };

  const fetchMyInterviews = async () => {
    try {
      const res: any = await api.get('/interview/my');
      setHistory(Array.isArray(res) ? res : (res?.data || res?.items || []));
    } catch (err) {
      console.log(err);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingTop: 40, paddingBottom: 40 },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    card: { 
      width: '48%', 
      backgroundColor: colors.card, 
      padding: 16, 
      borderRadius: 12, 
      borderWidth: 2, 
      borderColor: colors.border,
      alignItems: 'center'
    },
    cardSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
    cardText: { color: colors.text, marginTop: 8, fontWeight: 'bold' },
    sectionTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 30 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.border },
    chipSelected: { backgroundColor: colors.primary },
    chipText: { color: colors.textSecondary },
    chipTextSelected: { color: '#fff', fontWeight: 'bold' },
    button: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    error: { color: 'red', marginBottom: 10 },
    progressText: { color: colors.textSecondary, marginBottom: 12 },
    questionCard: { backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 16 },
    questionText: { color: colors.text, fontSize: 16, lineHeight: 24 },
    input: { 
      backgroundColor: colors.card, 
      color: colors.text,
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 12, 
      padding: 16, 
      minHeight: 150, 
      textAlignVertical: 'top',
      marginBottom: 16
    },
    feedbackCard: { backgroundColor: `${colors.primary}10`, padding: 16, borderRadius: 12, marginBottom: 16 },
    feedbackText: { color: colors.primary, lineHeight: 22 },
    scoreContainer: { alignItems: 'center', marginVertical: 32 },
    scoreCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: `${colors.primary}20`, alignItems: 'center', justifyContent: 'center' },
    scoreText: { fontSize: 48, fontWeight: 'bold', color: colors.primary }
  });

  if (phase === 'setup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <StatusBar style="auto" />
        <Text style={styles.header}>AI Mock Interview</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Chủ đề</Text>
        <View style={styles.grid}>
          {TOPICS.map(t => (
            <TouchableOpacity 
              key={t.id} 
              style={[styles.card, topic === t.id && styles.cardSelected]}
              onPress={() => setTopic(t.id)}
            >
              <Text style={{ fontSize: 32 }}>{t.emoji}</Text>
              <Text style={styles.cardText}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Độ khó</Text>
        <View style={styles.chipsRow}>
          {DIFFICULTIES.map(d => (
            <TouchableOpacity 
              key={d} 
              style={[styles.chip, difficulty === d && styles.chipSelected]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.chipText, difficulty === d && styles.chipTextSelected]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={startInterview} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Bắt đầu</Text>}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (phase === 'interview') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.progressText}>Câu hỏi {step}/5</Text>
        
        <View style={styles.questionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text>✨ </Text>
            <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>AI Interviewer</Text>
          </View>
          <Text style={styles.questionText}>{question}</Text>
        </View>

        {!feedback ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Viết câu trả lời..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={answer}
              onChangeText={setAnswer}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={submitAnswer} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Nộp</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.feedbackCard}>
              <Text style={styles.sectionTitle}>Nhận xét từ AI</Text>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={nextQuestion}>
              <Text style={styles.buttonText}>{step >= 5 ? "Xem kết quả" : "Câu tiếp theo"}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Kết quả</Text>
      
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Điểm đánh giá</Text>
      </View>

      <TouchableOpacity style={[styles.button, { marginBottom: 12 }]} onPress={() => setPhase('setup')}>
        <Text style={styles.buttonText}>Thử lại</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={() => {}}>
        <Text style={[styles.buttonText, { color: colors.text }]}>Xem lịch sử</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
