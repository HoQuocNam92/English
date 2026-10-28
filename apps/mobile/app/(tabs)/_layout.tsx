import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { useTheme } from '../../src/shared/store/theme-context';
import { View } from 'react-native';
import { iconColors } from '../../src/shared/ui/icon-colors';
import { interFontStyle } from '../../src/shared/ui/font-styles';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.border,
          height: 72 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          ...interFontStyle('600')
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused }) => <View style={{ width: 44, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: focused ? "#eeecff" : "transparent" }}><MaterialIcons name="home" size={23} color={iconColors.home} /></View>
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
