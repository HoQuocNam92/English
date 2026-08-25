import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@techenglish/design-tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Học tập',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Luyện tập',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="quiz" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Tiến độ',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="trending-up" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
