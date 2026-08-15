import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { colors, fonts, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
}

/**
 * Lazily initializes CanvasKit on web before rendering Skia children.
 * On native platforms, renders children immediately.
 */
export default function SkiaGate({ children }: Props) {
  const [ready, setReady] = useState(Platform.OS !== 'web');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let alive = true;
    (async () => {
      try {
        // Lazy import keeps the web-only module out of native bundles
        const mod = await import('@shopify/react-native-skia/lib/module/web');
        if (typeof mod.LoadSkiaWeb === 'function') {
          await mod.LoadSkiaWeb();
        }
        if (alive) setReady(true);
      } catch (e: any) {
        console.warn('Skia web load failed', e);
        if (alive) setError(e?.message || 'Could not load the canvas.');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.box}>
        <Text style={styles.errorEyebrow}>The canvas is unavailable here</Text>
        <Text style={styles.errorBody}>
          The handwriting surface requires a touch device. Please open Codexia & Ink on your phone or tablet for the full ritual.
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.accent.gold} />
        <Text style={styles.loadingText}>Preparing the page…</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.md,
    letterSpacing: 0.3,
  },
  errorEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  errorBody: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 320,
  },
});
