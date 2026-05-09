import React, { useState, useEffect, useMemo } from 'react';
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
import { Bookmark } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { api, ContentPiece, friendlyCategory } from '../../src/lib/api';
import { haptics } from '../../src/lib/haptics';

const CATEGORY_THUMBS: Record<string, string> = {
  philosophy: 'https://images.unsplash.com/photo-1665059691261-daa5bacdf826',
  poetry: 'https://images.unsplash.com/photo-1774891937561-da8dd95bd9c9',
  letters: 'https://images.unsplash.com/photo-1774891937561-da8dd95bd9c9',
  affirmations: 'https://images.unsplash.com/photo-1702753389906-4c87b7c17988',
  mindfulness: 'https://images.unsplash.com/photo-1702753389906-4c87b7c17988',
  recipes: 'https://images.unsplash.com/photo-1702753390018-76c147a55c3b',
  creativity: 'https://images.unsplash.com/photo-1753756510738-33a176dd3b0a',
  gratitude: 'https://images.unsplash.com/photo-1702753389906-4c87b7c17988',
};

const CATEGORY_DESC: Record<string, string> = {
  philosophy: 'The thinkers who taught us to look inward.',
  poetry: 'Lyrics for the unhurried hour.',
  letters: 'Voices from another century.',
  affirmations: 'Gentle rewiring, one line at a time.',
  mindfulness: 'Prompts for noticing what is here.',
  recipes: 'Heirloom kitchens, written by hand.',
  creativity: 'Doors back into the imagination.',
  gratitude: 'Small ledgers of small gifts.',
};

export default function CollectionsScreen() {
  const router = useRouter();
  const [active, setActive] = useState<string>('all');
  const [items, setItems] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .listContent()
      .then((data) => {
        if (alive) setItems(data);
      })
      .catch((e) => console.warn('content load failed', e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.category));
    return ['all', ...Array.from(set).sort()];
  }, [items]);

  const filtered = active === 'all' ? items : items.filter((i) => i.category === active);

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} testID="collections-screen">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>The Library</Text>
            <Text style={styles.title}>Themed{'\n'}collections.</Text>
            <Text style={styles.lede}>
              Curated passages chosen for their stillness, intelligence, and beauty. Read once. Then write, slowly.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active === cat && styles.chipActive]}
                onPress={() => {
                  haptics.tap();
                  setActive(cat);
                }}
                testID={`category-${cat}`}
              >
                <Text style={[styles.chipText, active === cat && styles.chipTextActive]}>
                  {cat === 'all' ? 'All' : friendlyCategory(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.accent.gold} />
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((piece) => (
                <CollectionCard
                  key={piece.id}
                  piece={piece}
                  onPress={() => {
                    haptics.tap();
                    router.push(`/session/${piece.id}`);
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <Text style={styles.empty}>No pieces in this collection yet.</Text>
              )}
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

function CollectionCard({ piece, onPress }: { piece: ContentPiece; onPress: () => void }) {
  const thumb = CATEGORY_THUMBS[piece.category] || CATEGORY_THUMBS.philosophy;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={onPress}
      testID={`content-${piece.id}`}
    >
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: thumb }} style={styles.cardImage} contentFit="cover" />
        <LinearGradient
          colors={['rgba(15,13,10,0.0)', 'rgba(15,13,10,0.55)']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.cardImageEyebrow}>{friendlyCategory(piece.category)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {piece.title}
        </Text>
        {piece.author ? (
          <Text style={styles.cardMeta}>
            {piece.author}
            {piece.era ? `  ·  ${piece.era}` : ''}
          </Text>
        ) : null}
        <Text style={styles.cardBodyText} numberOfLines={3}>
          {piece.body}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMinutes}>
            {piece.estimated_minutes} min · {piece.word_count} words
          </Text>
          <Bookmark size={16} color={colors.text.muted} strokeWidth={1.5} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.lg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.gold,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    lineHeight: 42,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  lede: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 26,
    color: colors.text.secondary,
    marginTop: spacing.md,
    maxWidth: 360,
  },
  chipsRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.accent.gold,
    borderColor: colors.accent.gold,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text.secondary,
    letterSpacing: 0.4,
  },
  chipTextActive: {
    color: colors.accent.ink,
    fontFamily: fonts.bodyBold,
  },
  loadingBox: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
  cardImageWrap: {
    height: 140,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageEyebrow: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.goldFaint,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  cardMeta: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  cardBodyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cardMinutes: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  empty: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
