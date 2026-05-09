import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../src/lib/storage';
import { colors } from '../src/theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    let navigated = false;

    const navigate = (route: '/onboarding' | '/(tabs)/studio') => {
      if (!alive || navigated) return;
      navigated = true;
      router.replace(route);
    };

    // Race storage against a hard 1.5s fallback
    Promise.race([
      (async () => {
        await storage.getOrCreateUserId();
        const onboarded = await storage.hasOnboarded();
        return onboarded ? '/(tabs)/studio' : '/onboarding';
      })(),
      new Promise<'/onboarding'>((resolve) => setTimeout(() => resolve('/onboarding'), 1500)),
    ])
      .then((dest) => navigate(dest as '/onboarding' | '/(tabs)/studio'))
      .catch(() => navigate('/onboarding'));

    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <ActivityIndicator color={colors.accent.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
