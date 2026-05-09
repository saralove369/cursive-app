import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { ALL_LETTERS, PRACTICE_WORDS } from '../../src/data/cursive-letters';
import { storage } from '../../src/lib/storage';
import { haptics } from '../../src/lib/haptics';

const { width: W } = Dimensions.get('window');

const HERO_IMG = 'https://images.unsplash.com/photo-1753756510738-33a176dd3b0a';

const greetings = [
  'Welcome back.',
  'Quietly returned.',
  'A pause worth keeping.',
  'Your hand remembers.',
];

const subtitles = [
  'A few minutes of attention is enough.',
  'Begin where you stand.',
  'There is no race here.',
  'The page is patient.',
];

export default function StudioScreen() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [filter, setFilter] = useState<'lower' | 'upper'>('lower');
  const [greeting] = useState(() => ({
    head: greetings[Math.floor(Math.random() * greetings.length)],
    sub: subtitles[Math.floor(Math.random() * subtitles.length)],
  }));

  useEffect(() => {
    storage.getDisplayName().then(setName);
  }, []);

  const letters = ALL_LETTERS.filter((l) => l.case === filter);

  const goLetter = (char: string) => {
    haptics.tap();
    router.push(`/practice/${encodeURIComponent(char)}`);
  };

  const goWord = (word: string) => {
    haptics.tap();
    router.push(`/practice/${encodeURIComponent(word)}`);
  };

  const goFreeWrite = () => {
    haptics.tap();
    router.push('/practice/freewrite');
  };

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="studio-screen"
        >
          {/* Hero card */}
          <View style={styles.hero}>
            <Image source={{ uri: HERO_IMG }} style={styles.heroImg} contentFit="cover" />
            <LinearGradient
              colors={['rgba(20,18,14,0.10)', 'rgba(20,18,14,0.55)', 'rgba(15,13,10,0.92)']}
              style={StyleSheet.absoluteFill}
              locations={[0, 0.55, 1]}
            />
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>The Writing Studio</Text>
              <Text style={styles.heroTitle}>
                {name ? `${greeting.head}\n${name}.` : greeting.head}
              </Text>
              <Text style={styles.heroSub}>{greeting.sub}</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Begin</Text>
            <Text style={styles.sectionTitle}>A short practice</Text>
            <Text style={styles.sectionLede}>
              Choose a letter to trace, a word to repeat, or open a blank page.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bigCard}
            activeOpacity={0.9}
            onPress={goFreeWrite}
            testID="free-write-card"
          >
            <View style={styles.bigCardInner}>
              <Text style={styles.bigCardEyebrow}>FREE PAGE</Text>
              <Text style={styles.bigCardTitle}>An open page,{'\n'}for whatever arrives.</Text>
              <View style={styles.bigCardArrow}>
                <ArrowRight size={20} color={colors.accent.gold} strokeWidth={1.5} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Letter grid */}
          <View style={[styles.section, { marginTop: spacing.xl }]}>
            <Text style={styles.sectionEyebrow}>The Alphabet</Text>
            <Text style={styles.sectionTitle}>Letters, slowly.</Text>
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, filter === 'lower' && styles.toggleBtnActive]}
              onPress={() => {
                haptics.tap();
                setFilter('lower');
              }}
              testID="toggle-lowercase"
            >
              <Text style={[styles.toggleLabel, filter === 'lower' && styles.toggleLabelActive]}>
                Lowercase
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, filter === 'upper' && styles.toggleBtnActive]}
              onPress={() => {
                haptics.tap();
                setFilter('upper');
              }}
              testID="toggle-uppercase"
            >
              <Text style={[styles.toggleLabel, filter === 'upper' && styles.toggleLabelActive]}>
                Uppercase
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lettersGrid}>
            {letters.map((l) => (
              <TouchableOpacity
                key={l.char}
                style={styles.letterTile}
                activeOpacity={0.7}
                onPress={() => goLetter(l.char)}
                testID={`letter-${l.char}`}
              >
                <Text style={styles.letterChar}>{l.char}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Word practice */}
          <View style={[styles.section, { marginTop: spacing.xl }]}>
            <Text style={styles.sectionEyebrow}>Words</Text>
            <Text style={styles.sectionTitle}>Quiet words to repeat.</Text>
          </View>
          <View style={styles.wordsWrap}>
            {PRACTICE_WORDS.map((w) => (
              <TouchableOpacity
                key={w}
                style={styles.wordPill}
                activeOpacity={0.8}
                onPress={() => goWord(w)}
                testID={`word-${w}`}
              >
                <Text style={styles.wordText}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

const TILE = (W - spacing.lg * 2 - spacing.sm * 5) / 6;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingBottom: spacing.lg,
  },
  hero: {
    height: 280,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.soft,
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroCopy: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  heroEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.goldFaint,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 38,
    color: colors.bg.paper,
    letterSpacing: -0.4,
  },
  heroSub: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 16,
    color: 'rgba(245,241,232,0.78)',
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.gold,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  sectionLede: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  bigCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    ...shadow.paper,
  },
  bigCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bigCardEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    letterSpacing: 2.4,
    color: colors.accent.gold,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  bigCardTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 30,
    color: colors.text.primary,
    flex: 1,
    paddingRight: spacing.md,
    letterSpacing: -0.2,
  },
  bigCardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  toggleBtnActive: {
    borderBottomColor: colors.accent.gold,
    borderBottomWidth: 1.5,
  },
  toggleLabel: {
    fontFamily: fonts.accent,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  toggleLabelActive: {
    color: colors.text.primary,
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  letterTile: {
    width: TILE,
    height: TILE,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterChar: {
    fontFamily: fonts.headingItalic,
    fontStyle: 'italic',
    fontSize: 26,
    color: colors.text.primary,
  },
  wordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  wordPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    backgroundColor: 'rgba(201,169,97,0.08)',
  },
  wordText: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 17,
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
});
