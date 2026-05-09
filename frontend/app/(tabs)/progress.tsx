import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaperBackground from '../../src/components/PaperBackground';
import { colors, fonts, spacing, radius, shadow } from '../../src/theme';
import { api, ProgressStats, WritingSession, friendlyCategory } from '../../src/lib/api';
import { storage } from '../../src/lib/storage';

export default function ProgressScreen() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [recent, setRecent] = useState<WritingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const userId = await storage.getOrCreateUserId();
    try {
      const [s, r] = await Promise.all([api.getProgress(userId), api.listSessions(userId)]);
      setStats(s);
      setRecent(r.slice(0, 8));
    } catch (e) {
      console.warn('progress load failed', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setLoading(true);
      load().finally(() => alive && setLoading(false));
      return () => {
        alive = false;
      };
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.gold}
            />
          }
          testID="progress-screen"
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>The Practice</Text>
            <Text style={styles.title}>Your quiet{'\n'}returning.</Text>
            <Text style={styles.lede}>
              No streaks to chase. Only what you have already done, gathered here.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.accent.gold} />
            </View>
          ) : stats ? (
            <>
              <View style={styles.statsRow}>
                <StatCard label="Sessions" value={stats.total_sessions.toString()} />
                <StatCard label="Minutes" value={stats.total_minutes.toString()} />
                <StatCard label="Words" value={stats.total_words.toLocaleString()} />
              </View>

              <View style={styles.streakCard} testID="streak-card">
                <Text style={styles.streakEyebrow}>Days returned in a row</Text>
                <View style={styles.streakRow}>
                  <Text style={styles.streakNumber}>{stats.current_streak}</Text>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakMeta}>
                    <Text style={styles.streakSub}>Longest: {stats.longest_streak}</Text>
                    <Text style={styles.streakSub}>
                      {stats.last_session_at
                        ? `Last: ${new Date(stats.last_session_at).toLocaleDateString()}`
                        : 'Awaiting your first stroke.'}
                    </Text>
                  </View>
                </View>
              </View>

              {Object.keys(stats.sessions_by_category).length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Where your hand has wandered</Text>
                  <View style={styles.byCatList}>
                    {Object.entries(stats.sessions_by_category)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, count]) => (
                        <View key={cat} style={styles.byCatRow}>
                          <Text style={styles.byCatName}>{friendlyCategory(cat)}</Text>
                          <Text style={styles.byCatCount}>{count}</Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent sessions</Text>
                {recent.length === 0 ? (
                  <Text style={styles.empty}>No sessions yet. Begin in the Studio.</Text>
                ) : (
                  recent.map((s) => (
                    <View key={s.id} style={styles.sessionRow}>
                      <View style={styles.sessionDot} />
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionTitle}>{s.title || friendlyCategory(s.content_type)}</Text>
                        <Text style={styles.sessionMeta}>
                          {new Date(s.completed_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' · '}
                          {Math.max(1, Math.round(s.duration_seconds / 60))} min
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          ) : null}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  loadingBox: { paddingVertical: spacing.xxl, alignItems: 'center' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg.paper,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.paper,
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: fonts.accent,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  streakCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.accent.ink,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.deep,
  },
  streakEyebrow: {
    fontFamily: fonts.accent,
    fontSize: 11,
    color: colors.accent.goldFaint,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    fontFamily: fonts.heading,
    fontSize: 64,
    color: colors.bg.paper,
    letterSpacing: -1,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(245,241,232,0.18)',
    marginHorizontal: spacing.lg,
  },
  streakMeta: {
    flex: 1,
  },
  streakSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(245,241,232,0.78)',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  byCatList: {
    backgroundColor: colors.bg.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.sm,
  },
  byCatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  byCatName: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text.primary,
  },
  byCatCount: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.accent.gold,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.gold,
    marginRight: spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.text.primary,
  },
  sessionMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
  empty: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    color: colors.text.muted,
    paddingVertical: spacing.xl,
    textAlign: 'center',
  },
});
