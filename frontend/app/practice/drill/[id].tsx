import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RotateCcw, ArrowRight } from 'lucide-react-native';
import PaperBackground from '../../../src/components/PaperBackground';
import HandwritingCanvas from '../../../src/components/HandwritingCanvas';
import SkiaGate from '../../../src/components/SkiaGate';
import { colors, fonts, spacing, radius, shadow } from '../../../src/theme';
import { getDrill, PENMANSHIP_DRILLS } from '../../../src/data/penmanship-drills';
import { storage } from '../../../src/lib/storage';
import { api } from '../../../src/lib/api';
import { haptics } from '../../../src/lib/haptics';

/**
 * Build a repeating row of drill stroke paths spanning the full guide width.
 * For "compact-oval" we draw small ovals; for "push-pull" we draw slanted
 * vertical lines; for "undercurve" we draw u-shapes; etc.
 */
function buildDrillStrokes(drillId: string): { d: string; start: { x: number; y: number }; direction: any; name: string }[] {
  const strokes: { d: string; start: { x: number; y: number }; direction: any; name: string }[] = [];
  const baseline = 190;
  const headline = 110;
  const ascTop = 30;
  const descBot = 225;

  switch (drillId) {
    case 'compact-oval': {
      let x = 30;
      while (x < 260) {
        strokes.push({
          d: `M ${x + 18} ${baseline - 5} C ${x + 30} ${headline + 5}, ${x + 5} ${headline + 5}, ${x + 5} ${baseline - 30} C ${x + 5} ${baseline - 5}, ${x + 30} ${baseline - 5}, ${x + 30} ${headline + 30} C ${x + 30} ${headline + 5}, ${x + 18} ${headline + 5}, ${x + 18} ${headline + 5}`,
          start: { x: x + 18, y: baseline - 5 },
          direction: 'oval',
          name: 'oval',
        });
        x += 32;
      }
      return strokes;
    }
    case 'direct-oval': {
      let x = 30;
      while (x < 240) {
        const top = ascTop + 20;
        strokes.push({
          d: `M ${x + 25} ${baseline - 5} C ${x + 50} ${top}, ${x + 5} ${top}, ${x + 5} ${baseline - 60} C ${x + 5} ${baseline - 5}, ${x + 50} ${baseline - 5}, ${x + 50} ${top + 60} C ${x + 50} ${top + 10}, ${x + 25} ${top + 10}, ${x + 25} ${top + 10}`,
          start: { x: x + 25, y: baseline - 5 },
          direction: 'oval',
          name: 'large oval',
        });
        x += 56;
      }
      return strokes;
    }
    case 'push-pull': {
      let x = 30;
      while (x < 260) {
        // Slanted vertical: top is right of bottom (slant baked)
        strokes.push({
          d: `M ${x + 16} ${baseline - 5} L ${x + 30} ${ascTop + 30}`,
          start: { x: x + 16, y: baseline - 5 },
          direction: 'downstroke',
          name: 'push-pull',
        });
        x += 18;
      }
      return strokes;
    }
    case 'undercurve': {
      let x = 30;
      while (x < 260) {
        strokes.push({
          d: `M ${x + 5} ${baseline - 5} C ${x + 12} ${baseline - 30}, ${x + 22} ${headline + 5}, ${x + 26} ${headline + 5} L ${x + 28} ${baseline - 5}`,
          start: { x: x + 5, y: baseline - 5 },
          direction: 'undercurve',
          name: 'undercurve',
        });
        x += 30;
      }
      return strokes;
    }
    case 'overcurve': {
      let x = 30;
      while (x < 260) {
        strokes.push({
          d: `M ${x + 5} ${baseline - 5} C ${x + 8} ${headline + 30}, ${x + 16} ${headline + 5}, ${x + 22} ${headline + 5} C ${x + 30} ${headline + 12}, ${x + 32} ${baseline - 5}, ${x + 32} ${baseline - 5}`,
          start: { x: x + 5, y: baseline - 5 },
          direction: 'overcurve',
          name: 'overcurve',
        });
        x += 32;
      }
      return strokes;
    }
    case 'compact-loop': {
      let x = 30;
      while (x < 260) {
        strokes.push({
          d: `M ${x + 6} ${baseline - 5} C ${x + 18} ${baseline - 35}, ${x + 30} ${ascTop + 30}, ${x + 16} ${ascTop + 5} C ${x + 5} ${ascTop + 1}, ${x + 1} ${ascTop + 18}, ${x + 6} ${ascTop + 30} C ${x + 14} ${baseline - 50}, ${x + 26} ${baseline - 5}, ${x + 30} ${baseline - 5}`,
          start: { x: x + 6, y: baseline - 5 },
          direction: 'loop',
          name: 'tall loop',
        });
        x += 34;
      }
      return strokes;
    }
    case 'descending-loop': {
      let x = 30;
      while (x < 260) {
        strokes.push({
          d: `M ${x + 6} ${baseline - 5} C ${x + 14} ${headline + 30}, ${x + 22} ${headline + 5}, ${x + 24} ${headline + 5} L ${x + 30} ${descBot - 10} C ${x + 28} ${descBot}, ${x + 8} ${descBot}, ${x + 4} ${descBot - 12} C ${x + 4} ${descBot - 22}, ${x + 18} ${descBot - 22}, ${x + 30} ${baseline - 5}`,
          start: { x: x + 6, y: baseline - 5 },
          direction: 'descender',
          name: 'descending loop',
        });
        x += 34;
      }
      return strokes;
    }
    case 'connector-rhythm':
    default: {
      let x = 30;
      let alt = 0;
      while (x < 260) {
        if (alt % 2 === 0) {
          // u shape
          strokes.push({
            d: `M ${x + 4} ${baseline - 5} C ${x + 10} ${baseline - 30}, ${x + 18} ${headline + 5}, ${x + 22} ${headline + 5} L ${x + 26} ${baseline - 5}`,
            start: { x: x + 4, y: baseline - 5 },
            direction: 'undercurve',
            name: 'undercurve',
          });
        } else {
          // n shape
          strokes.push({
            d: `M ${x + 4} ${baseline - 5} C ${x + 6} ${headline + 30}, ${x + 14} ${headline + 5}, ${x + 18} ${headline + 5} C ${x + 22} ${headline + 12}, ${x + 26} ${baseline - 5}, ${x + 26} ${baseline - 5}`,
            start: { x: x + 4, y: baseline - 5 },
            direction: 'overcurve',
            name: 'overcurve',
          });
        }
        x += 26;
        alt += 1;
      }
      return strokes;
    }
  }
}

