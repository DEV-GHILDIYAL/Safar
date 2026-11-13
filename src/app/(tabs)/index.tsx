import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { HeroTripCard } from '@/components/HeroTripCard';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useTabBarSpace } from '@/components/TabBar';
import { Text } from '@/components/Text';
import { TripCard } from '@/components/TripCard';
import { formatDate, tripStatus } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { useProfile } from '@/store/profile';
import { useTrips } from '@/store/trips';
import { colors, space } from '@/theme/tokens';
import type { Trip } from '@/types';

const MAX_UPCOMING = 3;
const MAX_RECENT = 2;

function greeting(now: number) {
  const h = new Date(now).getHours();
  if (h < 5) return 'Late night plans';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const trips = useTrips((s) => s.trips);
  const name = useProfile((s) => s.profile.name);
  const now = useNow();
  const tabSpace = useTabBarSpace();
  const [collapsed, setCollapsed] = useState(false);

  const { hero, upcoming, past } = useMemo(() => {
    const current: Trip[] = [];
    const up: Trip[] = [];
    const done: Trip[] = [];
    for (const t of trips) {
      const s = tripStatus(t, now);
      (s === 'current' ? current : s === 'upcoming' ? up : done).push(t);
    }
    const all = [...current, ...up];
    return { hero: all[0], upcoming: all.slice(1), past: done.reverse() };
  }, [trips, now]);

  const firstName = name.trim().split(/\s+/)[0];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabSpace + 96 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const c = e.nativeEvent.contentOffset.y > 60;
          if (c !== collapsed) setCollapsed(c);
        }}
      >
        <Animated.View entering={FadeInDown.duration(320)} style={styles.header}>
          <Text variant="label" color={colors.accent}>
            {formatDate(now)}
          </Text>
          <Text variant="title">
            {trips.length ? `${greeting(now)}${firstName ? `, ${firstName}` : ''}` : 'Where to next?'}
          </Text>
        </Animated.View>

        {hero && <HeroTripCard trip={hero} now={now} />}

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Up next" count={upcoming.length} showAll={upcoming.length > MAX_UPCOMING} />
            {upcoming.slice(0, MAX_UPCOMING).map((t, i) => (
              <TripCard key={t.id} trip={t} index={i} now={now} />
            ))}
          </View>
        )}

        {past.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Recent journeys" count={past.length} showAll={past.length > MAX_RECENT} />
            {past.slice(0, MAX_RECENT).map((t, i) => (
              <TripCard key={t.id} trip={t} index={i + MAX_UPCOMING} now={now} />
            ))}
          </View>
        )}

        {trips.length === 0 && (
          <EmptyState
            icon="map-marker-path"
            title="Your first story starts here"
            body="Create a trip, then add its chapters: the train out, the homestay, that chai stop. Safar keeps it all offline."
            action={{ label: 'Plan a trip', icon: 'plus', onPress: () => router.push('/trip/new') }}
          />
        )}
      </ScrollView>
      {trips.length > 0 && <FAB label="New trip" collapsed={collapsed} bottomOffset={tabSpace} onPress={() => router.push('/trip/new')} />}
    </Screen>
  );
}

function SectionTitle({ title, count, showAll }: { title: string; count: number; showAll: boolean }) {
  return (
    <View style={styles.sectionTitle}>
      <Text variant="heading">{title}</Text>
      <Text variant="label" color={colors.textFaint} style={styles.flex}>
        {count}
      </Text>
      {showAll && (
        <PressableScale haptic="tap" onPress={() => router.navigate('/trips')} hitSlop={8}>
          <Text variant="small" color={colors.accent} style={styles.bold}>
            See all
          </Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.xl },
  header: { gap: space.xs, paddingTop: space.md, paddingHorizontal: space.xs },
  section: { gap: space.sm + 2 },
  sectionTitle: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, paddingHorizontal: space.xs },
  flex: { flex: 1 },
  bold: { fontWeight: '800' },
});
