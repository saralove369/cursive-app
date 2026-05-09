import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RotateCcw, Check } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import HandwritingCanvas from '../../src/components/HandwritingCanvas';
import SkiaGate from '../../src/components/SkiaGate';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { api, ContentPiece, friendlyCategory } from '../../src/lib/api';
import { storage } from '../../src/lib/storage';
import { haptics } from '../../src/lib/haptics';

type Phase = 'read' | 'write' | 'complete';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [piece, setPiece] = useState<ContentPiece | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('read');
  const [clearKey, setClearKey] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [saving, setSaving] = useState(false);
  const startedRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    if (!id) return;
    api
      .getContent(id)
      .then((p) => {
        if (alive) setPiece(p);
      })
      .catch((e) => console.warn('content load failed', e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const startWriting = () => {
    haptics.transition();
    startedRef.current = Date.now();
    setPhase('write');
  };

  const saveSession = async () => {
    if (!piece) return;
    setSaving(true);
    try {
      const userId = await storage.getOrCreateUserId();
      const seconds = startedRef.current
        ? Math.max(10, Math.round((Date.now() - startedRef.current) / 1000))
        : 60;
      await api.createSession({
        user_id: userId,
        content_id: piece.id,
        content_type: piece.category,
        duration_seconds: seconds,
        word_count: piece.word_count,
        title: piece.title,
      });
      haptics.complete();
      setPhase('complete');
    } catch (e) {
      console.warn('save session failed', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PaperBackground>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator color={colors.accent.gold} />
        </SafeAreaView>
      </PaperBackground>
    );
  }

  if (!piece) {
    return (
      <PaperBackground>
        <SafeAreaView style={styles.center}>
          <Text style={styles.error}>That piece could not be found.</Text>
        </SafeAreaView>
      </PaperBackground>
    );
  }

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
            testID="session-back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={22} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.eyebrow}>{friendlyCategory(piece.category)}</Text>
          <View style={styles.iconBtn}>
            {phase === 'write' && (
              <TouchableOpacity
                onPress={() => {
                  setClearKey((k) => k + 1);
                  setStrokes(0);
                  haptics.tap();
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <RotateCcw size={20} color={colors.text.primary} strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {phase === 'read' && (
          <ScrollView contentContainerStyle={styles.readScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{piece.title}</Text>
            {piece.author ? (
              <Text style={styles.author}>
                {piece.author}
                {piece.era ? `  ·  ${piece.era}` : ''}
              </Text>
            ) : null}

            {piece.intro ? <Text style={styles.intro}>{piece.intro}</Text> : null}

            <View style={styles.divider} />

            <Text style={styles.body}>{piece.body}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{piece.estimated_minutes} min</Text>
              <Text style={styles.metaDivider}>·</Text>
              <Text style={styles.metaLabel}>{piece.word_count} words</Text>
            </View>

            <TouchableOpacity
              style={styles.beginBtn}
              activeOpacity={0.85}
              onPress={startWriting}
              testID="begin-writing"
            >
              <Text style={styles.beginText}>Begin writing</Text>
            </TouchableOpacity>

            <Text style={styles.tip}>
              Read it once. Then write it slowly, with your own hand. There is no need to hurry.
            </Text>
          </ScrollView>
        )}

        {phase === 'write' && (
          <View style={styles.writeRoot}>
            <View style={styles.passageBox}>
              <Text style={styles.passage}>{piece.body}</Text>
              {piece.author ? (
                <Text style={styles.passageAuthor}>— {piece.author}</Text>
              ) : null}
            </View>

            <View style={styles.canvasCard}>
              <SkiaGate>
                <HandwritingCanvas
                  clearSignal={clearKey}
                  onChange={setStrokes}
                  showBaseline
                  strokeWidth={4}
                />
              </SkiaGate>
            </View>

            <View style={styles.writeFooter}>
              <Text style={styles.strokesText}>
                {strokes === 0 ? 'Begin when ready.' : `${strokes} stroke${strokes === 1 ? '' : 's'}`}
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, strokes === 0 && styles.primaryBtnDisabled]}
                disabled={strokes === 0 || saving}
                onPress={saveSession}
                activeOpacity={0.85}
                testID="complete-session"
              >
                {saving ? (
                  <ActivityIndicator color={colors.accent.ink} />
                ) : (
                  <>
                    <Text style={styles.primaryText}>Complete</Text>
                    <Check size={16} color={colors.accent.ink} strokeWidth={1.5} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === 'complete' && (
          <View style={styles.completeRoot} testID="session-complete">
            <Text style={styles.completeEyebrow}>The hand has rested</Text>
            <Text style={styles.completeTitle}>It is done.</Text>
            <View style={styles.divider} />
            <Text style={styles.completeQuote}>{piece.body}</Text>
            {piece.author ? (
              <Text style={styles.completeAuthor}>— {piece.author}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: spacing.xxl }]}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryText}>Return</Text>
            </TouchableOpacity>
            <Text style={styles.tipSmall}>Saved quietly to your practice.</Text>
          </View>
        )}
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
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  readScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 32,
    lineHeight: 38,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  author: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 15,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  intro: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.lg,
    width: 60,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 22,
    lineHeight: 36,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  metaLabel: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  metaDivider: {
    color: colors.text.faint,
  },
  beginBtn: {
    backgroundColor: colors.accent.gold,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadow.soft,
  },
  beginText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.accent.ink,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  tip: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  writeRoot: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  passageBox: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginBottom: spacing.md,
  },
  passage: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 26,
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  passageAuthor: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  canvasCard: {
    flex: 1,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    ...shadow.soft,
  },
  writeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  strokesText: {
    flex: 1,
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    minWidth: 140,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accent.ink,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  completeRoot: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  completeEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.gold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  completeTitle: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: colors.text.primary,
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  completeQuote: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 19,
    lineHeight: 30,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  completeAuthor: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  tipSmall: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.text.faint,
    marginTop: spacing.lg,
  },
});
