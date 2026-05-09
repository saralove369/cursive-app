import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import { haptics } from '../lib/haptics';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function InkButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  testID,
  style,
  fullWidth = false,
}: Props) {
  const handlePress = () => {
    haptics.press();
    onPress();
  };
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    variant === 'primary' && styles.labelPrimary,
    variant === 'secondary' && styles.labelSecondary,
    variant === 'ghost' && styles.labelGhost,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={isDisabled}
      style={containerStyle}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.bg.primary : colors.accent.gold} />
      ) : (
        <View style={styles.content}>
          <Text style={labelStyle}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.accent.gold,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent.gold,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  labelPrimary: {
    color: '#1A1A1A',
  },
  labelSecondary: {
    color: colors.accent.gold,
  },
  labelGhost: {
    color: colors.text.secondary,
    letterSpacing: 1.2,
    textTransform: 'none',
    fontSize: 15,
  },
});
