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
import { ArrowRight } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { api, HistoricalDocument } from '../../src/lib/api';
import { haptics } from '../../src/lib/haptics';

const HERO_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Letter_to_Cassandra_Austen%2C_by_Jane_Austen%2C_Bath%2C_12_May_1801_-_Morgan_Library_%26_Museum_-_New_York_City_-_DSC06587.jpg/1280px-Letter_to_Cassandra_Austen%2C_by_Jane_Austen%2C_Bath%2C_12_May_1801_-_Morgan_Library_%26_Museum_-_New_York_City_-_DSC06587.jpg';
const FALLBACK_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Emily_Dickinson_%22Wild_nights%22_manuscript.jpg/800px-Emily_Dickinson_%22Wild_nights%22_manuscript.jpg';

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
          {/* Manuscript Room hero */}
          <View style={styles.heroWrap}>
            <Image source={{ uri: HERO_IMG }} style={styles.heroImg} contentFit="cover" />
            <LinearGradient
              colors={['rgba(15,13,10,0.10)', 'rgba(15,13,10,0.90)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>The Manuscript Room</Text>
              <Text style={styles.heroTitle}>Letters and{'\n'}old hands.</Text>
              <Text style={styles.heroSub}>
                A small archive of authentic handwriting, drawn from museum and library collections. Observe the original. Study its details. Read the transcription. Transcribe by hand. Compare.
              </Text>
            </View>
          </View>

          {/* Section preface */}
          <View style={styles.preface}>
            <Text style={styles.prefaceEyebrow}>{docs.length || ''} entries · curated quarterly</Text>
            <Text style={styles.prefaceTitle}>The collection.</Text>
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
                  activeOpacity={0.88}
                  onPress={() => {
                    haptics.tap();
                    router.push(`/archive/${d.id}`);
                  }}
                  testID={`archive-doc-${d.id}`}
                >
                  {/* Facsimile preview — actual image of handwriting */}
                  <View style={styles.facsimileWrap}>
                    <Image
                      source={{ uri: d.image_url || FALLBACK_IMG }}
                      style={styles.facsimileImg}
                      contentFit="cover"
                      transition={400}
                    />
                    <LinearGradient
                      colors={['rgba(15,13,10,0.0)', 'rgba(15,13,10,0.42)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.facsimileOverlay}>
                      <Text style={styles.facsimileEra}>{d.era}</Text>
                      {d.location ? (
                        <Text style={styles.facsimileLocation}>{d.location}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.docMeta}>
                    <Text style={styles.docTitle}>{d.title}</Text>
                    {d.source ? (
                      <Text style={styles.docSource}>{d.source}</Text>
                    ) : null}
                    <Text style={styles.docExcerpt} numberOfLines={2}>
                      {d.transcription}
                    </Text>
                    <View style={styles.docFooter}>
                      <Text style={styles.docCta}>Enter the room</Text>
                      <ArrowRight size={14} color={colors.accent.gold} strokeWidth={1.5} />
                    </View>
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
    height: 260,
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
    lineHeight: 22,
  },
  preface: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  prefaceEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.accent.gold,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  prefaceTitle: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  loadingBox: { paddingVertical: spacing.xxl, alignItems: 'center' },
  list: {
    paddingHorizontal: spacing.lg,
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
  facsimileWrap: {
    height: 200,
    width: '100%',
    backgroundColor: colors.bg.deep,
  },
  facsimileImg: { ...StyleSheet.absoluteFillObject },
  facsimileOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  facsimileEra: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.goldFaint,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  facsimileLocation: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: 'rgba(245,241,232,0.72)',
  },
  docMeta: {
    padding: spacing.lg,
  },
  docTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  docSource: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  docExcerpt: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  docFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  docCta: {
    fontFamily: fonts.accent,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.accent.gold,
  },
});
