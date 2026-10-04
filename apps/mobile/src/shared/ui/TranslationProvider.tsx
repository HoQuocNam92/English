import React, { createContext, useContext, useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius } from '@techenglish/design-tokens';
import { MaterialIcons } from './AppIcon';
import * as Speech from 'expo-speech';
import { api } from '../api/api-client';

const TranslationContext = createContext<(context: string) => void>(() => {});
export const useTranslation = () => useContext(TranslationContext);
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState(''); const [text, setText] = useState(''); const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<any>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const request = useRef(0); const cache = useRef(new Map<string, any>());
  const close = () => { request.current++; setVisible(false); void Speech.stop(); };
  const open = (value: string) => { request.current++; setContext(value); setText(value.length <= 120 ? value : ''); setResult(null); setError(''); setLoading(false); setVisible(true); };
  const translate = async () => {
    const selection = text.trim(); if (!selection) { setError('Nhập từ hoặc cụm từ cần dịch.'); return; }
    const current = ++request.current; setLoading(true); setError(''); setResult(null);
    try { const key = JSON.stringify([selection, context]); const data = cache.current.get(key) ?? await api.post('/translation/selection', { text: selection, context });
      if (current === request.current) { setResult(data); if (cache.current.size >= 50) cache.current.clear(); cache.current.set(key, data); }
    } catch (cause: any) { if (current === request.current) setError(cause.message); } finally { if (current === request.current) setLoading(false); }
  };
  const font = { fontFamily: 'Inter', color: colors.text, fontSize: 14, lineHeight: 22 };
  const button = { minHeight: 44, padding: 12, borderRadius: radius.control, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.primary };
  return <TranslationContext.Provider value={open}>{children}<Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 20 }}><View style={{ maxHeight: '90%', backgroundColor: colors.surfaceWhite, borderRadius: radius.modal, padding: 20, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={[font, { fontSize: 20, fontWeight: '700' }]}>Dịch theo ngữ cảnh</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng bản dịch" onPress={close} style={{ padding: 10 }}><MaterialIcons name="close" size={24} color={colors.mutedText} /></TouchableOpacity></View>
      <ScrollView><Text selectable style={[font, { color: colors.mutedText }]}>{context}</Text>
      <Text style={[font, { marginTop: 12, fontWeight: '600' }]}>Từ/cụm từ cần dịch</Text><TextInput accessibilityLabel="Từ hoặc cụm từ cần dịch" value={text} onChangeText={value => { request.current++; setText(value); setResult(null); setLoading(false); }} maxLength={120} autoCapitalize="none" style={[font, { minHeight: 44, borderColor: colors.outlineVariant, borderWidth: 1, borderRadius: radius.control, padding: 12, marginTop: 8 }]} />
      <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={translate} style={[button, { marginTop: 12, opacity: loading ? 0.5 : 1 }]}><Text style={[font, { color: colors.onPrimary, fontWeight: '700' }]}>Dịch</Text></TouchableOpacity>
      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}{error && <Text accessibilityRole="alert" style={[font, { color: colors.error, marginTop: 12 }]}>{error}</Text>}
      {result && <View style={{ gap: 8, marginTop: 12 }}><Text style={font}>{result.translation ?? result.message}</Text>{result.pronunciationIpa && <Text style={font}>{result.pronunciationIpa}</Text>}{result.partOfSpeech && <Text style={font}>{result.partOfSpeech}</Text>}{result.definitionEn && <Text style={font}>{result.definitionEn}</Text>}<TouchableOpacity accessibilityRole="button" accessibilityLabel="Nghe phát âm" onPress={() => { void Speech.stop().then(() => Speech.speak(text, { language: 'en-US', rate: 0.8, onError: () => setError('Chưa phát được giọng tiếng Anh. Kiểm tra dịch vụ đọc trên điện thoại.') })); }} style={button}><Text style={[font, { color: colors.onPrimary }]}>Nghe phát âm</Text></TouchableOpacity></View>}
      </ScrollView>
    </View></View>
  </Modal></TranslationContext.Provider>;
}
