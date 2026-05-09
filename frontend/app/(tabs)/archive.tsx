import React, { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaperBackground from '../../src/components/PaperBackground';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { api, HistoricalDocument } from '../../src/lib/api';
import { haptics } from '../../src/lib/haptics';

const ARCHIVE_THUMB = 'https://images.unsplash.com/photo-1702753390018-76c147a55c3b';
const ARCHIVE_PAPER = 'https://images.unsplash.com/photo-1702753389906-4c87b7c17988';

export default function ArchiveScreen() {
  const router = useRouter();
  const [docs, setDocs] = useState<HistoricalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .listArchive()
      .then((data) => {
        if (alive) setDocs(data);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} testID="archive-screen">
          <View style={styles.heroWrap}>
            <Image source={{ uri: ARCHIVE_THUMB }} style={styles.heroImg} contentFit="cover" />
            <LinearGradient
              colors={['rgba(15,13,10,0.10)', 'rgba(15,13,10,0.85)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Historical Archive</Text>
              <Text style={styles.heroTitle}>Letters and{'\n'}old hands.</Text>
              <Text style={styles.heroSub}>
                Read passages from another century. Then write them, slowly, in your own hand.
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.accent.gold} />
            </View>
          ) : (
            <View style={styles.list}>
              {docs.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.docCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    haptics.tap();
                    router.push(`/archive/${d.id}`);
                  }}
                  testID={`archive-doc-${d.id}`}
                >
                  <View style={styles.docImageWrap}>
                    <Image
                      source={{ uri: ARCHIVE_PAPER }}
                      style={styles.docImage}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={['rgba(245,241,232,0.05)', 'rgba(232,225,210,0.55)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.docTransScript} numberOfLines={3}>
                      {d.transcription}
                    </Text>
                  </View>
                  <View style={styles.docMeta}>
                    <Text style={styles.docEra}>{d.era}</Text>
                    <Text style={styles.docTitle}>{d.title}</Text>
                    <Text style={styles.docContext} numberOfLines={2}>
                      {d.context}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.lg },
  heroWrap: {
    height: 240,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.soft,
  },
  heroImg: { ...StyleSheet.absoluteFillObject },
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
    lineHeight: 36,
    color: colors.bg.paper,
    letterSpacing: -0.4,
  },
  heroSub: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 15,
    color: 'rgba(245,241,232,0.78)',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
  loadingBox: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  docCard: {
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow.paper,
  },
  docImageWrap: {
    height: 130,
    width: '100%',
    backgroundColor: colors.bg.deep,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  docImage: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  docTransScript: {
    fontFamily: fonts.headingItalic,
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 25,
    color: colors.accent.sepia,
    letterSpacing: 0.3,
  },
  docMeta: {
    padding: spacing.lg,
  },
  docEra: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  docTitle: {
    fontFamily: fonts.heading,
    fontSize: 21,
    lineHeight: 28,
    color: colors.text.primary,
  },
  docContext: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
});