export default function DrillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const drill = id ? getDrill(id) : undefined;

  const [clearKey, setClearKey] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [savedOnce, setSavedOnce] = useState(false);
  const startedRef = useRef<number | null>(null);

  useEffect(() => {
    startedRef.current = Date.now();
    setSavedOnce(false);
    setStrokeCount(0);
    setClearKey((k) => k + 1);
  }, [id]);

  const idx = drill ? PENMANSHIP_DRILLS.findIndex((d) => d.id === drill.id) : -1;
  const next = idx >= 0 && idx < PENMANSHIP_DRILLS.length - 1 ? PENMANSHIP_DRILLS[idx + 1] : null;

  const handleClear = () => {
    haptics.tap();
    setClearKey((k) => k + 1);
    setStrokeCount(0);
  };

  const handleSave = async () => {
    if (!drill) return;
    if (savedOnce || strokeCount === 0) {
      goNext();
      return;
    }
    try {
      const userId = await storage.getOrCreateUserId();
      const seconds = startedRef.current
        ? Math.max(5, Math.round((Date.now() - startedRef.current) / 1000))
        : 30;
      await api.createSession({
        user_id: userId,
        content_type: 'drill',
        duration_seconds: seconds,
        word_count: 0,
        title: `Drill: ${drill.name}`,
      });
      setSavedOnce(true);
      haptics.complete();
    } catch (e) {
      console.warn('save drill failed', e);
    }
    goNext();
  };

  const goNext = () => {
    if (next) {
      router.replace(`/practice/drill/${next.id}`);
    } else {
      router.back();
    }
  };

  if (!drill) {
    return (
      <PaperBackground>
        <SafeAreaView style={styles.center}>
          <Text style={styles.error}>That drill could not be found.</Text>
        </SafeAreaView>
      </PaperBackground>
    );
  }

  const drillStrokes = buildDrillStrokes(drill.id);

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
            testID="drill-back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={22} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <View style={styles.headCenter}>
            <Text style={styles.eyebrow}>{drill.eyebrow}</Text>
            <Text style={styles.title}>{drill.name}</Text>
          </View>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <RotateCcw size={20} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.cueBox}>
          <Text style={styles.cueEyebrow}>THE INSTRUCTION</Text>
          <Text style={styles.cue}>{drill.cue}</Text>
          <Text style={styles.description}>{drill.description}</Text>
        </View>

        <View style={styles.canvasCard}>
          <SkiaGate>
            <HandwritingCanvas
              guideStrokes={drillStrokes}
              guideHeight={drill.guide}
              showStrokeNumbers={false}
              showSlantGuides
              allowReplay
              clearSignal={clearKey}
              onChange={setStrokeCount}
              strokeWidth={4}
            />
          </SkiaGate>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.ghostBtn} onPress={handleClear}>
            <Text style={styles.ghostText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, strokeCount === 0 && styles.primaryBtnSubtle]}
            onPress={handleSave}
            activeOpacity={0.85}
            testID="drill-save"
          >
            <Text style={[styles.primaryText, strokeCount === 0 && { color: colors.text.secondary }]}>
              {strokeCount === 0 ? 'Skip' : next ? 'Save & next drill' : 'Save'}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontFamily: fonts.bodyItalic, fontStyle: 'italic', color: colors.text.muted },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headCenter: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 4,
    letterSpacing: -0.3,
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
    fontFamily: fonts.headingItalic,
    fontStyle: 'italic',
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.text.secondary,
    marginTop: 6,
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
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  ghostBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  ghostText: { fontFamily: fonts.body, fontSize: 15, color: colors.text.secondary, letterSpacing: 0.5 },
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
