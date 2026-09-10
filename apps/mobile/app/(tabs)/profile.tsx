import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '@techenglish/design-tokens';
import { useTheme } from '../../src/shared/store/theme-context';
import { useI18n } from '../../src/shared/store/i18n-context';
import { api } from '../../src/shared/api/api-client';
import { useAuth } from '../../src/shared/store/auth-context';

export default function MobileProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    api.get('/auth/me')
      .then(data => setProfile(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = profile?.displayName || user?.displayName || 'Người dùng';
  const email = profile?.email || user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatarUrl || profile?.userDetail?.avatarUrl || user?.avatarUrl;
  
  const currentLevelRaw = profile?.learnerProfile?.currentLevel;
  const currentLevel = typeof currentLevelRaw === 'object' && currentLevelRaw !== null
    ? (currentLevelRaw.name ?? currentLevelRaw.code ?? 'Intermediate (B1)')
    : (currentLevelRaw || 'Intermediate (B1)');
  const mainDomain = profile?.learnerProfile?.mainDomain || 'Software Engineering';
  const careerGoal = profile?.learnerProfile?.careerGoal || 'Full-stack Dev';
  const certGoal = profile?.certGoal || profile?.learnerProfile?.certGoal || 'AWS Solutions Architect';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* TopAppBar */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerButton} />
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Cá nhân</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/community' as any)}>
          <MaterialIcons name="more-vert" size={24} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarLarge} />
            ) : (
              <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarTextLarge}>{avatarLetter}</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: '#4F46E5' }]} onPress={() => router.push('/profile/edit' as any)}>
              <MaterialIcons name="edit" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.onSurface }]}>{displayName}</Text>
          <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>{email}</Text>
        </View>

        {/* Academic & Career Info - 4 Bento Cards */}
        <View style={styles.bentoGrid}>
          {/* English Level */}
          <View style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#dbeafe' }]}>
              <MaterialIcons name="language" size={20} color="#1d4ed8" />
            </View>
            <View style={styles.bentoContent}>
              <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>ENGLISH LEVEL</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>{currentLevel}</Text>
            </View>
          </View>

          {/* IT Field */}
          <View style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#f5f3ff' }]}>
              <MaterialIcons name="terminal" size={20} color="#5c00ca" />
            </View>
            <View style={styles.bentoContent}>
              <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>IT FIELD</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>{mainDomain}</Text>
            </View>
          </View>

          {/* Career Goal */}
          <View style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#EEF2FF' }]}>
              <MaterialIcons name="rocket-launch" size={20} color="#4F46E5" />
            </View>
            <View style={styles.bentoContent}>
              <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>CAREER GOAL</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>{careerGoal}</Text>
            </View>
          </View>

          {/* Target Certification */}
          <View style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#e0e3e5' }]}>
              <MaterialIcons name="workspace-premium" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.bentoContent}>
              <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>TARGET CERTIFICATION</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>{certGoal}</Text>
            </View>
          </View>
        </View>

        {/* Action List */}
        <View style={[styles.menuList, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          {[
            ['route', 'Lộ trình học', '/roadmap'],
            ['auto-awesome', 'Tạo lộ trình cá nhân', '/path-generator'],
            ['analytics', 'Phân tích học tập', '/analytics'],
            ['military-tech', 'Thành tích', '/achievements'],
            ['workspace-premium', 'Chứng chỉ', '/certifications'],
            ['notifications', 'Thông báo', '/notifications'],
            ['bookmark', 'Từ đã lưu', '/saved'],
            ['style', 'Flashcards', '/flashcards'],
            ['article', 'Reading Lab', '/reading-lab'],
          ].map(([icon, label, route], index, list) => (
            <TouchableOpacity key={route} style={[styles.menuListItem, { borderBottomColor: colors.outlineVariant, borderBottomWidth: index === list.length - 1 ? 0 : 1 }]} onPress={() => router.push(route as any)}>
              <View style={styles.menuListLeft}><MaterialIcons name={icon as any} size={22} color={colors.primary} /><Text style={[styles.menuListText, { color: colors.onSurface }]}>{label}</Text></View>
              <MaterialIcons name="chevron-right" size={24} color={colors.outlineVariant} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.menuList, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={[styles.menuListItem, { borderBottomColor: colors.outlineVariant }]}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <View style={styles.menuListLeft}>
              <MaterialIcons name="person" size={22} color={colors.onSurfaceVariant} />
              <Text style={[styles.menuListText, { color: colors.onSurface }]}>Chỉnh sửa hồ sơ</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuListItem, { borderBottomWidth: 0 }]}
            onPress={() => router.push('/profile/change-password' as any)}
          >
            <View style={styles.menuListLeft}>
              <MaterialIcons name="lock-reset" size={22} color={colors.onSurfaceVariant} />
              <Text style={[styles.menuListText, { color: colors.onSurface }]}>Đổi mật khẩu</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outlineVariant} />
          </TouchableOpacity>
        </View>

        {/* Settings - Theme & Language (Keep existing but style to match) */}
        <View style={[styles.menuList, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <View style={[styles.menuListItem, { borderBottomColor: colors.outlineVariant, paddingVertical: spacing.sm }]}>
            <View style={styles.menuListLeft}>
              <Text style={{ fontSize: 18 }}>🌙</Text>
              <Text style={[styles.menuListText, { color: colors.onSurface }]}>{isDark ? t.lightMode : t.darkMode}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              thumbColor={colors.onPrimary}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.menuListItem, { borderBottomWidth: 0 }]}
            onPress={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
          >
            <View style={styles.menuListLeft}>
              <Text style={{ fontSize: 18 }}>🌐</Text>
              <Text style={[styles.menuListText, { color: colors.onSurface }]}>{t.language}</Text>
            </View>
            <View style={[styles.langBadge, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 12 }}>
                {locale === 'vi' ? 'VI' : 'EN'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Action */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={[styles.logoutButtonNew, { borderColor: colors.error, backgroundColor: 'transparent' }]} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color={colors.error} />
            <Text style={[styles.logoutTextNew, { color: colors.error }]}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
    marginTop: 40 // safearea substitute
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  contentContainer: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 80,
    gap: spacing.xl
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    width: 96,
    height: 96,
    marginBottom: spacing.md,
  },
  avatarLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#e0e3e5', // surface-container-highest
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextLarge: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  bentoCard: {
    width: '47.5%', // close to 50% minus gap
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bentoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoContent: {
    flex: 1,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bentoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuList: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  menuListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuListText: {
    fontSize: 14,
    fontWeight: '600',
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoutButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 160,
  },
  logoutTextNew: {
    fontSize: 14,
    fontWeight: '600',
  }
});
