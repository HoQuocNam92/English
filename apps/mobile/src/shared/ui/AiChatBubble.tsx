import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '../store/auth-context';
import { useTheme } from '../store/theme-context';

const HIDDEN_PATHS = ['/', '/login', '/register', '/forgot-password', '/level', '/it-field', '/certificate', '/career-goal'];

export function AiChatBubble() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading || !isLoggedIn || pathname.startsWith('/ai-tutor') || HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Mở trợ lý AI"
        activeOpacity={0.85}
        onPress={() => router.push('/ai-tutor' as any)}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <View style={styles.onlineDot} />
        <MaterialIcons name="smart-toy" size={27} color="#fff" />
        <Text style={styles.label}>AI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: 18,
    paddingBottom: 76,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },
  label: { color: '#fff', fontSize: 9, fontWeight: '900', lineHeight: 10 },
  onlineDot: {
    position: 'absolute',
    right: 1,
    top: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
