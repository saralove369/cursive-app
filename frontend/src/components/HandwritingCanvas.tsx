import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Path, Skia, SkPath, Group } from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { colors } from '../theme';
import { haptics } from '../lib/haptics';

interface Stroke {
  path: SkPath;
}

interface Props {
  /**
   * Optional ghost guide paths drawn under the user's strokes.
   * Each entry is an SVG path string. If `viewBox` is provided, the
   * paths are scaled from the viewBox to the canvas size.
   */
  guideStrokes?: string[];
  guideViewBox?: { width: number; height: number };
  /** Optional height (defaults to flex). */
  height?: number;
  onStrokeStart?: () => void;
  onStrokeEnd?: () => void;
  onChange?: (count: number) => void;
  /** Listen to clear via ref-style interface. */
  clearSignal?: number;
  /** Toggle baseline guide lines (writing rules). */
  showBaseline?: boolean;
  /** Color of the ink. */
  inkColor?: string;
  /** Base stroke width. */
  strokeWidth?: number;
}

/**
 * Premium tactile handwriting canvas powered by Skia.
 * - Smooth quadratic bezier interpolation for natural curves.
 * - Soft ink rendering with subtle shadow for paper feel.
 * - Optional faint cursive guide as a "ghost" stroke.
 */
export default function HandwritingCanvas({
  guideStrokes = [],
  guideViewBox,
  height,
  onStrokeStart,
  onStrokeEnd,
  onChange,
  clearSignal = 0,
  showBaseline = true,
  inkColor = colors.accent.ink,
  strokeWidth = 5,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentRef = useRef<SkPath | null>(null);
  const [, force] = useState(0);

  const lastClear = useRef(clearSignal);
  if (lastClear.current !== clearSignal) {
    lastClear.current = clearSignal;
    setStrokes([]);
    currentRef.current = null;
    onChange?.(0);
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setSize({ w: width, h });
  };

  const startStroke = useCallback(
    (x: number, y: number) => {
      const p = Skia.Path.Make();
      p.moveTo(x, y);
      currentRef.current = p;
      force((n) => n + 1);
      onStrokeStart?.();
      haptics.pen();
    },
    [onStrokeStart]
  );

  const extendStroke = useCallback((x: number, y: number) => {
    const p = currentRef.current;
    if (!p) return;
    // Smooth with quadratic bezier from last point
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

  // Compute scale for guide paths if viewBox provided
  const scaleX = guideViewBox && size.w > 0 ? size.w / guideViewBox.width : 1;
  const scaleY = guideViewBox && size.h > 0 ? size.h / guideViewBox.height : 1;
  const scale = Math.min(scaleX, scaleY) || 1;
  const offsetX = guideViewBox && size.w > 0 ? (size.w - guideViewBox.width * scale) / 2 : 0;
  const offsetY = guideViewBox && size.h > 0 ? (size.h - guideViewBox.height * scale) / 2 : 0;

  // Build guide skia paths
  const guideSkPaths: SkPath[] = guideStrokes
    .map((d) => {
      try {
        return Skia.Path.MakeFromSVGString(d);
      } catch {
        return null;
      }
    })
    .filter((p): p is SkPath => !!p);

  // Baseline rules (3 horizontal hairlines)
  const baselinePaths: SkPath[] = [];
  if (showBaseline && size.w > 0 && size.h > 0) {
    const rules = [size.h * 0.3, size.h * 0.55, size.h * 0.78];
    rules.forEach((y) => {
      const p = Skia.Path.Make();
      p.moveTo(20, y);
      p.lineTo(size.w - 20, y);
      baselinePaths.push(p);
    });
  }

  return (
    <GestureHandlerRootView style={[styles.root, height ? { height } : { flex: 1 }]}>
      <View style={styles.canvasWrap} onLayout={onLayout}>
        <GestureDetector gesture={pan}>
          <Canvas style={StyleSheet.absoluteFill}>
            {/* Baseline rules */}
            {baselinePaths.map((p, i) => (
              <Path
                key={`bl-${i}`}
                path={p}
                color={i === 1 ? colors.border.strong : colors.border.light}
                style="stroke"
                strokeWidth={i === 1 ? 0.6 : 0.5}
              />
            ))}

            {/* Ghost guide paths */}
            {guideViewBox && guideSkPaths.length > 0 && (
              <Group transform={[{ translateX: offsetX }, { translateY: offsetY }, { scale }]}>
                {guideSkPaths.map((p, i) => (
                  <Path
                    key={`g-${i}`}
                    path={p}
                    color={colors.accent.goldFaint}
                    style="stroke"
                    strokeWidth={6 / scale}
                    strokeJoin="round"
                    strokeCap="round"
                    opacity={0.7}
                  />
                ))}
              </Group>
            )}

            {/* Completed strokes — soft ink halo + main ink */}
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
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  canvasWrap: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
