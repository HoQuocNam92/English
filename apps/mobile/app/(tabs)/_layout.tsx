import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../src/shared/store/auth-context';
import { api } from '../../src/shared/api/api-client';
import { postLoginDestination } from '../../../../packages/shared-kernel/src/post-login-destination';
import { hasCompletedOnboarding, isOnboardingCompletionCached, rememberCompletedOnboarding } from '../../src/shared/store/onboarding-cache';
import { Button, Text } from '../../src/shared/ui/primitives';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { useTheme } from '../../src/shared/store/theme-context';
import { ActivityIndicator, View } from 'react-native';
import { iconColors } from '../../src/shared/ui/icon-colors';
import { interFontStyle } from '../../src/shared/ui/font-styles';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [checkedUser, setCheckedUser] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn || !user) { router.replace('/(auth)/login' as any); return; }
    if (checkedUser === user.id || isOnboardingCompletionCached(user.id)) return;
    let active = true;
    setError(false);
    void (async () => {
      if (await hasCompletedOnboarding(user.id)) return '/(tabs)/home';
      const destination = await postLoginDestination({ mobile: true, loadProfile: () => api.get<any>('/learner-profiles/me') });
      if (destination === '/(tabs)/home') await rememberCompletedOnboarding(user.id);
      return destination;
    })()
      .then(destination => {
        if (!active) return;
        if (destination !== '/(tabs)/home') router.replace(destination as any);
        else setCheckedUser(user.id);
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [isLoading, isLoggedIn, user?.id, checkedUser, router, retry]);
  if (isLoading || !isLoggedIn || !user || (checkedUser !== user.id && !isOnboardingCompletionCached(user.id))) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>{error ? <><Text>Chưa kiểm tra được lộ trình học. Vui lòng thử lại.</Text><Button onPress={() => setRetry(value => value + 1)}>Thử lại</Button></> : <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Đang tải" />}</View>;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 10,
          ...interFontStyle('600')
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused }) => <View style={{ width: 44, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: focused ? "#eeecff" : "transparent" }}><MaterialIcons name="home" size={21} color={iconColors.home} /></View>
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Bài học',
          tabBarIcon: ({ focused }) => <View style={{ width: 44, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: focused ? "#eeecff" : "transparent" }}><MaterialIcons name="menu-book" size={23} color={iconColors.learning} /></View>,
        }}
      />
      <Tabs.Screen name="practice" options={{ href: null }} />
      <Tabs.Screen name="plan" options={{ title: 'Lộ trình', tabBarIcon: ({ focused }) => <View style={{ width: 44, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: focused ? '#eeecff' : 'transparent' }}><MaterialIcons name="route" size={23} color={iconColors.learning} /></View> }} />
      <Tabs.Screen name="certificates" options={{ title: "Chứng chỉ", tabBarIcon: ({ focused }) => <View style={{ width: 44, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: focused ? "#eeecff" : "transparent" }}><MaterialIcons name="workspace-premium" size={23} color={iconColors.certificate} /></View> }} />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Tiến độ',
          href: null,
          tabBarIcon: ({ focused }) => <View style={{ width: 44, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: focused ? "#eeecff" : "transparent" }}><MaterialIcons name="monitoring" size={23} color={iconColors.progress} /></View>
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ focused }) => <View style={{ width: 44, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: focused ? "#eeecff" : "transparent" }}><MaterialIcons name="person" size={23} color={iconColors.profile} /></View>
        }}
      />
    </Tabs>
  );
}
