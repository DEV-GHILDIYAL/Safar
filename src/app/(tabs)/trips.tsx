import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useTabBarSpace } from '@/components/TabBar';
import { Text } from '@/components/Text';
import { TripCard } from '@/components/TripCard';
import { tripStatus } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { useTrips } from '@/store/trips';
import { colors, radius, space } from '@/theme/tokens';
import type { TripStatus } from '@/types';

type Filter = 'all' | TripStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'current', label: 'Now' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

/** All trips with search + status filter. Current/upcoming soonest first, past most recent first. */
export default function Trips() {
  const trips = useTrips((s) => s.trips);
  const now = useNow();
  const tabSpace = useTabBarSpace();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { list, counts } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const counts: Record<Filter, number> = { all: trips.length, current: 0, upcoming: 0, past: 0 };
    const withStatus = trips.map((t) => {
      const s = tripStatus(t, now);
      counts[s] += 1;
      return { t, s };
    });
    const rank: Record<TripStatus, number> = { current: 0, upcoming: 1, past: 2 };
    const list = withStatus
      .filter(({ t, s }) => (filter === 'all' || s === filter) && (!q || `${t.title} ${t.destination} ${t.notes}`.toLowerCase().includes(q)))
      .sort((a, b) => rank[a.s] - rank[b.s] || (a.s === 'past' ? b.t.startDate - a.t.startDate : a.t.startDate - b.t.startDate))
      .map(({ t }) => t);
    return { list, counts };
  }, [trips, now, query, filter]);

  return (
    <Screen>
      <View style={styles.head}>
        <Text variant="title">Trips</Text>
        <View style={styles.search}>
          <Icon name="magnify" size={20} color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search trips, places, notes"
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            style={styles.input}
            returnKeyType="search"
          />
          {query ? <IconButton icon="close" size={28} background="transparent" color={colors.textFaint} onPress={() => setQuery('')} /> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => {
            const on = f.key === filter;
            return (
              <PressableScale
                key={f.key}
                haptic="select"
                scaleTo={0.92}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text variant="small" color={on ? colors.onAccent : colors.textDim} style={styles.bold}>
                  {f.label}
                </Text>
                <Text variant="label" color={on ? colors.onAccent : colors.textFaint}>
                  {counts[f.key]}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: tabSpace + 96 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {list.map((t, i) => (
          <TripCard key={t.id} trip={t} index={i} now={now} />
        ))}
        {list.length === 0 &&
          (trips.length === 0 ? (
            <EmptyState
              icon="bag-suitcase-outline"
              title="No trips yet"
              body="Every journey you plan shows up here, easy to search later."
              action={{ label: 'Plan a trip', icon: 'plus', onPress: () => router.push('/trip/new') }}
            />
          ) : (
            <EmptyState icon="map-search-outline" title="Nothing found" body="Try another name or place, or switch the filter." delay={0} />
          ))}
      </ScrollView>
      {trips.length > 0 && <FAB icon="plus" bottomOffset={tabSpace} onPress={() => router.push('/trip/new')} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  chips: { gap: space.sm, paddingBottom: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    height: 36,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  bold: { fontWeight: '800' },
  list: { padding: space.lg, paddingTop: space.sm, gap: space.sm + 2 },
});
