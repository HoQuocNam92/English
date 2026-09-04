import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/shared/store/theme-context';
import { api } from '../../src/shared/api/api-client';

const TAGS = ['Tất cả', 'networking', 'cloud', 'security', 'devops'];

export default function CommunityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState('Tất cả');
  
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const raw: any = await api.get('/discussion/posts');
      let data = raw?.posts || (Array.isArray(raw) ? raw : []);
      if (activeTag !== 'Tất cả') {
        data = data.filter((p: any) => p.tags?.includes(activeTag));
      }
      setPosts(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setSubmitting(true);
      await api.post('/discussion/posts', { title: newTitle, content: newContent });
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
      fetchPosts();
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 40 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    btnAsk: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    btnAskText: { color: '#fff', fontWeight: 'bold' },
    tagsScroll: { maxHeight: 50, paddingHorizontal: 16, marginBottom: 12 },
    tagBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.border, marginRight: 8, height: 36 },
    tagBtnActive: { backgroundColor: colors.primary },
    tagText: { color: colors.textSecondary },
    tagTextActive: { color: '#fff', fontWeight: 'bold' },
    postCard: { backgroundColor: colors.card, padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    postTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    postPreview: { color: colors.textSecondary, marginBottom: 8 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    authorText: { color: colors.textSecondary, fontSize: 12 },
    metaRight: { flexDirection: 'row', gap: 12 },
    statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { color: colors.textSecondary, fontSize: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.background, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 400 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 12, color: colors.text },
    submitBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
    cancelBtn: { padding: 16, alignItems: 'center' }
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Cộng đồng</Text>
        <TouchableOpacity style={styles.btnAsk} onPress={() => setShowModal(true)}>
          <Text style={styles.btnAskText}>Đặt câu hỏi</Text>
        </TouchableOpacity>
      </View>
      
      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          data={TAGS}
          keyExtractor={i => i}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.tagBtn, activeTag === item && styles.tagBtnActive]} 
              onPress={() => setActiveTag(item)}
            >
              <Text style={[styles.tagText, activeTag === item && styles.tagTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.postCard}
              onPress={() => router.push(`/community/${item.id}` as any)}
            >
              <Text style={styles.postTitle}>
                {item.isPinned && '📌 '}
                {item.title}
              </Text>
              <Text style={styles.postPreview} numberOfLines={2}>{item.content}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(item.author?.name || 'A')[0]}</Text>
                  </View>
                  <Text style={styles.authorText}>{item.author?.name || 'Anonymous'}</Text>
                </View>
                <View style={styles.metaRight}>
                  <View style={styles.statRow}>
                    <MaterialIcons name="thumb-up" size={14} color={colors.textSecondary} />
                    <Text style={styles.statText}>{item.upvotes || 0}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <MaterialIcons name="comment" size={14} color={colors.textSecondary} />
                    <Text style={styles.statText}>{item.commentsCount || 0}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo bài viết mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề..."
              placeholderTextColor={colors.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]}
              placeholder="Nội dung chi tiết..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={newContent}
              onChangeText={setNewContent}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={submitPost} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnAskText}>Gửi</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={{ color: colors.textSecondary }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
