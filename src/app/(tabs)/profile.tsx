import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Avatar } from '@/components/Avatar';
import { Icon, type IconName } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { ProfileSheet } from '@/components/ProfileSheet';
import { Screen } from '@/components/Screen';
import { useTabBarSpace } from '@/components/TabBar';
import { Text } from '@/components/Text';
import { daysBetween, startOfDay, tripLength } from '@/lib/dates';
import { useProfile } from '@/store/profile';
import { useTrips } from '@/store/trips';
import { CHAPTER_TYPE_ORDER, CHAPTER_TYPES } from '@/theme/chapterTypes';
import { colors, radius, space } from '@/theme/tokens';

export default function ProfileTab() {
  const profile = useProfile((s) => s.profile);
  const stats = useProfile((s) => s.stats);
  const refreshStats = useProfile((s) => s.refreshStats);
  const trips = useTrips((s) => s.trips);
  const tabSpace = useTabBarSpace();
  const [editing, setEditing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshStats().catch(() => {});
    }, [refreshStats]),
  );

  const tripStats = useMemo(() => {
    const today = startOfDay(Date.now());
    let days = 0;
    for (const t of trips) {
      if (t.startDate > today) continue;
      days += Math.min(tripLength(t), daysBetween(t.startDate, today) + 1);
    }
    const places = new Set(trips.map((t) => t.destination.trim().toLowerCase()).filter(Boolean)).size;
    return { days, places };
  }, [trips]);

  const byType = CHAPTER_TYPE_ORDER.map((t) => ({ type: t, n: stats.byType[t] ?? 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const maxType = byType[0]?.n ?? 1;

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabSpace + space.xl }]} showsVerticalScrollIndicator={false}>
        <Text variant="title" style={styles.pad}>
          Profile
        </Text>

        <Animated.View entering={FadeInDown.duration(320)}>
          <PressableScale haptic="tap" scaleTo={0.98} onPress={() => setEditing(true)} style={[styles.card, styles.me]}>
            <Avatar name={profile.name} file={profile.avatar} size={72} />
            <View style={styles.flex}>
              <Text variant="heading" numberOfLines={1} color={profile.name ? colors.text : colors.textDim}>
                {profile.name || 'Add your name'}
              </Text>
              <View style={styles.row}>
                <Icon name="home-city-outline" size={14} color={colors.accent} />
                <Text variant="small" color={colors.textDim} numberOfLines={1}>
                  {profile.homeCity || 'Set your home city'}
                </Text>
              </View>
            </View>
            <IconButton icon="pencil-outline" size={40} onPress={() => setEditing(true)} accessibilityLabel="Edit profile" />
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(320)} style={styles.grid}>
          <Stat icon="bag-suitcase-outline" value={trips.length} label="Trips" />
          <Stat icon="calendar-check-outline" value={tripStats.days} label="Days away" />
          <Stat icon="map-marker-multiple-outline" value={tripStats.places} label="Places" />
          <Stat icon="book-open-page-variant-outline" value={stats.chapters} label="Chapters" />
          <Stat icon="check-circle-outline" value={stats.done} label="Done" />
          <Stat icon="image-multiple-outline" value={stats.photos} label="Photos" />
        </Animated.View>

        {byType.length > 0 && (
          <Animated.View entering={FadeInDown.delay(160).duration(320)} style={[styles.card, styles.gap]}>
            <Text variant="heading">How you travel</Text>
            {byType.map((x, i) => (
              <TypeBar key={x.type} type={x.type} n={x.n} pct={x.n / maxType} delay={250 + i * 70} />
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(240).duration(320)} style={[styles.card, styles.gap]}>
          <InfoRow icon="shield-lock-outline" title="Private by design" body="No account, no cloud. Trips and photos stay on this phone." />
          <InfoRow icon="information-outline" title={`Safar ${Constants.expoConfig?.version ?? ''}`} body="Updates install from GitHub Releases over this version." />
        </Animated.View>
      </ScrollView>
      <ProfileSheet visible={editing} onClose={() => setEditing(false)} />
    </Screen>
  );
}

function Stat({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={20} color={colors.accent} />
      <Text variant="title">{value}</Text>
      <Text variant="label" color={colors.textFaint}>
        {label}
      </Text>
    </View>
  );
}

function TypeBar({ type, n, pct, delay }: { type: keyof typeof CHAPTER_TYPES; n: number; pct: number; delay: number }) {
  const m = CHAPTER_TYPES[type];
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(pct, { duration: 700 }));
  }, [pct, delay, w]);
  const bar = useAnimatedStyle(() => ({ width: `${Math.max(w.value, 0.04) * 100}%` }));
  return (
    <View style={styles.typeRow}>
      <Icon name={m.icon} size={18} color={m.color} />
      <Text variant="small" style={styles.typeLabel}>
        {m.label}
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: m.color }, bar]} />
      </View>
      <Text variant="small" color={colors.textDim} style={styles.typeN}>
        {n}
      </Text>
    </View>
  );
}

function InfoRow({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.info}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.flex}>
        <Text variant="body" style={styles.bold}>
          {title}
        </Text>
        <Text variant="small" color={colors.textDim}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.lg },
  pad: { paddingTop: space.md, paddingHorizontal: space.xs },
  flex: { flex: 1, gap: 2 },
  bold: { fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  card: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  me: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  gap: { gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: {
    width: '31.8%',
    flexGrow: 1,
    padding: space.md,
    gap: 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  typeLabel: { width: 64, fontWeight: '700' },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  typeN: { width: 28, textAlign: 'right' },
  info: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
});
