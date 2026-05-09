import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../src/lib/storage';
import { colors } from '../src/theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const route = async () => {
      await storage.getOrCreateUserId();
      const onboarded = await storage.hasOnboarded();
      if (onboarded) {
        router.replace('/(tabs)/studio');
      } else {
        router.replace('/onboarding');
      }
    };
    const t = setTimeout(route, 280);
    return () => clearTimeout(t);
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
