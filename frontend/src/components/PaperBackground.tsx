import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface Props {
  children: React.ReactNode;
  variant?: 'paper' | 'parchment' | 'plain';
  style?: ViewStyle;
}

const TEXTURE_URL = 'https://images.unsplash.com/photo-1702753389906-4c87b7c17988';

/**
 * Subtle paper texture background. Layers an old-paper image
 * with a warm ivory color wash so the page never feels flat.
 */
export default function PaperBackground({ children, variant = 'paper', style }: Props) {
  const baseColor =
    variant === 'parchment'
      ? colors.bg.deep
      : variant === 'plain'
      ? colors.bg.primary
      : colors.bg.paper;

  return (
    <View style={[styles.root, { backgroundColor: baseColor }, style]}>
      {variant !== 'plain' && (
        <Image
          source={{ uri: TEXTURE_URL }}
          style={styles.texture}
          contentFit="cover"
          transition={400}
          cachePolicy="memory-disk"
        />
      )}
      {variant !== 'plain' && (
        <LinearGradient
          colors={[
            'rgba(245, 241, 232, 0.55)',
            'rgba(245, 241, 232, 0.78)',
            'rgba(232, 225, 210, 0.82)',
          ]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      <View style={styles.children}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  children: {
    flex: 1,
  },
});
