import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Care } from '@/constants/care-theme';
import { DoseStatusProvider } from '@/context/dose-status';
import { InboxProvider } from '@/context/inbox';
import { SettingsProvider } from '@/context/settings';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Care.background, card: Care.surfaceMuted },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <SettingsProvider>
        <DoseStatusProvider>
          <InboxProvider>
            <StatusBar style="light" />
            <AnimatedSplashOverlay />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Care.background },
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="routine/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="inbox/index" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="inbox/invite/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="messages/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="profile/share" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="emergency" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen
                name="call/[id]"
                options={{ animation: 'fade', gestureEnabled: false }}
              />
            </Stack>
          </InboxProvider>
        </DoseStatusProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
