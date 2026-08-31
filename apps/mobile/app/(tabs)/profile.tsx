import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '@techenglish/design-tokens';
import { api } from '../../src/shared/api/api-client';
import { useAuth } from '../../src/shared/store/auth-context';

export default function MobileProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  const role = profile?.role || user?.role || 'learner';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatarUrl || profile?.userDetail?.avatarUrl || user?.avatarUrl;
  const certGoal = profile?.certGoal || 'AWS Cloud Practitioner';
  const mainDomain = profile?.mainDomain || 'Cloud Computing';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{displayName}</Text>
              {role === 'pro' && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>

        {/* Current Plan & Goal */}
        <View style={styles.goalBox}>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Mục tiêu chứng chỉ</Text>
            <Text style={styles.goalValue}>{certGoal}</Text>
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Chuyên ngành chính</Text>
            <Text style={styles.goalValue}>{mainDomain}</Text>
          </View>
        </View>
      </View>

      {/* Menu Settings */}
      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/edit' as any)}
        >
          <View style={styles.menuLeft}>
            <MaterialIcons name="person-outline" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Chỉnh sửa thông tin cá nhân</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/change-password' as any)}
        >
          <View style={styles.menuLeft}>
            <MaterialIcons name="lock-outline" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/payment/history' as any)}
        >
          <View style={styles.menuLeft}>
            <MaterialIcons name="workspace-premium" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Gói dịch vụ & Lịch sử thanh toán</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
        </TouchableOpacity>

        {/* Nâng cấp PRO menu item */}
        {role !== 'pro' && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/payment' as any)}
          >
            <View style={styles.menuLeft}>
              <MaterialIcons name="star-outline" size={22} color={colors.primary} />
              <Text style={styles.menuText}>Nâng cấp tài khoản PRO</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(onboarding)/level' as any)}
        >
          <View style={styles.menuLeft}>
            <MaterialIcons name="tune" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Thiết lập lại mục tiêu & trình độ</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/test-history' as any)}
        >
          <View style={styles.menuLeft}>
            <MaterialIcons name="history" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Lịch sử thi & bảng điểm</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialIcons name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: 50,
    paddingBottom: 40,
    gap: spacing.lg
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: spacing.md
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff'
  },
  userInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  displayName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  proBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fde68a'
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400e'
  },
  userEmail: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2
  },
  goalBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: spacing.sm,
    gap: 6
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  goalLabel: {
    fontSize: 12,
    color: colors.mutedText
  },
  goalValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text
  },
  logoutButton: {
    backgroundColor: '#fff1f2',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#fecdd3'
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error
  }
});
