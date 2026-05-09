import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RotateCcw, ArrowRight } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import HandwritingCanvas from '../../src/components/HandwritingCanvas';
import SkiaGate from '../../src/components/SkiaGate';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import {
  ALL_LETTERS,
  LOWERCASE_LETTERS,
  UPPERCASE_LETTERS,
  getLetter,
  CursiveLetter,
} from '../../src/data/cursive-letters';
import { storage } from '../../src/lib/storage';
import { api } from '../../src/lib/api';
import { haptics } from '../../src/lib/haptics';

export default function PracticeScreen() {
  const { letter: param } = useLocalSearchParams<{ letter: string }>();
  const router = useRouter();
  const target = decodeURIComponent(param || 'a');
  const isFreeWrite = target === 'freewrite';

  const letter = !isFreeWrite ? getLetter(target) : undefined;

  const [clearKey, setClearKey] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [savedOnce, setSavedOnce] = useState(false);
  const startedRef = useRef<number | null>(null);

  // Navigate to next letter of the same case
  const seq = useMemo(() => {
    if (!letter) return [];
    return letter.case === 'lower' ? LOWERCASE_LETTERS : UPPERCASE_LETTERS;
  }, [letter]);
  const idx = letter ? seq.findIndex((l) => l.char === letter.char) : -1;
  const nextLetter: CursiveLetter | null = idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : null;

  useEffect(() => {
    startedRef.current = Date.now();
    setSavedOnce(false);
    setStrokeCount(0);
    setClearKey((k) => k + 1);
  }, [target]);

  const handleClear = () => {
    haptics.tap();
    setClearKey((k) => k + 1);
    setStrokeCount(0);
  };

  const handleSave = async () => {
    if (savedOnce || strokeCount === 0) {
      goNext();
      return;
    }
    const userId = await storage.getOrCreateUserId();
    const seconds = startedRef.current
      ? Math.max(5, Math.round((Date.now() - startedRef.current) / 1000))
      : 30;
    try {
      await api.createSession({
        user_id: userId,
        content_type: isFreeWrite ? 'freewrite' : 'letter',
        duration_seconds: seconds,
        word_count: 0,
        title: isFreeWrite ? 'Free page' : `Letter: ${target}`,
      });
      setSavedOnce(true);
      haptics.complete();
    } catch (e) {
      console.warn('save session failed', e);
    }
    goNext();
  };

  const goNext = () => {
    if (nextLetter) {
      router.replace(`/practice/${encodeURIComponent(nextLetter.char)}`);
    } else {
      router.back();
    }
  };

  const headerEyebrow = isFreeWrite
    ? 'FREE PAGE'
    : letter?.case === 'upper'
    ? 'CAPITAL · PALMER METHOD'
    : 'MINIMUM · PALMER METHOD';

  return (
    <PaperBackground variant="parchment">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              haptics.tap();
              router.back();
            }}
            style={styles.iconBtn}
            testID="practice-back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={22} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <View style={styles.headCenter}>
            <Text style={styles.eyebrow}>{headerEyebrow}</Text>
            <Text style={styles.title}>{isFreeWrite ? 'An open page' : target}</Text>
            {letter && (
              <Text style={styles.height}>
                {letter.height === 'minimum'
                  ? 'minimum letter · 1 unit'
                  : letter.height === 'ascender'
                  ? 'ascender · 3 units'
                  : letter.height === 'descender'
                  ? 'descender · extends below baseline'
                  : 'capital · 3 units'}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.iconBtn}
            testID="practice-clear"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <RotateCcw size={20} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Instructional cue */}
        {letter && (
          <View style={styles.cueBox}>
            <Text style={styles.cueEyebrow}>STROKE ORDER</Text>
            <Text style={styles.cue}>{letter.cue}</Text>
            {letter.strokes.length > 1 && (
              <Text style={styles.penLifts}>
                {letter.strokes.length} strokes · {letter.strokes.length - 1} pen lift
                {letter.strokes.length - 1 === 1 ? '' : 's'}
              </Text>
            )}
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvasCard}>
          <SkiaGate>
            <HandwritingCanvas
              guideStrokes={letter?.strokes}
              guideHeight={letter?.height}
              showStrokeNumbers={!isFreeWrite}
              showSlantGuides
              allowReplay={!isFreeWrite}
              clearSignal={clearKey}
              onChange={setStrokeCount}
              strokeWidth={5}
            />
          </SkiaGate>
        </View>

        {/* Description */}
        {letter && (
          <Text style={styles.description}>{letter.description}</Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.ghostBtn} onPress={handleClear} testID="footer-clear">
            <Text style={styles.ghostText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, strokeCount === 0 && styles.primaryBtnSubtle]}
            onPress={handleSave}
            activeOpacity={0.85}
            testID="footer-save"
          >
            <Text
              style={[
                styles.primaryText,
                strokeCount === 0 && { color: colors.text.secondary },
              ]}
            >
              {strokeCount === 0 ? 'Skip' : nextLetter ? 'Save & next' : 'Save'}
            </Text>
            <ArrowRight
              size={16}
              color={strokeCount === 0 ? colors.text.secondary : colors.accent.ink}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  headCenter: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.copperplate,
    fontSize: 56,
    color: colors.text.primary,
    marginTop: 4,
    letterSpacing: -0.3,
    lineHeight: 64,
  },
  height: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  cueBox: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
  },
  cueEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cue: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text.primary,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  penLifts: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
  canvasCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    ...shadow.soft,
  },
  description: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  ghostBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  ghostText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.gold,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  primaryBtnSubtle: {
    backgroundColor: colors.bg.paper,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  primaryText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.accent.ink,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
