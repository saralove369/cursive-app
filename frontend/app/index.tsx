import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { storage } from '../src/lib/storage';
import { colors } from '../src/theme';

export default function Index() {
  const [destination, setDestination] = useState<'/onboarding' | '/(tabs)/studio' | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await storage.getOrCreateUserId();
        const onboarded = await storage.hasOnboarded();
        if (alive) {
          setDestination(onboarded ? '/(tabs)/studio' : '/onboarding');
        }
      } catch (e) {
        console.warn('index route err', e);
        if (alive) setDestination('/onboarding');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (destination) {
    return <Redirect href={destination} />;
  }

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
