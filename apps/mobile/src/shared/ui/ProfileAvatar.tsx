import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { MaterialIcons } from './AppIcon';
import { Text, TouchableOpacity } from './primitives';
import { useTheme } from '../store/theme-context';

interface ProfileAvatarProps {
  letter: string;
  imageUrl?: string | null;
  onPress: () => void;
  accessibilityLabel: string;
  loading?: boolean;
}

export function ProfileAvatar({ letter, imageUrl, onPress, accessibilityLabel, loading = false }: ProfileAvatarProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled: loading, busy: loading }} style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        {loading ? <ActivityIndicator color="#fff" /> : imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : <Text style={styles.letter}>{letter}</Text>}
      </View>
      <View pointerEvents="none" style={[styles.editBadge, { backgroundColor: colors.primary }]}>
        <MaterialIcons name="edit" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 96, height: 96, position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: '#e0e3e5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  letter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
});
