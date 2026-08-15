import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../src/theme';
import InkButton from '../src/components/InkButton';
import { storage } from '../src/lib/storage';
import { haptics } from '../src/lib/haptics';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    eyebrow: 'CODEXIA & INK',
    title: 'A sanctuary for\ndeep thought.',
    body:
      'In a world of endless feeds, this is a quieter room — one where the hand remembers what the mind forgets, and attention finds its way home.',
    image: 'https://images.unsplash.com/photo-1753756510738-33a176dd3b0a',
  },
  {
    eyebrow: 'THE PRACTICE',
    title: 'The hand teaches\nthe mind to settle.',
    body:
      'Cursive handwriting restores focus, memory, and presence. Each unhurried stroke rewires attention away from noise and toward what is meaningful.',
    image: 'https://images.unsplash.com/photo-1774891937561-da8dd95bd9c9',
  },
  {
    eyebrow: 'BEGIN',
    title: 'Slowly.\nBeautifully.\nWith intention.',
    body:
      'Trace philosophy. Copy poetry. Decode old letters. Keep a private record of your becoming. There is no race here — only return.',
    image: 'https://images.unsplash.com/photo-1665059691261-daa5bacdf826',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(20)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fade.setValue(0);
    lift.setValue(24);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(lift, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, [page, fade, lift]);

  const next = async () => {
    haptics.transition();
    if (page < SLIDES.length - 1) {
      const target = page + 1;
      setPage(target);
      scrollRef.current?.scrollTo({ x: target * W, animated: true });
    } else {
      await storage.setOnboarded();
      await storage.getOrCreateUserId();
      haptics.complete();
      router.replace('/(tabs)/studio');
    }
  };

  const skip = async () => {
    haptics.tap();
    await storage.setOnboarded();
    await storage.getOrCreateUserId();
    router.replace('/(tabs)/studio');
  };

  const onScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / W);
    if (idx !== page) setPage(idx);
  };

  return (
    <View style={styles.root} testID="onboarding-screen">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={styles.slide}>
            <Image
              source={{ uri: s.image }}
              style={styles.bgImage}
              contentFit="cover"
              transition={500}
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={[
                'rgba(20, 18, 14, 0.30)',
                'rgba(20, 18, 14, 0.65)',
                'rgba(15, 13, 10, 0.92)',
              ]}
              style={StyleSheet.absoluteFill}
              locations={[0, 0.55, 1]}
            />
          </View>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topRow}>
          <Text style={styles.brand}>Codexia & Ink</Text>
          <TouchableOpacity onPress={skip} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} testID="onboarding-skip">
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.copy, { opacity: fade, transform: [{ translateY: lift }] }]}>
          <Text style={styles.eyebrow}>{SLIDES[page].eyebrow}</Text>
          <Text style={styles.title}>{SLIDES[page].title}</Text>
          <Text style={styles.body}>{SLIDES[page].body}</Text>
        </Animated.View>

        <View style={styles.bottom}>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === page && styles.dotActive]}
              />
            ))}
          </View>
          <InkButton
            label={page === SLIDES.length - 1 ? 'Enter the sanctuary' : 'Continue'}
            onPress={next}
            fullWidth
            testID="onboarding-continue"
          />
          {page === SLIDES.length - 1 ? (
            <Text style={styles.guestNote}>No account required. Begin in stillness.</Text>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0D0A',
  },
  slide: {
    width: W,
    height: H,
  },
  bgImage: {
    width: W,
    height: H,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.lg,
  },
  brand: {
    fontFamily: fonts.headingItalic,
    fontStyle: 'italic',
    fontSize: 26,
    color: colors.bg.paper,
    letterSpacing: 0.5,
  },
  skip: {
    fontFamily: fonts.accent,
    fontSize: 12,
    color: 'rgba(245,241,232,0.7)',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  copy: {
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 12,
    color: colors.accent.goldFaint,
    letterSpacing: 3.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 44,
    lineHeight: 52,
    color: colors.bg.paper,
    letterSpacing: -0.6,
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: fonts.body,
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 28,
    color: 'rgba(245,241,232,0.82)',
    letterSpacing: 0.2,
    maxWidth: 380,
  },
  bottom: {
    paddingBottom: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(245,241,232,0.25)',
    marginHorizontal: 5,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.accent.gold,
  },
  guestNote: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: 'rgba(245,241,232,0.55)',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
