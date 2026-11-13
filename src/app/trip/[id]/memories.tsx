import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { photoUri } from '@/lib/photos';
import { useChapters, useTripChapters } from '@/store/chapters';
import { useMemories, useTripMemories } from '@/store/memories';
import { useTrip } from '@/store/trips';
import { CHAPTER_TYPES } from '@/theme/chapterTypes';
import { colors, radius, space } from '@/theme/tokens';

const GAP = 6;

/** Per-trip grid of every memory, oldest first. */
export default function TripMemories() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const trip = useTrip(tripId);
  const items = useTripMemories(tripId);
  const chapters = useTripChapters(tripId);
  const loadMemories = useMemories((s) => s.load);
  const loadChapters = useChapters((s) => s.load);
  const { width } = useWindowDimensions();
  const size = (width - space.lg * 2 - GAP * 2) / 3;
  const typeOf = useMemo(() => new Map(chapters.map((c) => [c.id, c.type])), [chapters]);

  useEffect(() => {
    loadMemories(tripId).catch(() => {});
    loadChapters(tripId).catch(() => {});
  }, [tripId, loadMemories, loadChapters]);

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Back" />
        <View style={styles.flex}>
          <Text variant="title">Memories</Text>
          <Text variant="small" color={colors.textDim} numberOfLines={1}>
            {trip?.title ?? ''} · {items.length} photo{items.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={(m) => String(m.id)}
        numColumns={3}
        columnWrapperStyle={styles.gapRow}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <EmptyState
            icon="image-multiple-outline"
            title="No memories yet"
            body="Open a chapter on the timeline and tap Capture or Upload. Every photo lands here too."
          />
        }
        renderItem={({ item, index }) => {
          const type = typeOf.get(item.chapterId);
          return (
            <Animated.View entering={FadeIn.delay(Math.min(index, 24) * 30).duration(300)}>
              <PressableScale
                haptic="tap"
                scaleTo={0.94}
                onPress={() => router.push({ pathname: '/viewer', params: { tripId: String(tripId), index: String(index) } })}
              >
                <Image source={{ uri: photoUri(item.file) }} style={{ width: size, height: size, borderRadius: radius.sm }} contentFit="cover" transition={200} />
                {type && <View style={[styles.dot, { backgroundColor: CHAPTER_TYPES[type].color }]} />}
              </PressableScale>
            </Animated.View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  grid: { paddingHorizontal: space.lg, paddingBottom: space.xxxl, gap: GAP },
  gapRow: { gap: GAP },
  dot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.bg },
});
