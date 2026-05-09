import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RotateCcw, ArrowRight } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import HandwritingCanvas from '../../src/components/HandwritingCanvas';
import SkiaGate from '../../src/components/SkiaGate';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { ALL_LETTERS, getLetter } from '../../src/data/cursive-letters';
import { storage } from '../../src/lib/storage';
import { api } from '../../src/lib/api';
import { haptics } from '../../src/lib/haptics';

const { width: W } = Dimensions.get('window');

export default function PracticeScreen() {
  const { letter: param } = useLocalSearchParams<{ letter: string }>();
  const router = useRouter();
  const target = decodeURIComponent(param || 'a');
  const isFreeWrite = target === 'freewrite';
  const isMulti = target.length > 1 && !isFreeWrite;

  const [clearKey, setClearKey] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [savedOnce, setSavedOnce] = useState(false);
  const startedRef = useRef<number | null>(null);

  // Letter mode info
  const letterInfo = !isMulti && !isFreeWrite ? getLetter(target) : null;

  // For words / sentences, we render the target text rather than guide paths.
  const headerEyebrow = isFreeWrite
    ? 'FREE PAGE'
    : isMulti
    ? 'WORD'
    : letterInfo?.case === 'upper'
    ? 'UPPERCASE'
    : 'LOWERCASE';

  const headerTitle = isFreeWrite
    ? 'An open page'
    : isMulti
    ? target
    : target;

  // Navigation between letters
  const lettersOfCase = useMemo(() => {
    if (isMulti || isFreeWrite || !letterInfo) return [];
    return ALL_LETTERS.filter((l) => l.case === letterInfo.case);
  }, [isMulti, isFreeWrite, letterInfo]);

  const idx = letterInfo ? lettersOfCase.findIndex((l) => l.char === letterInfo.char) : -1;
  const nextLetter = idx >= 0 && idx < lettersOfCase.length - 1 ? lettersOfCase[idx + 1] : null;

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
        content_type: isFreeWrite ? 'freewrite' : isMulti ? 'word' : 'letter',
        duration_seconds: seconds,
        word_count: isFreeWrite ? 0 : isMulti ? 1 : 0,
        title: isFreeWrite ? 'Free page' : isMulti ? `Word: ${target}` : `Letter: ${target}`,
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
            <Text style={styles.title}>{headerTitle}</Text>
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

        {/* Reference area */}
        {!isFreeWrite && (
          <View style={styles.referenceBox}>
            <Text style={styles.refEyebrow}>Reference</Text>
            <Text style={styles.refScript}>{target}</Text>
            {isMulti ? (
              <Text style={styles.refHint}>Trace each letter, slowly. The page is patient.</Text>
            ) : (
              <Text style={styles.refHint}>
                Follow the gold guide. Lift your finger between strokes if needed.
              </Text>
            )}
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvasCard}>
          <View style={styles.canvasInner}>
            <SkiaGate>
              <HandwritingCanvas
                guideStrokes={letterInfo?.strokes}
                guideViewBox={letterInfo ? { width: 200, height: 200 } : undefined}
                clearSignal={clearKey}
                onChange={setStrokeCount}
                showBaseline
                strokeWidth={5}
              />
            </SkiaGate>
          </View>
        </View>

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
            <Text style={styles.primaryText}>
              {strokeCount === 0 ? 'Skip' : nextLetter ? 'Save & next' : 'Save'}
            </Text>
            <ArrowRight size={16} color={colors.accent.ink} strokeWidth={1.5} />
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headCenter: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.headingItalic,
    fontStyle: 'italic',
    fontSize: 28,
    color: colors.text.primary,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  referenceBox: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  refEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  refScript: {
    fontFamily: fonts.headingItalic,
    fontStyle: 'italic',
    fontSize: 56,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  refHint: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.text.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
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
  canvasInner: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
    borderColor: colors.accent.gold,
  },
  primaryText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.accent.ink,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
