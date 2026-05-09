import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RotateCcw, Check } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import HandwritingCanvas from '../../src/components/HandwritingCanvas';
import SkiaGate from '../../src/components/SkiaGate';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { api, HistoricalDocument } from '../../src/lib/api';
import { storage } from '../../src/lib/storage';
import { haptics } from '../../src/lib/haptics';

const PAPER_BG = 'https://images.unsplash.com/photo-1702753389906-4c87b7c17988';

type Phase = 'read' | 'transcribe' | 'complete';

export default function ArchiveDocScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<HistoricalDocument | null>(null);
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
      .getArchiveDoc(id)
      .then((d) => alive && setDoc(d))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const begin = () => {
    haptics.transition();
    startedRef.current = Date.now();
    setPhase('transcribe');
  };

  const save = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      const userId = await storage.getOrCreateUserId();
      const seconds = startedRef.current
        ? Math.max(15, Math.round((Date.now() - startedRef.current) / 1000))
        : 90;
      await api.createSession({
        user_id: userId,
        content_id: doc.id,
        content_type: 'archive',
        duration_seconds: seconds,
        word_count: doc.transcription.split(/\s+/).length,
        title: doc.title,
      });
      haptics.complete();
      setPhase('complete');
    } catch (e) {
      console.warn('save failed', e);
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

  if (!doc) {
    return (
      <PaperBackground>
        <SafeAreaView style={styles.center}>
          <Text style={styles.error}>That document could not be found.</Text>
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
            testID="archive-back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={22} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.eyebrow}>{doc.era}</Text>
          <View style={styles.iconBtn}>
            {phase === 'transcribe' && (
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
            <Text style={styles.title}>{doc.title}</Text>
            {doc.source ? <Text style={styles.author}>{doc.source}</Text> : null}

            {/* Old paper "facsimile" panel */}
            <View style={styles.facsimile}>
              <Image source={{ uri: PAPER_BG }} style={styles.facsimileBg} contentFit="cover" />
              <LinearGradient
                colors={['rgba(245,241,232,0.10)', 'rgba(232,225,210,0.55)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.facsimileText}>{doc.transcription}</Text>
              <Text style={styles.facsimileNote}>{doc.image_description}</Text>
            </View>

            <Text style={styles.context}>{doc.context}</Text>

            <TouchableOpacity style={styles.beginBtn} activeOpacity={0.85} onPress={begin} testID="begin-transcribe">
              <Text style={styles.beginText}>Transcribe by hand</Text>
            </TouchableOpacity>

            <Text style={styles.tip}>
              You will see the passage above the page. Write it slowly. The hand reads what the eye cannot.
            </Text>
          </ScrollView>
        )}

        {phase === 'transcribe' && (
          <View style={styles.writeRoot}>
            <View style={styles.passageBox}>
              <Text style={styles.passage}>{doc.transcription}</Text>
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
                onPress={save}
                activeOpacity={0.85}
                testID="complete-archive"
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
          <View style={styles.completeRoot} testID="archive-complete">
            <Text style={styles.completeEyebrow}>The hand has rested</Text>
            <Text style={styles.completeTitle}>It is kept.</Text>
            <View style={styles.divider} />
            <Text style={styles.completeQuote}>{doc.transcription}</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: spacing.xxl }]}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryText}>Return</Text>
            </TouchableOpacity>
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
    fontSize: 30,
    lineHeight: 36,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  author: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  facsimile: {
    marginTop: spacing.lg,
    backgroundColor: colors.bg.deep,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    overflow: 'hidden',
    minHeight: 200,
    ...shadow.paper,
  },
  facsimileBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  facsimileText: {
    fontFamily: fonts.headingItalic,
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 34,
    color: colors.accent.sepia,
    letterSpacing: 0.4,
  },
  facsimileNote: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'right',
  },
  context: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    marginTop: spacing.lg,
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
    paddingHorizontal: spacing.md,
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
    fontSize: 16,
    lineHeight: 25,
    color: colors.accent.sepia,
    letterSpacing: 0.3,
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
  primaryBtnDisabled: { opacity: 0.4 },
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
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.lg,
    width: 60,
  },
  completeQuote: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 28,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
