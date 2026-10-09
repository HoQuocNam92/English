import { Text, Button } from '../src/shared/ui/primitives';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '../src/shared/ui/AppIcon';
import { useAuth } from '../src/shared/store/auth-context';

export default function EntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return <View style={s.loading}><ActivityIndicator color="#3525cd" /></View>;
  if (isLoggedIn) return <Redirect href="/(tabs)/home" />;
  return <ScrollView style={s.root} contentContainerStyle={[s.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
    <StatusBar style="dark" />
    <View style={s.hero}>
      <View style={s.logo}><Image source={require('../assets/icon.png')} style={s.logoImage} accessibilityLabel="Logo Tech English" /></View>
      <Text style={s.brand}>TECH ENGLISH</Text>
      <Text style={s.title}>Tự tin tiếng Anh.{'\n'}Vững bước công nghệ.</Text>
      <Text style={s.subtitle}>Học tiếng Anh chuyên ngành CNTT theo mục tiêu và nhịp độ của bạn.</Text>
      <View style={s.highlights}>{[{ icon: 'auto-stories', title: 'Bài học thực tế' }, { icon: 'translate', title: 'Từ vựng chuyên ngành' }, { icon: 'workspace-premium', title: 'Lộ trình chứng chỉ' }].map(item => <View key={item.title} style={s.highlight}><View style={s.icon}><MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={22} color="#6054c8" /></View><Text style={s.highlightText}>{item.title}</Text></View>)}</View>
    </View>
    <View style={s.actions}><Button onPress={() => router.push('/(auth)/login' as any)}>Đăng nhập</Button><Button mode="outlined" onPress={() => router.push('/(auth)/register' as any)}>Tạo tài khoản mới</Button><Text style={s.note}>Mỗi ngày một bước tiến mới.</Text></View>
  </ScrollView>;
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fc' }, content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between', gap: 32 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingTop: 24 }, logo: { width: 104, height: 104, borderRadius: 30, padding: 12, backgroundColor: '#eeecff', marginBottom: 28 }, logoImage: { width: 80, height: 80, borderRadius: 22 }, brand: { fontSize: 13, fontWeight: '700', letterSpacing: 2, color: '#6054c8', marginBottom: 14 }, title: { fontSize: 32, lineHeight: 43, fontWeight: '700', color: '#17213a', letterSpacing: -0.6 }, subtitle: { fontSize: 16, lineHeight: 25, color: '#59657c', marginTop: 16 },
  highlights: { gap: 14, marginTop: 32 }, highlight: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { padding: 10, borderRadius: 12, backgroundColor: '#eeecff' }, highlightText: { fontSize: 15, fontWeight: '600', color: '#17213a', flex: 1 }, actions: { gap: 12 }, note: { textAlign: 'center', fontSize: 13, color: '#59657c', marginTop: 4 },
});
