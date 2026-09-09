import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';

type Message = { id: string; role: 'user' | 'assistant'; content: string; citations?: any[] };

export default function AiTutorScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const router = useRouter();
  const scroll = useRef<ScrollView>(null);
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.post<any>('/ai-chat/conversations', { mode: 'qa', lessonId })
      .then((conversation) => setConversationId(conversation.id))
      .catch((err) => setError(err.message || 'Không thể mở AI Tutor.'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  async function send() {
    const content = input.trim();
    if (!content || !conversationId || loading) return;
    setMessages((current) => [...current, { id: `local-${Date.now()}`, role: 'user', content }]);
    setInput(''); setLoading(true); setError('');
    try {
      const response = await api.post<any>(`/ai-chat/conversations/${conversationId}/messages`, { content, mode: 'qa' });
      setMessages((current) => [...current, { ...response.message, citations: response.result?.citations ?? [] }]);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    } catch (err: any) { setError(err.message || 'Không thể nhận câu trả lời.'); }
    finally { setLoading(false); }
  }

  async function feedback(messageId: string, helpful: boolean) {
    try { await api.post(`/ai-chat/messages/${messageId}/feedback`, { helpful }); } catch { setError('Không thể gửi phản hồi.'); }
  }

  return <View style={styles.container}>
    <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color="#374151" /></TouchableOpacity><View style={{ flex: 1 }}><Text style={styles.title}>AI Tutor RAG</Text><Text style={styles.subtitle}>{lessonId ? 'Đang giới hạn trong bài học hiện tại' : 'Kho kiến thức TechEnglish'}</Text></View></View>
    <ScrollView ref={scroll} contentContainerStyle={styles.messages}>
      {!messages.length && !loading && <Text style={styles.empty}>Hãy hỏi về nội dung bài học. Câu trả lời sẽ kèm nguồn đã được duyệt.</Text>}
      {messages.map((message) => <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.user : styles.assistant]}><Text style={message.role === 'user' ? styles.userText : styles.assistantText}>{message.content}</Text>{message.citations?.map((citation) => <TouchableOpacity key={`${citation.sourceType}-${citation.sourceId}`} onPress={() => citation.lessonId && router.push(`/lessons/${citation.lessonId}` as any)} style={styles.citation}><Text style={styles.citationTitle}>[{citation.rank}] {citation.title}</Text><Text numberOfLines={2} style={styles.citationText}>{citation.excerpt}</Text></TouchableOpacity>)}{message.role === 'assistant' && !!message.citations?.length && <View style={styles.feedback}><TouchableOpacity onPress={() => feedback(message.id, true)}><Text>👍 Hữu ích</Text></TouchableOpacity><TouchableOpacity onPress={() => feedback(message.id, false)}><Text>👎 Chưa đúng</Text></TouchableOpacity></View>}</View>)}
      {loading && <ActivityIndicator color={colors.primary} />}{error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
    <View style={styles.composer}><TextInput value={input} onChangeText={setInput} multiline maxLength={4000} placeholder="Hỏi về lesson hoặc thuật ngữ IT..." style={styles.input} /><TouchableOpacity disabled={!input.trim() || loading || !conversationId} onPress={send} style={styles.send}><MaterialIcons name="send" size={20} color="#fff" /></TouchableOpacity></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' }, header: { paddingTop: 48, paddingHorizontal: spacing.md, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, title: { fontSize: 18, fontWeight: '800' }, subtitle: { fontSize: 12, color: '#64748b' }, messages: { padding: spacing.md, gap: 12, flexGrow: 1 }, empty: { marginTop: 80, textAlign: 'center', color: '#64748b', lineHeight: 22 }, bubble: { maxWidth: '88%', padding: 12, borderRadius: 14 }, user: { alignSelf: 'flex-end', backgroundColor: colors.primary }, assistant: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' }, userText: { color: '#fff', lineHeight: 21 }, assistantText: { color: '#1f2937', lineHeight: 21 }, citation: { marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: '#f1f5f9' }, citationTitle: { color: colors.primary, fontWeight: '700', fontSize: 12 }, citationText: { color: '#64748b', fontSize: 11, marginTop: 3 }, feedback: { flexDirection: 'row', gap: 18, marginTop: 10 }, error: { color: '#b91c1c', textAlign: 'center' }, composer: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', padding: spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' }, input: { flex: 1, maxHeight: 120, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12 }, send: { backgroundColor: colors.primary, width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
