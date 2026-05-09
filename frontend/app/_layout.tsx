import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts as usePlayfair,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  useFonts as useGaramond,
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_600SemiBold,
} from '@expo-google-fonts/eb-garamond';
import {
  useFonts as useCrimson,
  CrimsonText_400Regular,
} from '@expo-google-fonts/crimson-text';
import {
  useFonts as useDancing,
  DancingScript_400Regular,
} from '@expo-google-fonts/dancing-script';
import {
  useFonts as useAllura,
  Allura_400Regular,
} from '@expo-google-fonts/allura';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [pf] = usePlayfair({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold,
  });
  const [eb] = useGaramond({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_600SemiBold,
  });
  const [ct] = useCrimson({ CrimsonText_400Regular });
  const [ds] = useDancing({ DancingScript_400Regular });
  const [al] = useAllura({ Allura_400Regular });

  const ready = pf && eb && ct && ds && al;

  useEffect(() => {
    // Hide splash whether fonts loaded or not after a short delay,
    // so the app is never visually stuck.
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.primary },
          animation: 'fade',
          animationDuration: 400,
        }}
      />
    </GestureHandlerRootView>
  );
}
