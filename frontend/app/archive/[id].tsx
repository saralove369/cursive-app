import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RotateCcw, Check, Maximize2, X, ArrowRight } from 'lucide-react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import PaperBackground from '../../src/components/PaperBackground';
import HandwritingCanvas from '../../src/components/HandwritingCanvas';
import SkiaGate from '../../src/components/SkiaGate';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { api, HistoricalDocument } from '../../src/lib/api';
import { storage } from '../../src/lib/storage';
import { haptics } from '../../src/lib/haptics';
import { manuscriptSource } from '../../src/lib/manuscript-assets';

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');

type Phase = 'observe' | 'read' | 'transcribe' | 'compare' | 'complete';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1702753389906-4c87b7c17988';

export default function ArchiveDocScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<HistoricalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('observe');
  const [zoomOpen, setZoomOpen] = useState(false);
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

  const goRead = () => {
    haptics.transition();
    setPhase('read');
  };
  const goTranscribe = () => {
    haptics.transition();
    startedRef.current = Date.now();
    setPhase('transcribe');
  };
  const goCompare = () => {
    if (strokes === 0) return;
    haptics.transition();
    setPhase('compare');
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

  // Prefer a locally-bundled manuscript when the doc has an asset_key; fall
  // back to the remote image_url, then to a themed fallback URL.
  const imgSource =
    manuscriptSource(doc.asset_key, doc.image_url) ?? { uri: FALLBACK_IMG };

  // Some manuscripts are presented as handwriting-deciphering exercises. When
  // `transcription_status` is 'study', the app displays the "Study the Hand"
  // phase instead of a typed transcription — the user must decode the page
  // themselves.
  const isStudyMode = doc.transcription_status === 'study';

  return (
    <PaperBackground variant="parchment">
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              haptics.tap();
              router.back();
            }}
            style={styles.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="archive-back"
          >
            <ChevronLeft size={22} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <View style={styles.headCenter}>
            <Text style={styles.eyebrow}>{doc.era} · {doc.location || 'Manuscript Room'}</Text>
            <Text style={styles.phaseLabel}>
              {phase === 'observe'
                ? '· I · Observe'
                : phase === 'read'
                ? (isStudyMode ? '· II · Study the Hand' : '· II · Read')
                : phase === 'transcribe'
                ? '· III · Transcribe'
                : phase === 'compare'
                ? '· IV · Compare'
                : '· Done'}
            </Text>
          </View>
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

        {/* PHASE 1 — OBSERVE */}
        {phase === 'observe' && (
          <ScrollView contentContainerStyle={styles.observeScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{doc.title}</Text>
            {doc.source ? <Text style={styles.source}>{doc.source}</Text> : null}

            <Text style={styles.observeIntro}>
              Before reading, study the original. Notice the slant. The spacing. Where the writer paused, where the ink pooled, where the hand grew tired.
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                haptics.tap();
                setZoomOpen(true);
              }}
              style={styles.facsimile}
              testID="facsimile-image"
            >
              <Image source={imgSource} style={styles.facsimileImg} contentFit="cover" />
              <View style={styles.zoomBadge}>
                <Maximize2 size={14} color={colors.bg.paper} strokeWidth={1.5} />
                <Text style={styles.zoomBadgeText}>Tap to study</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.imageDescription}>{doc.image_description}</Text>

            {doc.archival_note ? (
              <View style={styles.archivalNote}>
                <Text style={styles.archivalEyebrow}>Archivist's note</Text>
                <Text style={styles.archivalText}>{doc.archival_note}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.beginBtn}
              activeOpacity={0.85}
              onPress={goRead}
              testID="goto-read"
            >
              <Text style={styles.beginText}>
                {isStudyMode ? 'Study the hand' : 'Read the transcription'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* PHASE 2 — READ (or STUDY THE HAND) */}
        {phase === 'read' && (
          <ScrollView contentContainerStyle={styles.readScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{doc.title}</Text>
            {doc.source ? <Text style={styles.source}>{doc.source}</Text> : null}

            {/* Mini-facsimile (smaller, still present) */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => {
                haptics.tap();
                setZoomOpen(true);
              }}
              style={styles.miniFacsimile}
            >
              <Image source={imgSource} style={styles.miniFacsimileImg} contentFit="cover" />
              <LinearGradient
                colors={['rgba(15,13,10,0.0)', 'rgba(15,13,10,0.45)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.miniLabel}>The original</Text>
            </TouchableOpacity>

            {/* Optional secondary page — e.g. envelope, second sheet */}
            {doc.asset_key_secondary ? (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => {
                  haptics.tap();
                  setZoomOpen(true);
                }}
                style={[styles.miniFacsimile, { marginTop: spacing.md }]}
              >
                <Image
                  source={manuscriptSource(doc.asset_key_secondary, null) ?? imgSource}
                  style={styles.miniFacsimileImg}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={['rgba(15,13,10,0.0)', 'rgba(15,13,10,0.45)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.miniLabel}>Second page</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.divider} />

            {isStudyMode ? (
              <>
                <Text style={styles.transcriptionEyebrow}>Transcribe it yourself</Text>
                <Text style={[styles.transcriptionBody, styles.studyBody]}>
                  This manuscript is presented without a typed transcription. Look at the original carefully. What do you think it says?{'\n\n'}
                  Zoom in. Follow the line of the pen. Read aloud if it helps.{'\n\n'}
                  When you're ready, transcribe the passage in your own hand on the next page.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.transcriptionEyebrow}>Transcription</Text>
                <Text style={styles.transcriptionBody}>{doc.transcription}</Text>
              </>
            )}

            <View style={styles.divider} />
            <Text style={styles.contextEyebrow}>Context</Text>
            <Text style={styles.contextBody}>{doc.context}</Text>

            {doc.archival_credit ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.contextEyebrow}>Archival credit</Text>
                <Text style={styles.creditBody}>{doc.archival_credit}</Text>
              </>
            ) : null}

            <TouchableOpacity
              style={styles.beginBtn}
              activeOpacity={0.85}
              onPress={goTranscribe}
              testID="begin-transcribe"
            >
              <Text style={styles.beginText}>Transcribe by hand</Text>
            </TouchableOpacity>

            <Text style={styles.tip}>
              Write it slowly. Match the rhythm if you can. The hand reads what the eye cannot.
            </Text>
          </ScrollView>
        )}

        {/* PHASE 3 + 4 — TRANSCRIBE & COMPARE share canvas mount */}
        {(phase === 'transcribe' || phase === 'compare') && (
          <View style={styles.writeRoot}>
            {/* Reference row — small in transcribe, taller in compare */}
            {phase === 'transcribe' ? (
              <View style={styles.refRow}>
                <TouchableOpacity
                  style={styles.refImageWrap}
                  activeOpacity={0.9}
                  onPress={() => {
                    haptics.tap();
                    setZoomOpen(true);
                  }}
                >
                  <Image source={imgSource} style={styles.refImage} contentFit="cover" />
                </TouchableOpacity>
                <View style={styles.refTextWrap}>
                  <Text style={styles.refPassage} numberOfLines={4}>{doc.transcription}</Text>
                  <Text style={styles.refMeta}>{doc.era} · {doc.location || ''}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.compareTopWrap}>
                <Text style={styles.compareEyebrow}>The Original</Text>
                <TouchableOpacity
                  style={styles.compareImageWrap}
                  activeOpacity={0.9}
                  onPress={() => {
                    haptics.tap();
                    setZoomOpen(true);
                  }}
                >
                  <Image source={imgSource} style={styles.compareImage} contentFit="cover" />
                  <View style={styles.zoomBadgeSmall}>
                    <Maximize2 size={12} color={colors.bg.paper} strokeWidth={1.5} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.compareCaption}>{doc.title} · {doc.era}</Text>
              </View>
            )}

            {phase === 'compare' && (
              <Text style={styles.compareEyebrowMid}>Your Hand</Text>
            )}

            <View style={[styles.canvasCard, phase === 'compare' && styles.canvasCardCompare]}>
              <SkiaGate>
                <HandwritingCanvas
                  clearSignal={clearKey}
                  onChange={setStrokes}
                  showSlantGuides
                  showStrokeNumbers={false}
                  allowReplay={false}
                  guideHeight="ascender"
                  strokeWidth={4}
                  frozen={phase === 'compare'}
                />
              </SkiaGate>
            </View>

            {phase === 'transcribe' ? (
              <View style={styles.writeFooter}>
                <Text style={styles.strokesText}>
                  {strokes === 0 ? 'Begin when ready.' : `${strokes} stroke${strokes === 1 ? '' : 's'}`}
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, strokes === 0 && styles.primaryBtnDisabled]}
                  disabled={strokes === 0}
                  onPress={goCompare}
                  activeOpacity={0.85}
                  testID="goto-compare"
                >
                  <Text style={styles.primaryText}>Compare</Text>
                  <ArrowRight size={16} color={colors.accent.ink} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.writeFooter}>
                <TouchableOpacity
                  style={styles.ghostFooterBtn}
                  onPress={() => {
                    haptics.tap();
                    setPhase('transcribe');
                  }}
                >
                  <Text style={styles.ghostFooterText}>Write again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
                  disabled={saving}
                  onPress={save}
                  activeOpacity={0.85}
                  testID="complete-archive"
                >
                  {saving ? (
                    <ActivityIndicator color={colors.accent.ink} />
                  ) : (
                    <>
                      <Text style={styles.primaryText}>Keep</Text>
                      <Check size={16} color={colors.accent.ink} strokeWidth={1.5} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* PHASE 4 — COMPLETE */}
        {phase === 'complete' && (
          <ScrollView
            contentContainerStyle={styles.completeRoot}
            testID="archive-complete"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.completeEyebrow}>The hand has rested</Text>
            <Text style={styles.completeTitle}>It is kept.</Text>
            <View style={styles.completeImageWrap}>
              <Image source={imgSource} style={styles.completeImage} contentFit="cover" />
            </View>
            <View style={styles.divider} />
            <Text style={styles.completeQuote}>{doc.transcription}</Text>
            <Text style={styles.completeMeta}>
              {doc.title} · {doc.era}
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: spacing.xxl, alignSelf: 'center' }]}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryText}>Return to the room</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ZOOM MODAL */}
      <ZoomModal
        visible={zoomOpen}
        source={imgSource}
        title={doc.title}
        onClose={() => {
          haptics.tap();
          setZoomOpen(false);
        }}
      />
    </PaperBackground>
  );
}

