import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import PaperBackground from '../src/components/PaperBackground';
import InkButton from '../src/components/InkButton';
import { colors, fonts, spacing, radius, shadow } from '../src/theme';
import { api } from '../src/lib/api';
import { storage } from '../src/lib/storage';
import { haptics } from '../src/lib/haptics';

const HERO = 'https://images.unsplash.com/photo-1774891937561-da8dd95bd9c9';

const INTERESTS = [
  'Letters & Correspondence',
  'Poetry',
  'Philosophy',
  'Journaling',
  'Heirloom Recipes',
  'Slow Travel Notes',
];

export default function PenpalScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [picks, setPicks] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePick = (i: string) => {
    haptics.tap();
    setPicks((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };

  const submit = async () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError('A correct email, please.');
      return;
    }
    setSubmitting(true);
    try {
      const userName = name.trim() || (await storage.getDisplayName()) || undefined;
      await api.penpalSignup({
        email: email.trim(),
        display_name: userName ?? undefined,
        interests: picks,
        note: note.trim() || undefined,
      });
      haptics.complete();
      setSubmitted(true);
    } catch (e) {
      console.warn('penpal signup failed', e);
      setError('Could not save. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PaperBackground>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                router.back();
              }}
              style={styles.iconBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={22} color={colors.text.primary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <View style={styles.thankRoot} testID="penpal-thank-you">
            <View style={styles.checkCircle}>
              <Check size={28} color={colors.accent.gold} strokeWidth={1.5} />
            </View>
            <Text style={styles.thankEyebrow}>You are kept</Text>
            <Text style={styles.thankTitle}>Saved to the list.</Text>
            <Text style={styles.thankBody}>
              When the room is ready, we will write to you. Until then — keep tending to small things.
            </Text>
            <View style={{ height: spacing.xl }} />
            <InkButton label="Return" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </PaperBackground>
    );
  }

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                router.back();
              }}
              style={styles.iconBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              testID="penpal-back"
            >
              <ChevronLeft size={22} color={colors.text.primary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} testID="penpal-screen">
            <View style={styles.hero}>
              <Image source={{ uri: HERO }} style={styles.heroImg} contentFit="cover" />
              <LinearGradient
                colors={['rgba(15,13,10,0.10)', 'rgba(15,13,10,0.85)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>The Analog Club</Text>
                <Text style={styles.heroTitle}>Penpal{'\n'}waitlist.</Text>
              </View>
            </View>

            <Text style={styles.lede}>
              A small invitation: when our private letter-writing circle opens, we will write to you first. No notifications. No noise.
            </Text>

            <Text style={styles.label}>Your email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="quietreader@example.com"
              placeholderTextColor={colors.text.faint}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              testID="penpal-email"
            />

            <Text style={styles.label}>Your name (optional)</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="What shall we call you?"
              placeholderTextColor={colors.text.faint}
              style={styles.input}
              testID="penpal-name"
            />

            <Text style={styles.label}>What draws you here?</Text>
            <View style={styles.chipsWrap}>
              {INTERESTS.map((i) => {
                const active = picks.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => togglePick(i)}
                    activeOpacity={0.85}
                    testID={`penpal-interest-${i}`}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{i}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>A note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="A line about what you hope for..."
              placeholderTextColor={colors.text.faint}
              multiline
              style={[styles.input, styles.textarea]}
              testID="penpal-note"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <InkButton
              label="Add me to the waitlist"
              onPress={submit}
              loading={submitting}
              fullWidth
              style={{ marginTop: spacing.lg }}
              testID="penpal-submit"
            />

            <Text style={styles.fineprint}>
              We will not write often. We will not write loudly. Only when there is something worth saying.
            </Text>

            <View style={{ height: spacing.xxl }} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  hero: {
    height: 200,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.soft,
  },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroCopy: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
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
    fontSize: 32,
    lineHeight: 38,
    color: colors.bg.paper,
    letterSpacing: -0.4,
  },
  lede: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 25,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  label: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.text.primary,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.paper,
  },
  chipActive: {
    borderColor: colors.accent.gold,
    backgroundColor: 'rgba(201,169,97,0.12)',
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.text.primary,
    fontFamily: fonts.bodyBold,
  },
  error: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    color: colors.accent.burgundy,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  fineprint: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  thankRoot: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  thankEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.gold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  thankTitle: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.text.primary,
    marginTop: spacing.sm,
    letterSpacing: -0.5,
  },
  thankBody: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
