import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { ChapterSheet, useChapterSheet } from '@/components/ChapterSheet';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { MemoryStrip } from '@/components/MemoryStrip';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Timeline } from '@/components/Timeline';
import { TripHeader, TripTopBar } from '@/components/TripHeader';
import { tripLength } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { useChapters, useTripChapters } from '@/store/chapters';
import { useMemories, useTripMemories } from '@/store/memories';
import { useTrip } from '@/store/trips';
import { colors, radius, space } from '@/theme/tokens';

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const trip = useTrip(tripId);
  const chapters = useTripChapters(tripId);
  const load = useChapters((s) => s.load);
  const now = useNow();
  const sheet = useChapterSheet();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadMemories = useMemories((s) => s.load);
  const memoryCount = useTripMemories(tripId).length;

  useEffect(() => {
    load(tripId).catch(() => {});
    loadMemories(tripId).catch(() => {});
  }, [tripId, load, loadMemories]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  if (!trip) return <Screen />;

  const done = chapters.filter((c) => c.done).length;

  return (
    <Screen safeTop={false}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TripHeader trip={trip} scrollY={scrollY} now={now} />
        <Stats days={tripLength(trip)} chapters={chapters.length} done={done} photos={memoryCount} />
        {trip.notes ? (
          <Animated.View entering={FadeInDown.delay(260).springify().damping(18)} style={styles.notes}>
            <Icon name="text" size={18} color={colors.textFaint} />
            <Text variant="small" color={colors.textDim} style={styles.flex}>
              {trip.notes}
            </Text>
          </Animated.View>
        ) : null}
        {chapters.length ? (
          <Timeline
            trip={trip}
            chapters={chapters}
            now={now}
            expandedId={expandedId}
            onToggle={(cid) => setExpandedId((cur) => (cur === cid ? null : cid))}
            onEdit={sheet.openEdit}
            renderExtra={(c) => <MemoryStrip chapter={c} />}
          />
        ) : (
          <EmptyState
            icon="book-open-page-variant-outline"
            title="Chapter one awaits"
            body="Add the train, the hotel, that street-food stop. Each becomes a step on your timeline."
            action={{ label: 'Add first chapter', icon: 'plus', onPress: sheet.openNew }}
            delay={300}
          />
        )}
      </Animated.ScrollView>
      <TripTopBar
        title={trip.title}
        scrollY={scrollY}
        actions={[
          { icon: 'image-multiple-outline', label: 'All memories', onPress: () => router.push(`/trip/${trip.id}/memories`) },
          { icon: 'pencil-outline', label: 'Edit trip', onPress: () => router.push(`/trip/${trip.id}/edit`) },
        ]}
      />
      {chapters.length > 0 && <FAB icon="plus" label="Chapter" onPress={sheet.openNew} />}
      <ChapterSheet visible={sheet.visible} chapter={sheet.chapter} onClose={sheet.close} trip={trip} chapters={chapters} />
    </Screen>
  );
}

function Stats({ days, chapters, done, photos }: { days: number; chapters: number; done: number; photos: number }) {
  const pct = chapters ? done / chapters : 0;
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(400, withTiming(pct, { duration: 700 }));
  }, [pct, w]);
  const bar = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <Animated.View entering={FadeInDown.delay(180).springify().damping(18)} style={styles.stats}>
      <View style={styles.statRow}>
        <Stat value={days} label={days === 1 ? 'day' : 'days'} />
        <Stat value={chapters} label={chapters === 1 ? 'chapter' : 'chapters'} />
        <Stat value={photos} label={photos === 1 ? 'photo' : 'photos'} />
        <Stat value={`${Math.round(pct * 100)}%`} label="done" accent />
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, bar]} />
      </View>
    </Animated.View>
  );
}

function Stat({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text variant="title" color={accent ? colors.accent : colors.text}>
        {value}
      </Text>
      <Text variant="label" color={colors.textFaint}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 160 },
  flex: { flex: 1 },
  stats: {
    margin: space.lg,
    padding: space.lg,
    gap: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statRow: { flexDirection: 'row' },
  stat: { flex: 1, gap: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  notes: { flexDirection: 'row', gap: space.sm, marginHorizontal: space.xl, marginBottom: space.sm },
});
