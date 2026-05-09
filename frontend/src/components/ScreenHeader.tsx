import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '../theme';
import { haptics } from '../lib/haptics';

interface Props {
  title?: string;
  eyebrow?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function ScreenHeader({ title, eyebrow, showBack = false, rightAction }: Props) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => {
              haptics.tap();
              router.back();
            }}
            style={styles.backBtn}
            testID="header-back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.center}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        </View>
        <View style={styles.right}>{rightAction}</View>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  spacer: {
    width: 32,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 32,
    alignItems: 'flex-end',
  },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.text.muted,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 38,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    letterSpacing: -0.4,
  },
});
