import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useTabBarSpace } from '@/components/TabBar';
import { Text } from '@/components/Text';
import { formatRange } from '@/lib/dates';
import { photoUri } from '@/lib/photos';
import { useMemories } from '@/store/memories';
import { useTrips } from '@/store/trips';
import { colors, radius, space } from '@/theme/tokens';

const GAP = 6;
const PREVIEW = 6;

/** Every trip's photos, newest trip first; tap "See all" for the full per-trip grid. */
export default function MemoriesTab() {
  const trips = useTrips((s) => s.trips);
  const byTrip = useMemories((s) => s.byTrip);
  const loadAll = useMemories((s) => s.loadAll);
  const tabSpace = useTabBarSpace();
  const { width } = useWindowDimensions();
  const size = (width - space.lg * 2 - GAP * 2) / 3;

  useFocusEffect(
    useCallback(() => {
      loadAll().catch(() => {});
    }, [loadAll]),
  );

  const sections = useMemo(
    () =>
      [...trips]
        .sort((a, b) => b.startDate - a.startDate)
        .map((t) => ({ trip: t, items: byTrip[t.id] ?? [] }))
        .filter((s) => s.items.length > 0),
    [trips, byTrip],
  );
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabSpace + space.xl }]} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text variant="title">Memories</Text>
          <Text variant="small" color={colors.textDim}>
            {total} photo{total === 1 ? '' : 's'} across {sections.length} trip{sections.length === 1 ? '' : 's'}
          </Text>
        </View>

        {sections.map(({ trip, items }, si) => (
          <Animated.View key={trip.id} entering={FadeInDown.delay(Math.min(si, 6) * 70).duration(320)} style={styles.section}>
            <PressableScale haptic="tap" scaleTo={0.98} onPress={() => router.push(`/trip/${trip.id}/memories`)} style={styles.sectionHead}>
              <View style={styles.flex}>
                <Text variant="heading" numberOfLines={1}>
                  {trip.title}
                </Text>
                <Text variant="small" color={colors.textFaint}>
                  {formatRange(trip.startDate, trip.endDate)} · {items.length}
                </Text>
              </View>
              <Text variant="small" color={colors.accent} style={styles.bold}>
                See all
              </Text>
              <Icon name="chevron-right" size={20} color={colors.accent} />
            </PressableScale>
            <View style={styles.grid}>
              {items.slice(0, PREVIEW).map((m, i) => (
                <Animated.View key={m.id} entering={FadeIn.delay(Math.min(si, 6) * 70 + i * 30).duration(300)}>
                  <PressableScale
                    haptic="tap"
                    scaleTo={0.94}
                    onPress={() => router.push({ pathname: '/viewer', params: { tripId: String(trip.id), index: String(i) } })}
                  >
                    <Image source={{ uri: photoUri(m.file) }} style={{ width: size, height: size, borderRadius: radius.sm }} contentFit="cover" transition={200} />
                    {i === PREVIEW - 1 && items.length > PREVIEW && (
                      <View style={[StyleSheet.absoluteFill, styles.more]}>
                        <Text variant="heading">+{items.length - PREVIEW + 1}</Text>
                      </View>
                    )}
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ))}

        {sections.length === 0 && (
          <EmptyState
            icon="image-multiple-outline"
            title="No memories yet"
            body="Open a chapter on any trip's timeline and tap Capture or Upload. Every photo shows up here."
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.xl },
  head: { gap: 2, paddingTop: space.md },
  section: { gap: space.sm + 2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  flex: { flex: 1 },
  bold: { fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  more: { borderRadius: radius.sm, backgroundColor: 'rgba(10,12,16,0.6)', alignItems: 'center', justifyContent: 'center' },
});
