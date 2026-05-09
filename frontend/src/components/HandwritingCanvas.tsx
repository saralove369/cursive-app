import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  SkPath,
  Group,
  Circle,
} from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Play } from 'lucide-react-native';
import { colors, fonts, spacing } from '../theme';
import { haptics } from '../lib/haptics';
import { LetterStroke, VIEWBOX, GUIDES, SLANT_DEGREES } from '../data/cursive-letters';

interface UserStroke {
  path: SkPath;
}

interface Props {
  /** Authentic Palmer Method strokes to render as faint guide. */
  guideStrokes?: LetterStroke[];
  /** Which guide structure to render. Determines visible rule lines. */
  guideHeight?: 'minimum' | 'ascender' | 'descender' | 'capital';
  /** Show numbered start markers (1, 2, ...) for each guide stroke. */
  showStrokeNumbers?: boolean;
  /** Show slant guides (faint diagonal lines at 12°). */
  showSlantGuides?: boolean;
  /** Show 'Watch' replay button to animate the strokes. */
  allowReplay?: boolean;
  /** Stroke change handler — receives count of completed user strokes. */
  onChange?: (count: number) => void;
  onStrokeStart?: () => void;
  onStrokeEnd?: () => void;
  /** Increment to clear the canvas. */
  clearSignal?: number;
  /** Ink color and width. */
  inkColor?: string;
  strokeWidth?: number;
}

/**
 * Authentic penmanship practice canvas — Palmer Method (1888).
 *
 * Renders the four-line ruled paper used in 19th-century copybooks
 * (ascender, headline, baseline, descender), faint slant guides at the
 * cursive 12° angle, ghost letter forms, numbered stroke markers, and
 * a "Watch" replay that animates each stroke in order.
 */
