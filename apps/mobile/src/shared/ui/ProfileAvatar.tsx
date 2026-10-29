import { Image, StyleSheet, View } from 'react-native';
import { Text } from './primitives';
import { useTheme } from '../store/theme-context';

interface ProfileAvatarProps {
  letter: string;
  imageUrl?: string | null;
  accessibilityLabel: string;
}

export function ProfileAvatar({ letter, imageUrl, accessibilityLabel }: ProfileAvatarProps) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : <Text style={styles.letter}>{letter}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 96, height: 96, position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: '#e0e3e5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  letter: { fontSize: 36, fontWeight: '800', color: '#fff' },
});
