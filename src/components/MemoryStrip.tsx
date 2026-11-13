import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { haptics } from '@/lib/haptics';
import { photoUri, pickPhotos, type PhotoSource } from '@/lib/photos';
import { useMemories, useTripMemories } from '@/store/memories';
import { colors, radius, space } from '@/theme/tokens';
import type { Chapter } from '@/types';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

const TILE = 76;

/** Photo strip inside an expanded chapter: capture / upload buttons + thumbnails opening the viewer. */
export function MemoryStrip({ chapter }: { chapter: Chapter }) {
  const all = useTripMemories(chapter.tripId);
  const items = useMemo(() => all.filter((m) => m.chapterId === chapter.id), [all, chapter.id]);
  const add = useMemories((s) => s.add);
  const [busy, setBusy] = useState(0);

  const pick = async (source: PhotoSource) => {
    const photos = await pickPhotos(source, true);
    if (!photos.length) return;
    setBusy(photos.length);
    try {
      await add(chapter.tripId, chapter.id, photos);
      haptics.success();
    } catch (e) {
      Alert.alert('Could not save photo', String(e));
    } finally {
      setBusy(0);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text variant="label" color={colors.textFaint}>
        Memories{items.length ? ` · ${items.length}` : ''}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <AddTile icon="camera-outline" label="Capture" onPress={() => pick('camera')} />
        <AddTile icon="image-plus" label="Upload" onPress={() => pick('library')} />
        {items.map((m, i) => (
          <Animated.View key={m.id} entering={ZoomIn.delay(Math.min(i, 8) * 40).springify().damping(14)}>
            <PressableScale
              haptic="tap"
              scaleTo={0.92}
              onPress={() =>
                router.push({ pathname: '/viewer', params: { tripId: String(chapter.tripId), chapterId: String(chapter.id), index: String(i) } })
              }
            >
              <Image source={{ uri: photoUri(m.file) }} style={styles.thumb} contentFit="cover" transition={200} />
            </PressableScale>
          </Animated.View>
        ))}
        {busy > 0 && (
          <View style={[styles.thumb, styles.busy]}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function AddTile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale haptic="tap" scaleTo={0.92} onPress={onPress} style={styles.add}>
      <Icon name={icon} size={24} color={colors.accent} />
      <Text variant="label" color={colors.textDim}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { gap: space.sm },
  thumb: { width: TILE, height: TILE, borderRadius: radius.sm + 2, backgroundColor: colors.surfaceAlt },
  busy: { alignItems: 'center', justifyContent: 'center' },
  add: {
    width: TILE,
    height: TILE,
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
});