export default function HandwritingCanvas({
  guideStrokes = [],
  guideHeight = 'minimum',
  showStrokeNumbers = true,
  showSlantGuides = true,
  allowReplay = true,
  onChange,
  onStrokeStart,
  onStrokeEnd,
  clearSignal = 0,
  inkColor = colors.accent.ink,
  strokeWidth = 5,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [strokes, setStrokes] = useState<UserStroke[]>([]);
  const currentRef = useRef<SkPath | null>(null);
  const [, force] = useState(0);
  const [playFraction, setPlayFraction] = useState(1); // 1 = fully drawn, 0..1 = animating

  // Clear handling
  const lastClear = useRef(clearSignal);
  if (lastClear.current !== clearSignal) {
    lastClear.current = clearSignal;
    setStrokes([]);
    currentRef.current = null;
    onChange?.(0);
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  // ---------- Pan gesture (drawing) ----------
  const startStroke = useCallback(
    (x: number, y: number) => {
      const p = Skia.Path.Make();
      p.moveTo(x, y);
      currentRef.current = p;
      force((n) => n + 1);
      onStrokeStart?.();
      haptics.pen();
    },
    [onStrokeStart],
  );

  const extendStroke = useCallback((x: number, y: number) => {
    const p = currentRef.current;
    if (!p) return;
    const last = p.getLastPt();
    const mx = (last.x + x) / 2;
    const my = (last.y + y) / 2;
    p.quadTo(last.x, last.y, mx, my);
    force((n) => n + 1);
  }, []);

  const endStroke = useCallback(() => {
    if (currentRef.current) {
      setStrokes((prev) => {
        const next = [...prev, { path: currentRef.current as SkPath }];
        onChange?.(next.length);
        return next;
      });
      currentRef.current = null;
      onStrokeEnd?.();
    }
  }, [onChange, onStrokeEnd]);

  const pan = Gesture.Pan()
    .averageTouches(false)
    .minDistance(0)
    .maxPointers(1)
    .onBegin((e) => {
      runOnJS(startStroke)(e.x, e.y);
    })
    .onUpdate((e) => {
      runOnJS(extendStroke)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(endStroke)();
    })
    .onFinalize(() => {
      runOnJS(endStroke)();
    });

  // ---------- Compute layout for guide ----------
  // Vertical band of the guide depends on the height type.
  // We map the relevant vertical band to ~70% of the canvas height,
  // centered, with margin top/bottom.
  const band = (() => {
    switch (guideHeight) {
      case 'minimum':
        return { topY: GUIDES.headline, bottomY: GUIDES.baseline }; // x-height only
      case 'ascender':
        return { topY: GUIDES.ascenderTop, bottomY: GUIDES.baseline };
      case 'descender':
        return { topY: GUIDES.headline, bottomY: GUIDES.descenderBottom };
      case 'capital':
        return { topY: GUIDES.ascenderTop, bottomY: GUIDES.baseline };
      default:
        return { topY: GUIDES.headline, bottomY: GUIDES.baseline };
    }
  })();

  // We always render full 4-line paper (asc → desc) so the user sees the system,
  // but scale so the visible band is comfortable.
  const VB_TOP = GUIDES.ascenderTop;
  const VB_BOTTOM = GUIDES.descenderBottom;
  const VB_HEIGHT = VB_BOTTOM - VB_TOP; // 195
  const VB_WIDTH = VIEWBOX.width;

  const padX = 24;
  const padY = 24;
  const usableW = Math.max(1, size.w - padX * 2);
  const usableH = Math.max(1, size.h - padY * 2);
  const scale = Math.min(usableW / VB_WIDTH, usableH / VB_HEIGHT);
  const offsetX = (size.w - VB_WIDTH * scale) / 2;
  const offsetY = (size.h - VB_HEIGHT * scale) / 2;

  // Helper to convert viewBox-y (relative to ascenderTop) to canvas-y
  const toCanvasY = (vy: number) => offsetY + (vy - VB_TOP) * scale;
  const toCanvasX = (vx: number) => offsetX + vx * scale;

  // ---------- Build guide stroke skia paths ----------
  const slantRad = (SLANT_DEGREES * Math.PI) / 180;
  const skewMatrix = Skia.Matrix();
  // Slant: top points should appear to the right of bottom points.
  // We apply skew around the baseline so y=baseline stays put.
  // Compose: translate(-baselineX, -baselineY) → skew → translate(back)
  // For simplicity, apply skewX(-tan(slant)) which slants top-right:
  skewMatrix.skew(-Math.tan(slantRad), 0);

  const guideSkPaths: { path: SkPath; start: { x: number; y: number }; index: number }[] = [];
  guideStrokes.forEach((stroke, i) => {
    try {
      const p = Skia.Path.MakeFromSVGString(stroke.d);
      if (p) {
        guideSkPaths.push({ path: p, start: stroke.start, index: i });
      }
    } catch {
      /* skip invalid */
    }
  });

  // ---------- Replay animation ----------
  const playRequest = useRef<number | null>(null);
  const startReplay = () => {
    haptics.tap();
    setPlayFraction(0);
    const start = Date.now();
    const totalMs = 1800;
    const tick = () => {
      const elapsed = Date.now() - start;
      const f = Math.min(1, elapsed / totalMs);
      setPlayFraction(f);
      if (f < 1) {
        playRequest.current = requestAnimationFrame(tick);
      }
    };
    playRequest.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (playRequest.current) cancelAnimationFrame(playRequest.current);
    };
  }, []);

  // ---------- Build rule line paths ----------
  const ruleLinePaths: { y: number; kind: 'asc' | 'head' | 'base' | 'desc' }[] = [
    { y: GUIDES.ascenderTop, kind: 'asc' },
    { y: GUIDES.headline, kind: 'head' },
    { y: GUIDES.baseline, kind: 'base' },
    { y: GUIDES.descenderBottom, kind: 'desc' },
  ];

  // Slant guides: vertical lines drawn at slant, evenly spaced across viewBox
  const slantGuideLines: SkPath[] = [];
  if (showSlantGuides && size.w > 0) {
    const dx = Math.tan(slantRad) * VB_HEIGHT;
    for (let vx = 30; vx <= VB_WIDTH - 30; vx += 40) {
      const p = Skia.Path.Make();
      const xBottom = toCanvasX(vx);
      const xTop = toCanvasX(vx + dx);
      p.moveTo(xTop, toCanvasY(VB_TOP));
      p.lineTo(xBottom, toCanvasY(VB_BOTTOM));
      slantGuideLines.push(p);
    }
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.canvasWrap} onLayout={onLayout}>
        <GestureDetector gesture={pan}>
          <Canvas style={StyleSheet.absoluteFill}>
            {/* Slant guides (drawn first, very faint) */}
            {showSlantGuides &&
              slantGuideLines.map((p, i) => (
                <Path
                  key={`slant-${i}`}
                  path={p}
                  color={colors.border.light}
                  style="stroke"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}

            {/* 4-line rule paper */}
            {ruleLinePaths.map((rule, i) => {
              const y = toCanvasY(rule.y);
              const p = Skia.Path.Make();
              p.moveTo(offsetX, y);
              p.lineTo(offsetX + VB_WIDTH * scale, y);
              const isBase = rule.kind === 'base';
              const isHeadOrBase = rule.kind === 'head' || rule.kind === 'base';
              return (
                <Path
                  key={`rule-${i}`}
                  path={p}
                  color={isBase ? colors.border.strong : colors.border.default}
                  style="stroke"
                  strokeWidth={isBase ? 1.0 : isHeadOrBase ? 0.7 : 0.5}
                  opacity={isHeadOrBase ? 0.85 : 0.55}
                />
              );
            })}

            {/* Ghost letter strokes — slanted, scaled, faint gold */}
            {guideSkPaths.length > 0 && (
              <Group transform={[{ translateX: offsetX }, { translateY: -VB_TOP * scale + offsetY }, { scale }]}>
                {guideSkPaths.map(({ path, index }) => {
                  // Apply slant skew and animate via interval if replaying
                  return (
                    <Group key={`g-${index}`} matrix={skewMatrix}>
                      <Path
                        path={path}
                        color={colors.accent.gold}
                        style="stroke"
                        strokeWidth={6 / scale}
                        strokeJoin="round"
                        strokeCap="round"
                        opacity={playFraction === 1 ? 0.32 : 0.55}
                        start={0}
                        end={
                          // Stagger animation across strokes
                          guideSkPaths.length > 1
                            ? Math.max(
                                0,
                                Math.min(
                                  1,
                                  playFraction * guideSkPaths.length - index,
                                ),
                              )
                            : playFraction
                        }
                      />
                    </Group>
                  );
                })}
              </Group>
            )}

            {/* Numbered start markers */}
            {showStrokeNumbers &&
              guideSkPaths.map(({ start, index }) => {
                // Apply slant transform to start coordinate manually
                const startX = start.x - Math.tan(slantRad) * (start.y - GUIDES.baseline);
                const cx = toCanvasX(startX);
                const cy = toCanvasY(start.y);
                return (
                  <Group key={`marker-${index}`}>
                    <Circle cx={cx} cy={cy} r={11} color={colors.bg.paper} />
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={11}
                      color={colors.accent.gold}
                      style="stroke"
                      strokeWidth={1.5}
                    />
                  </Group>
                );
              })}

            {/* User strokes */}
            {strokes.map((s, i) => (
              <Group key={`st-${i}`}>
                <Path
                  path={s.path}
                  color={inkColor}
                  style="stroke"
                  strokeWidth={strokeWidth + 2}
                  strokeJoin="round"
                  strokeCap="round"
                  opacity={0.18}
                />
                <Path
                  path={s.path}
                  color={inkColor}
                  style="stroke"
                  strokeWidth={strokeWidth}
                  strokeJoin="round"
                  strokeCap="round"
                />
              </Group>
            ))}

            {/* Active stroke */}
            {currentRef.current && (
              <Group>
                <Path
                  path={currentRef.current}
                  color={inkColor}
                  style="stroke"
                  strokeWidth={strokeWidth + 2}
                  strokeJoin="round"
                  strokeCap="round"
                  opacity={0.18}
                />
                <Path
                  path={currentRef.current}
                  color={inkColor}
                  style="stroke"
                  strokeWidth={strokeWidth}
                  strokeJoin="round"
                  strokeCap="round"
                />
              </Group>
            )}
          </Canvas>
        </GestureDetector>

        {/* Numbered labels (overlaid as RN Text for legibility) */}
        {showStrokeNumbers &&
          guideSkPaths.map(({ start, index }) => {
            const startX = start.x - Math.tan(slantRad) * (start.y - GUIDES.baseline);
            const cx = toCanvasX(startX);
            const cy = toCanvasY(start.y);
            return (
              <View
                key={`num-${index}`}
                style={[styles.numLabel, { left: cx - 11, top: cy - 11 }]}
                pointerEvents="none"
              >
                <Text style={styles.numText}>{index + 1}</Text>
              </View>
            );
          })}

        {/* Rule line labels (small instructional captions) */}
        {size.w > 0 && (
          <>
            {(guideHeight === 'ascender' || guideHeight === 'capital') && (
              <Text
                style={[styles.ruleLabel, { top: toCanvasY(GUIDES.ascenderTop) - 18, left: 6 }]}
                pointerEvents="none"
              >
                ASCENDER
              </Text>
            )}
            <Text
              style={[styles.ruleLabel, { top: toCanvasY(GUIDES.headline) - 18, left: 6 }]}
              pointerEvents="none"
            >
              HEADLINE
            </Text>
            <Text
              style={[styles.ruleLabel, styles.ruleLabelStrong, { top: toCanvasY(GUIDES.baseline) - 18, left: 6 }]}
              pointerEvents="none"
            >
              BASELINE
            </Text>
            {guideHeight === 'descender' && (
              <Text
                style={[styles.ruleLabel, { top: toCanvasY(GUIDES.descenderBottom) - 18, left: 6 }]}
                pointerEvents="none"
              >
                DESCENDER
              </Text>
            )}
          </>
        )}

        {/* Replay button */}
        {allowReplay && guideSkPaths.length > 0 && (
          <TouchableOpacity
            style={styles.replayBtn}
            activeOpacity={0.85}
            onPress={startReplay}
            testID="canvas-replay"
          >
            <Play size={14} color={colors.accent.gold} strokeWidth={1.5} />
            <Text style={styles.replayText}>Watch</Text>
          </TouchableOpacity>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  canvasWrap: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  numLabel: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.gold,
    letterSpacing: 0.5,
  },
  ruleLabel: {
    position: 'absolute',
    fontFamily: fonts.accent,
    fontSize: 9,
    letterSpacing: 1.6,
    color: colors.text.faint,
    backgroundColor: 'transparent',
  },
  ruleLabelStrong: {
    color: colors.text.muted,
  },
  replayBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    backgroundColor: colors.bg.paper,
  },
  replayText: {
    fontFamily: fonts.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.accent.gold,
  },
});
