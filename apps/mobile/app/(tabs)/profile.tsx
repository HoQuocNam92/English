import { Text, TouchableOpacity } from '../../src/shared/ui/primitives';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { spacing } from '@techenglish/design-tokens';
import { useTheme } from '../../src/shared/store/theme-context';
import { api } from '../../src/shared/api/api-client';
import { useAuth } from '../../src/shared/store/auth-context';

export default function MobileProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [learnerProfile, setLearnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.allSettled([api.get('/auth/me'), api.get('/learner-profiles/me')])
      .then(([meResult, learnerResult]) => {
        if (meResult.status === 'fulfilled') setProfile(meResult.value);
        if (learnerResult.status === 'fulfilled') setLearnerProfile(learnerResult.value);
      })
      .finally(() => setLoading(false));
  }, []));

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
  
  const currentLevel = learnerProfile?.level?.name || learnerProfile?.level?.code || 'Chưa thiết lập';
  const mainDomain = learnerProfile?.domains?.map((item: any) => item.domain?.name).filter(Boolean).join(', ') || 'Chưa thiết lập';
  const certGoal = learnerProfile?.certGoals?.map((item: any) => item.certificate?.name).filter(Boolean).join(', ') || 'Chưa thiết lập';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      
      {/* TopAppBar */}
      <View style={[styles.header, { backgroundColor: colors.surface, marginTop: insets.top }]}>
        <View style={styles.headerButton} />
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Cá nhân</Text>
        <View style={styles.headerButton} />
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
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/profile/edit' as any)}>
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
              <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>TRÌNH ĐỘ TIẾNG ANH</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>{currentLevel}</Text>
            </View>
          </View>

          {/* IT Field */}
          <View style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#f5f3ff' }]}>
              <MaterialIcons name="terminal" size={20} color="#5c00ca" />
            </View>
            <View style={styles.bentoContent}>
              <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>LĨNH VỰC CNTT</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>{mainDomain}</Text>
            </View>
          </View>

          {/* Target Certification */}
          <View style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.bentoIconBox, { backgroundColor: '#e0e3e5' }]}>
              <MaterialIcons name="workspace-premium" size={20} color={colors.onSurface} />
            </View>
            <View style={styles.bentoContent}>
              <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>CHỨNG CHỈ MỤC TIÊU</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>{certGoal}</Text>
            </View>
          </View>
        </View>

        {/* Action List */}
        <View style={[styles.menuList, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          {[
            ['article', 'Danh mục học tập', '/catalog'],
            ['history', 'Lịch sử học tập', '/profile/history'],
            ['school', 'Lộ trình học', '/learning-plan'],
            ['style', 'Tổng quan từ vựng', '/flashcards/dashboard'],
            ['history', 'Từ đã học', '/flashcards/history'],
            ['school', 'Kiểm tra trình độ', '/placement-test'],
            ['security', 'Chính sách bảo mật', '/privacy'],
            ['article', 'Điều khoản sử dụng', '/terms'],
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
    backgroundColor: '#f7f8fc'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
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
