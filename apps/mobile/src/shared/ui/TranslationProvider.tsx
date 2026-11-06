import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@techenglish/design-tokens';
import { MaterialIcons } from './AppIcon';
import { compactTextSize, interFontStyle } from './font-styles';
import * as Speech from 'expo-speech';
import { api, subscribeSessionExpired } from '../api/api-client';
import { renderRichTextChildren } from './rich-text';

const TranslationContext = createContext<(context: string) => void>(() => {});
export const useTranslation = () => useContext(TranslationContext);
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const wide = useWindowDimensions().width >= 680;
  const [context, setContext] = useState('');
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const cache = useRef(new Map<string, any>());
  const close = () => { request.current++; setVisible(false); void Speech.stop(); };
  useEffect(() => subscribeSessionExpired(close), []);
  const open = (value: string) => { request.current++; void Speech.stop(); setContext(value); setText(value.length <= 120 ? value : ''); setResult(null); setError(''); setLoading(false); setExpanded(false); setVisible(true); };
  const translate = async () => {
    const selection = text.trim();
    if (!selection) { setError('Nhập từ hoặc cụm từ cần dịch.'); return; }
    const current = ++request.current;
    setLoading(true); setError(''); setResult(null);
    try {
      const key = JSON.stringify([selection, context]);
      const data = cache.current.get(key) ?? await api.post('/translation/selection', { text: selection, context });
      if (current === request.current) { setResult(data); if (cache.current.size >= 50) cache.current.clear(); cache.current.set(key, data); }
    } catch (cause: any) {
      if (current === request.current) setError(cause.message || 'Chưa dịch được. Vui lòng thử lại.');
    } finally { if (current === request.current) setLoading(false); }
  };
  const changeText = (value: string) => { request.current++; setText(value); setResult(null); setError(''); setLoading(false); void Speech.stop(); };
  const pronounce = () => { void Speech.stop().then(() => Speech.speak(text.trim(), { language: 'en-US', rate: 0.8, onError: () => setError('Chưa phát được giọng tiếng Anh. Kiểm tra dịch vụ đọc trên điện thoại.') })); };
  const partLabels: Record<string, string> = { noun: 'Danh từ', verb: 'Động từ', adjective: 'Tính từ', adverb: 'Trạng từ', phrase: 'Cụm từ', acronym: 'Từ viết tắt' };
  const disabled = loading || !text.trim();
  return <TranslationContext.Provider value={open}>{children}
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[s.backdrop, { justifyContent: wide ? 'center' : 'flex-end', paddingHorizontal: wide ? 24 : 0, paddingTop: insets.top + 16 }]}>
        <View accessibilityViewIsModal style={[s.sheet, wide && { borderRadius: 28 }]}>
          {!wide && <View style={s.handle} />}
          <View style={s.header}>
            <View style={s.headerIcon}><MaterialIcons name="translate" size={24} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={s.title}>Dịch theo ngữ cảnh</Text><Text style={s.subtitle}>Hiểu đúng nghĩa trong bài đang đọc</Text></View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng bản dịch" onPress={close} style={s.close}><MaterialIcons name="close" size={22} color={colors.mutedText} /></TouchableOpacity>
          </View>
          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={s.languageRow}><Text style={s.language}>TIẾNG ANH</Text><MaterialIcons name="arrow-forward" size={16} color={colors.mutedText} /><Text style={s.language}>TIẾNG VIỆT</Text></View>
            <Text style={s.label}>Từ hoặc cụm từ</Text>
            <TextInput accessibilityLabel="Từ hoặc cụm từ cần dịch" value={text} onChangeText={changeText} maxLength={120} autoCapitalize="none" autoCorrect={false} placeholder="Ví dụ: pull request, step…" placeholderTextColor="#7c8497" underlineColorAndroid="transparent" returnKeyType="search" onSubmitEditing={() => { if (!disabled) void translate(); }} style={s.input} />
            <Text style={s.hint}>Nhập từ bạn muốn hiểu. Bản dịch dùng đoạn văn bên dưới làm ngữ cảnh.</Text>
            {error ? <View accessibilityRole="alert" style={s.error}><Text style={[s.bodyText, { color: colors.error }]}>{error}</Text></View> : null}
            {loading && <View accessibilityRole="progressbar" style={s.loading}><ActivityIndicator color={colors.primary} /><Text style={s.bodyText}>Đang tìm nghĩa phù hợp với đoạn văn…</Text></View>}
            {result && <View style={s.result}>
              <View style={s.resultTop}><Text style={s.resultLabel}>NGHĨA TRONG NGỮ CẢNH</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Nghe phát âm" onPress={pronounce} style={s.speaker}><MaterialIcons name="volume-up" size={21} color={colors.primary} /></TouchableOpacity></View>
              <Text selectable style={s.translation}>{renderRichTextChildren(result.translation ?? result.message)}</Text>
              {(result.pronunciationIpa || result.partOfSpeech) && <Text selectable style={s.pronunciation}>{[result.pronunciationIpa, partLabels[result.partOfSpeech?.toLowerCase()] ?? result.partOfSpeech].filter(Boolean).join('  ·  ')}</Text>}
              {result.definitionEn && <View style={s.definition}><Text style={s.label}>Giải thích tiếng Anh</Text><Text selectable style={s.bodyText}>{renderRichTextChildren(result.definitionEn)}</Text></View>}
              {result.exampleEn && <View style={s.definition}><Text style={s.label}>Ví dụ</Text><Text selectable style={s.bodyText}>{renderRichTextChildren(result.exampleEn)}</Text>{result.exampleVi && <Text selectable style={s.subtitle}>{renderRichTextChildren(result.exampleVi)}</Text>}</View>}
            </View>}
            <View style={s.context}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={expanded ? 'Thu gọn ngữ cảnh' : 'Xem toàn bộ ngữ cảnh'} accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={s.contextHeader}><MaterialIcons name="article" size={18} color={colors.mutedText} /><Text style={[s.label, { flex: 1 }]}>Ngữ cảnh trong bài</Text><MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={21} color={colors.mutedText} /></TouchableOpacity>
              <Text selectable numberOfLines={expanded ? undefined : 3} style={s.contextText}>{context}</Text>
              {!expanded && context.length > 180 && <Text style={s.hint}>Bấm tiêu đề để đọc đầy đủ</Text>}
            </View>
          </ScrollView>
          <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}><TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled, busy: loading }} disabled={disabled} onPress={() => void translate()} style={[s.button, disabled && { opacity: 0.55 }]}>{loading ? <ActivityIndicator color="#ffffff" /> : <MaterialIcons name="translate" size={20} color="#ffffff" />}<Text style={s.buttonText}>{loading ? 'Đang dịch…' : result ? 'Dịch lại' : 'Dịch sang tiếng Việt'}</Text></TouchableOpacity></View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </TranslationContext.Provider>;
}
const regular = interFontStyle('400');
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#11182780', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 560, maxHeight: '94%', flexShrink: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#d8dce7', alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderBottomWidth: 1, borderColor: '#edf0f5' },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f0edff', alignItems: 'center', justifyContent: 'center' },
  title: { ...interFontStyle('700'), color: colors.text, fontSize: compactTextSize(20) },
  subtitle: { ...regular, color: colors.mutedText, fontSize: compactTextSize(13), lineHeight: 20, marginTop: 3 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f6fa', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 12 },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  language: { ...interFontStyle('700'), color: colors.mutedText, fontSize: compactTextSize(10), letterSpacing: 1 },
  label: { ...interFontStyle('600'), color: colors.text, fontSize: compactTextSize(14) },
  input: { ...interFontStyle('600'), color: colors.text, fontSize: compactTextSize(19), minHeight: 56, borderWidth: 1.5, borderColor: '#c8c0f5', backgroundColor: '#faf9ff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  hint: { ...regular, color: colors.mutedText, fontSize: compactTextSize(12), lineHeight: 18 },
  bodyText: { ...regular, color: colors.text, fontSize: compactTextSize(14), lineHeight: 23 },
  error: { backgroundColor: '#fff1f2', borderRadius: 12, padding: 12 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  result: { borderRadius: 20, borderWidth: 1, borderColor: '#ded8fb', backgroundColor: '#f5f2ff', padding: 16, gap: 8 },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  resultLabel: { ...interFontStyle('700'), color: colors.primary, fontSize: compactTextSize(10), letterSpacing: 0.7, flex: 1 },
  speaker: { width: 44, height: 44, backgroundColor: '#ffffff', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  translation: { ...interFontStyle('700'), color: '#29204d', fontSize: compactTextSize(24), lineHeight: 33 },
  pronunciation: { ...regular, color: colors.mutedText, fontSize: compactTextSize(13), lineHeight: 20 },
  definition: { borderTopWidth: 1, borderColor: '#e3def5', paddingTop: 12, marginTop: 4, gap: 5 },
  context: { borderWidth: 1, borderColor: '#e7eaf0', borderRadius: 16, padding: 14, gap: 8, marginTop: 4 },
  contextHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  contextText: { ...regular, color: '#626c80', fontSize: compactTextSize(13), lineHeight: 22 },
  footer: { borderTopWidth: 1, borderColor: '#edf0f5', paddingTop: 14, paddingHorizontal: 20, backgroundColor: '#ffffff' },
  button: { minHeight: 52, padding: 14, borderRadius: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { ...interFontStyle('700'), color: '#ffffff', fontSize: compactTextSize(15) },
});
