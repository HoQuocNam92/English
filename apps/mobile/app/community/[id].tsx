import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/shared/store/theme-context';
import { api } from '../../src/shared/api/api-client';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/discussion/posts/${id}`);
      setPost(res?.data || res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/discussion/posts/${id}/comments`, { content: comment });
      setComment('');
      fetchPost();
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async () => {
    try {
      await api.post(`/discussion/posts/${id}/vote`);
      fetchPost();
    } catch (err) {
      console.log(err);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginLeft: 16 },
    content: { padding: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    authorText: { color: colors.text, fontWeight: 'bold' },
    timeText: { color: colors.textSecondary, fontSize: 12 },
    body: { color: colors.text, fontSize: 16, lineHeight: 24, marginBottom: 20 },
    voteBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 8 },
    voteText: { color: colors.text, fontWeight: 'bold' },
    commentsSection: { marginTop: 24, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    commentsTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    commentItem: { marginBottom: 16, backgroundColor: colors.card, padding: 12, borderRadius: 8 },
    commentAuthor: { fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    commentText: { color: colors.text },
    inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background, alignItems: 'center' },
    input: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, color: colors.text, marginRight: 12 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={{ marginTop: 50, textAlign: 'center', color: colors.text }}>Không tìm thấy bài viết</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>{post.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(post.author?.name || 'A')[0]}</Text>
            </View>
            <View>
              <Text style={styles.authorText}>{post.author?.name || 'Anonymous'}</Text>
              <Text style={styles.timeText}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Vừa xong'}</Text>
            </View>
          </View>

          <Text style={styles.body}>{post.content}</Text>

          <TouchableOpacity style={styles.voteBtn} onPress={handleVote}>
            <MaterialIcons name="thumb-up" size={20} color={colors.primary} />
            <Text style={styles.voteText}>{post.upvotes || 0}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Bình luận ({post.comments?.length || 0})</Text>
          {post.comments?.map((c: any, i: number) => (
            <View key={i} style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{c.author?.name || 'Anonymous'}</Text>
              <Text style={styles.commentText}>{c.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Viết bình luận..."
          placeholderTextColor={colors.textSecondary}
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={submitComment} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="send" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
