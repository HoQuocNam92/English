import { Text, Button } from '../src/shared/ui/primitives';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
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
      <View style={[s.logo, { backgroundColor: '#3525cd', alignItems: 'center', justifyContent: 'center' }]} accessibilityLabel="TechEnglish Pro"><MaterialIcons name="terminal" size={64} color="#ffffff" /></View>
      <Text style={[s.brand, { fontSize: 22, letterSpacing: -0.4, color: '#3525cd' }]}>TechEnglish Pro</Text>
      <Text style={s.title}>Tự tin tiếng Anh.{'\n'}Vững bước công nghệ.</Text>
      <Text style={s.subtitle}>Học tiếng Anh chuyên ngành CNTT theo mục tiêu và nhịp độ của bạn.</Text>
    </View>
    <View style={s.actions}><Button onPress={() => router.push('/(auth)/login' as any)}>Đăng nhập</Button><Button mode="outlined" onPress={() => router.push('/(auth)/register' as any)}>Tạo tài khoản mới</Button><Text style={s.note}>Mỗi ngày một bước tiến mới.</Text></View>
  </ScrollView>;
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fc' }, content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between', gap: 32 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingTop: 24 }, logo: { width: 104, height: 104, borderRadius: 30, padding: 12, backgroundColor: '#eeecff', marginBottom: 28 }, logoImage: { width: 80, height: 80, borderRadius: 22 }, brand: { fontSize: 13, fontWeight: '700', letterSpacing: 2, color: '#6054c8', marginBottom: 14 }, title: { fontSize: 32, lineHeight: 43, fontWeight: '700', color: '#17213a', letterSpacing: -0.6 }, subtitle: { fontSize: 16, lineHeight: 25, color: '#59657c', marginTop: 16 },
  actions: { gap: 12 }, note: { textAlign: 'center', fontSize: 13, color: '#59657c', marginTop: 4 },
});
