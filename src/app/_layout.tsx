import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTrips } from '@/store/trips';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await SystemUI.setBackgroundColorAsync(colors.bg);
        await useTrips.getState().load();
      } catch (e) {
        console.warn('Safar boot failed', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="trip/new" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="trip/[id]/index" options={{ animation: 'fade', animationDuration: 220 }} />
        <Stack.Screen name="trip/[id]/edit" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="trip/[id]/memories" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="viewer" options={{ animation: 'fade', contentStyle: { backgroundColor: '#000' } }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
