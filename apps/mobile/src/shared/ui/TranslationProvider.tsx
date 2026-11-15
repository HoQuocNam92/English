import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@techenglish/design-tokens';
import { MaterialIcons } from './AppIcon';
import { compactTextSize, interFontStyle } from './font-styles';
import * as Speech from 'expo-speech';
import { api, subscribeSessionExpired } from '../api/api-client';
import { renderRichTextChildren } from './rich-text';
import { selectionPopupPosition, type SelectionRect } from './selection-popup';

const TranslationContext = createContext<(text: string, context: string, rect?: SelectionRect | null, owner?: string) => void>(() => {});
export const useTranslation = () => useContext(TranslationContext);
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const windowSize = useWindowDimensions();
  const popupRoot = useRef<React.ElementRef<typeof View>>(null);
  const offerRequest = useRef(0);
  const [offer, setOffer] = useState<{ text: string; context: string; owner: string; rect: SelectionRect; viewport: { width: number; height: number } } | null>(null);
  const activeOffer = useRef(offer); activeOffer.current = offer;
  const dismissOffer = () => { ++offerRequest.current; activeOffer.current = null; setOffer(null); };
  const [context, setContext] = useState('');
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const cache = useRef(new Map<string, any>());
  const close = () => { dismissOffer(); request.current++; setVisible(false); void Speech.stop(); };
  useEffect(() => subscribeSessionExpired(close), []);
  const open = (value: string, source: string) => {
    const selection = value.trim().replace(/\s+/g, ' ');
    if (!selection || selection.length > 120 || !source.replace(/\s+/g, ' ').includes(selection)) return;
    dismissOffer(); request.current++; void Speech.stop(); setContext(source); setText(selection);
    setResult(null); setError(''); setExpanded(false); setVisible(true);
    void translate(selection, source);
  };
  const select = (value: string, source: string, rect?: SelectionRect | null, owner = '') => {
    if (rect === undefined) { open(value, source); return; }
    if (rect === null) { if (activeOffer.current?.owner === owner) dismissOffer(); return; }
    const phrase = value.trim().replace(/\s+/g, ' ');
    if (!phrase || phrase.length > 120 || !source.replace(/\s+/g, ' ').includes(phrase)) return;
    if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)) return;
    const current = ++offerRequest.current;
    popupRoot.current?.measureInWindow((x, y, width, height) => {
      if (current !== offerRequest.current || rect.y + rect.height < y || rect.y > y + height) return;
      setOffer({ text: phrase, context: source, owner, rect: { ...rect, x: rect.x - x, y: rect.y - y }, viewport: { width, height } });
    });
  };
  const activateOffer = () => {
    const selected = activeOffer.current;
    if (!selected) return;
    activeOffer.current = null;
    open(selected.text, selected.context);
  };
  useEffect(() => { dismissOffer(); }, [windowSize.width, windowSize.height]);
  const translate = async (selection = text.trim(), source = context) => {
    if (!selection) return;
    const current = ++request.current;
    setLoading(true); setError(''); setResult(null);
    try {
      const key = JSON.stringify([selection, source]);
      const data = cache.current.get(key) ?? await api.post('/translation/selection', { text: selection, context: source });
      if (current === request.current) { setResult(data); if (cache.current.size >= 50) cache.current.clear(); cache.current.set(key, data); }
    } catch (cause: any) {
      if (current === request.current) setError(cause.message || 'Chưa dịch được. Vui lòng thử lại.');
    } finally { if (current === request.current) setLoading(false); }
  };
  const pronounce = () => { void Speech.stop().then(() => Speech.speak(text.trim(), { language: 'en-US', rate: 0.8, onError: () => setError('Chưa phát được giọng tiếng Anh. Kiểm tra dịch vụ đọc trên điện thoại.') })); };
  const partLabels: Record<string, string> = { noun: 'Danh từ', verb: 'Động từ', adjective: 'Tính từ', adverb: 'Trạng từ', phrase: 'Cụm từ', acronym: 'Từ viết tắt' };
  const disabled = loading || !text.trim();
  return <TranslationContext.Provider value={select}><View ref={popupRoot} collapsable={false} style={{ flex: 1 }} onTouchStart={dismissOffer} onTouchMove={dismissOffer}>{children}
    {offer && !visible && <View pointerEvents="box-none" onTouchStart={event => event.stopPropagation()} style={StyleSheet.absoluteFill}><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Dịch ${offer.text}`} onPressIn={activateOffer} onPress={activateOffer} style={[s.lookup, selectionPopupPosition(offer.rect, offer.viewport, insets)]}><MaterialIcons name="translate" size={17} color="#ffffff" /><Text style={s.lookupLabel}>Dịch</Text></TouchableOpacity></View>}
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={[s.backdrop, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng cửa sổ tra từ" onPress={close} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={s.sheet}>
          <View style={s.header}>
            <View style={s.headerIcon}><MaterialIcons name="translate" size={24} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={s.title}>Tra từ</Text></View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng bản dịch" onPress={close} style={s.close}><MaterialIcons name="close" size={22} color={colors.mutedText} /></TouchableOpacity>
          </View>
          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text selectable style={s.selected}>{text}</Text>
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
              {expanded && <Text selectable style={s.contextText}>{context}</Text>}
            </View>
          </ScrollView>
          {!!error && <View style={s.footer}><TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled, busy: loading }} disabled={disabled} onPress={() => void translate()} style={[s.button, disabled && { opacity: 0.55 }]}><Text style={s.buttonText}>Thử lại</Text></TouchableOpacity></View>}
        </View>
      </View>
    </Modal>
  </View></TranslationContext.Provider>;
}
const regular = interFontStyle('400');
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#11182740', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  lookup: { position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, backgroundColor: '#3525cd', elevation: 8, shadowColor: '#111827', shadowOpacity: .18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  lookupLabel: { ...interFontStyle('600'), fontSize: 14, color: '#ffffff' },
  sheet: { width: '100%', maxWidth: 360, maxHeight: '72%', flexShrink: 1, backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden' },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#d8dce7', alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderColor: '#edf0f5' },
  headerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0edff', alignItems: 'center', justifyContent: 'center' },
  title: { ...interFontStyle('700'), color: colors.text, fontSize: compactTextSize(17) },
  subtitle: { ...regular, color: colors.mutedText, fontSize: compactTextSize(13), lineHeight: 20, marginTop: 3 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f6fa', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 10 },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  language: { ...interFontStyle('700'), color: colors.mutedText, fontSize: compactTextSize(10), letterSpacing: 1 },
  label: { ...interFontStyle('600'), color: colors.text, fontSize: compactTextSize(14) },
  selected: { ...interFontStyle('700'), color: colors.text, fontSize: compactTextSize(20), lineHeight: 28 },
  hint: { ...regular, color: colors.mutedText, fontSize: compactTextSize(12), lineHeight: 18 },
  bodyText: { ...regular, color: colors.text, fontSize: compactTextSize(14), lineHeight: 23 },
  error: { backgroundColor: '#fff1f2', borderRadius: 12, padding: 12 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  result: { borderRadius: 20, borderWidth: 1, borderColor: '#ded8fb', backgroundColor: '#f5f2ff', padding: 16, gap: 8 },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  resultLabel: { ...interFontStyle('700'), color: colors.primary, fontSize: compactTextSize(10), letterSpacing: 0.7, flex: 1 },
  speaker: { width: 44, height: 44, backgroundColor: '#ffffff', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  translation: { ...interFontStyle('700'), color: '#29204d', fontSize: compactTextSize(20), lineHeight: 28 },
  pronunciation: { ...regular, color: colors.mutedText, fontSize: compactTextSize(13), lineHeight: 20 },
  definition: { borderTopWidth: 1, borderColor: '#e3def5', paddingTop: 12, marginTop: 4, gap: 5 },
  context: { borderTopWidth: 1, borderColor: '#edf0f5', paddingTop: 4, gap: 8 },
  contextHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  contextText: { ...regular, color: '#626c80', fontSize: compactTextSize(13), lineHeight: 22 },
  footer: { borderTopWidth: 1, borderColor: '#edf0f5', padding: 12, backgroundColor: '#ffffff' },
  button: { minHeight: 52, padding: 14, borderRadius: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { ...interFontStyle('700'), color: '#ffffff', fontSize: compactTextSize(15) },
});
