import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Mail, Heart, Info } from 'lucide-react-native';
import PaperBackground from '../../src/components/PaperBackground';
import InkButton from '../../src/components/InkButton';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { storage } from '../../src/lib/storage';
import { api } from '../../src/lib/api';
import { haptics } from '../../src/lib/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    storage.getDisplayName().then((n) => {
      setSavedName(n);
      setName(n || '');
    });
  }, []);

  const saveName = async () => {
    setSavingName(true);
    try {
      const userId = await storage.getOrCreateUserId();
      const trimmed = name.trim();
      if (trimmed) {
        await storage.setDisplayName(trimmed);
        await api.upsertProfile({ user_id: userId, display_name: trimmed });
        setSavedName(trimmed);
      }
      setEditing(false);
      haptics.complete();
    } catch (e) {
      console.warn('save name failed', e);
      Alert.alert('Could not save', 'Please try again later.');
    } finally {
      setSavingName(false);
    }
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} testID="profile-screen">
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Profile</Text>
              <Text style={styles.title}>A page{'\n'}of your own.</Text>
              <Text style={styles.lede}>
                You are here as a guest. Add a name if you wish — nothing more is required.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Name</Text>
              {editing ? (
                <>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="What shall we call you?"
                    placeholderTextColor={colors.text.faint}
                    style={styles.input}
                    autoFocus
                    testID="name-input"
                  />
                  <View style={styles.rowGap}>
                    <InkButton
                      label="Save"
                      onPress={saveName}
                      loading={savingName}
                      style={{ flex: 1 }}
                      testID="save-name-btn"
                    />
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => {
                        setEditing(false);
                        setName(savedName || '');
                        haptics.tap();
                      }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.row}>
                  <Text style={styles.value}>{savedName || 'A quiet guest.'}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditing(true);
                      haptics.tap();
                    }}
                    testID="edit-name-btn"
                  >
                    <Text style={styles.linkSmall}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>The Analog Club</Text>

            <TouchableOpacity
              style={styles.linkRow}
              activeOpacity={0.85}
              onPress={() => {
                haptics.tap();
                router.push('/penpal');
              }}
              testID="penpal-link"
            >
              <View style={styles.linkIconBox}>
                <Mail size={20} color={colors.accent.gold} strokeWidth={1.5} />
              </View>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Penpal Waitlist</Text>
                <Text style={styles.linkSub}>
                  An invitation, when the room is ready.
                </Text>
              </View>
              <ChevronRight size={18} color={colors.text.muted} strokeWidth={1.5} />
            </TouchableOpacity>

            <View style={styles.linkRowMuted}>
              <View style={styles.linkIconBox}>
                <Heart size={20} color={colors.text.muted} strokeWidth={1.5} />
              </View>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Saved Pieces</Text>
                <Text style={styles.linkSub}>Coming soon — quiet bookmarks.</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>About</Text>

            <View style={styles.aboutCard}>
              <Info size={18} color={colors.accent.gold} strokeWidth={1.5} />
              <Text style={styles.aboutText}>
                Codexia & Ink is a sanctuary for thoughtful people reclaiming focus, memory, and analog presence in an overstimulated world.
              </Text>
            </View>

            <Text style={styles.version}>v1.0 · A practice in slowness.</Text>

            <View style={{ height: spacing.xxl }} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </PaperBackground>
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
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    ...shadow.paper,
  },
  cardLabel: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  value: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  linkSmall: {
    fontFamily: fonts.accent,
    fontSize: 12,
    color: colors.accent.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontFamily: fonts.body,
    color: colors.text.secondary,
    fontSize: 15,
  },
  sectionTitle: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg.paper,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  linkRowMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg.paper,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    opacity: 0.6,
  },
  linkIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  linkSub: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
  aboutCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  aboutText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  version: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.text.faint,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
