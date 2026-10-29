import { StudyTimeTracker } from '../src/shared/study-time/StudyTimeTracker';
import { NotificationNavigation } from '../src/shared/notifications/NotificationNavigation';
import { NotificationHistoryProvider } from '../src/shared/notifications/NotificationHistoryProvider';
import { useEffect } from 'react';
import { MobileUIProvider } from '../src/shared/ui/paper-theme';
import { TranslationProvider } from '../src/shared/ui/TranslationProvider';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { interFonts } from '../src/shared/ui/font-assets';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/shared/store/auth-context';
import { ThemeProvider } from '../src/shared/store/theme-context';
import { getNativeNotifications } from '../src/shared/notifications/native-notifications';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...interFonts, ...MaterialIcons.font, ...MaterialCommunityIcons.font });
  useEffect(() => {
    getNativeNotifications()?.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
  }, []);
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
            <NotificationHistoryProvider><TranslationProvider><MobileUIProvider><Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: '#f7f9fb'
                }
              }}
            /><NotificationNavigation /><StudyTimeTracker /></MobileUIProvider></TranslationProvider></NotificationHistoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
