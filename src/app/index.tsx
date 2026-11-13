import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { HeroTripCard } from '@/components/HeroTripCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TripCard } from '@/components/TripCard';
import { formatDate, tripStatus } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { useTrips } from '@/store/trips';
import { colors, space } from '@/theme/tokens';
import type { Trip } from '@/types';

function greeting(now: number) {
  const h = new Date(now).getHours();
  if (h < 5) return 'Late night plans?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const trips = useTrips((s) => s.trips);
  const now = useNow();
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

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const c = e.nativeEvent.contentOffset.y > 60;
          if (c !== collapsed) setCollapsed(c);
        }}
      >
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
          <Text variant="label" color={colors.accent}>
            {formatDate(now)}
          </Text>
          <Text variant="display">{hero ? greeting(now) : 'Where to next?'}</Text>
        </Animated.View>

        {hero && <HeroTripCard trip={hero} now={now} />}

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Upcoming" count={upcoming.length} />
            {upcoming.map((t, i) => (
              <TripCard key={t.id} trip={t} index={i} now={now} />
            ))}
          </View>
        )}

        {past.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Past journeys" count={past.length} />
            {past.map((t, i) => (
              <TripCard key={t.id} trip={t} index={i + upcoming.length} now={now} />
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
      {trips.length > 0 && <FAB label="New trip" collapsed={collapsed} onPress={() => router.push('/trip/new')} />}
    </Screen>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionTitle}>
      <Text variant="heading">{title}</Text>
      <Text variant="label" color={colors.textFaint}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, paddingBottom: 140, gap: space.xxl },
  header: { gap: space.xs, paddingTop: space.md },
  section: { gap: space.lg },
  sectionTitle: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
});