// ---------- ZoomModal ----------
function ZoomModal({
  visible,
  source,
  title,
  onClose,
}: {
  visible: boolean;
  source: import('react-native').ImageSourcePropType;
  title: string;
  onClose: () => void;
}) {
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const baseScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      baseScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(4, baseScale.value * e.scale));
    });
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        tx.value = e.translationX;
        ty.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1.05) {
        scale.value = withSpring(1);
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1, { duration: 220 });
        tx.value = withTiming(0, { duration: 220 });
        ty.value = withTiming(0, { duration: 220 });
      } else {
        scale.value = withTiming(2.2, { duration: 220 });
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  // Reset on close
  useEffect(() => {
    if (!visible) {
      scale.value = 1;
      tx.value = 0;
      ty.value = 0;
    }
  }, [visible, scale, tx, ty]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={zoomStyles.root}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={composed}>
            <Animated.View style={[zoomStyles.imageWrap, animatedStyle]}>
              <Image source={source} style={zoomStyles.image} contentFit="contain" />
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>

        <SafeAreaView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View style={zoomStyles.topRow} pointerEvents="box-none">
            <Text style={zoomStyles.title} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={zoomStyles.closeBtn} testID="zoom-close">
              <X size={20} color={colors.bg.paper} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <Text style={zoomStyles.hint}>Pinch to zoom · double-tap · drag to pan</Text>
        </SafeAreaView>
      </View>
    </Modal>
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
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headCenter: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  phaseLabel: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Observe
  observeScroll: {
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
  source: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  observeIntro: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  facsimile: {
    aspectRatio: 4 / 3,
    width: '100%',
    backgroundColor: colors.bg.deep,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    ...shadow.deep,
  },
  facsimileImg: { ...StyleSheet.absoluteFillObject },
  zoomBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15,13,10,0.62)',
  },
  zoomBadgeText: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.bg.paper,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  imageDescription: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  archivalNote: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.gold,
  },
  archivalEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  archivalText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.text.primary,
  },

  // Read
  readScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  miniFacsimile: {
    height: 140,
    width: '100%',
    backgroundColor: colors.bg.deep,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  miniFacsimileImg: { ...StyleSheet.absoluteFillObject },
  miniLabel: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.md,
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.bg.paper,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.lg,
    width: 60,
  },
  transcriptionEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  transcriptionBody: {
    fontFamily: fonts.body,
    fontSize: 22,
    lineHeight: 36,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  contextEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  contextBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  studyBody: {
    fontStyle: 'italic',
  },
  creditBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 20,
    color: colors.text.muted,
    letterSpacing: 0.2,
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
    fontSize: 15,
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

  // Transcribe
  writeRoot: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  refRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  refImageWrap: {
    width: 90,
    height: 70,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bg.deep,
  },
  refImage: { ...StyleSheet.absoluteFillObject },
  refTextWrap: { flex: 1 },
  refPassage: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
  },
  refMeta: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  canvasCard: {
    flex: 1,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    marginVertical: spacing.md,
    ...shadow.soft,
  },
  writeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
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
    minWidth: 160,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accent.ink,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  // Compare mode
  compareTopWrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  compareEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  compareEyebrowMid: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: 4,
    textAlign: 'center',
  },
  compareImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bg.deep,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  compareImage: { ...StyleSheet.absoluteFillObject },
  zoomBadgeSmall: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,13,10,0.62)',
  },
  compareCaption: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  canvasCardCompare: {
    flex: 0,
    height: 180,
    marginTop: 4,
  },
  ghostFooterBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  ghostFooterText: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },

  // Complete
  completeRoot: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
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
  completeImageWrap: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.xl,
    backgroundColor: colors.bg.deep,
  },
  completeImage: { ...StyleSheet.absoluteFillObject },
  completeQuote: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 28,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  completeMeta: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
});

const zoomStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(8, 7, 5, 0.96)',
  },
  imageWrap: {
    flex: 1,
    width: WIN_W,
    height: WIN_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.bg.paper,
    paddingRight: spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,241,232,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,241,232,0.20)',
  },
  hint: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.accent,
    fontSize: 11,
    color: 'rgba(245,241,232,0.55)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
