import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@/components/IconButton';
import { Text } from '@/components/Text';
import { TypeIcon } from '@/components/TypeIcon';
import { formatDate, formatTime } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { photoUri } from '@/lib/photos';
import { useChapters, useTripChapters } from '@/store/chapters';
import { useMemories, useTripMemories } from '@/store/memories';
import { colors, radius, space } from '@/theme/tokens';
import type { Memory } from '@/types';

/** Full-screen swipeable photo viewer. Params: tripId, optional chapterId (else whole trip), index. */
export default function Viewer() {
  const params = useLocalSearchParams<{ tripId: string; chapterId?: string; index?: string }>();
  const tripId = Number(params.tripId);
  const chapterId = params.chapterId ? Number(params.chapterId) : null;
  const all = useTripMemories(tripId);
  const chapters = useTripChapters(tripId);
  const items = useMemo(() => (chapterId == null ? all : all.filter((m) => m.chapterId === chapterId)), [all, chapterId]);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [initial] = useState(() => Math.max(0, Number(params.index ?? 0)));
  const [current, setCurrent] = useState(initial);
  const [chrome, setChrome] = useState(true);
  const remove = useMemories((s) => s.remove);
  const loadChapters = useChapters((s) => s.load);

  // Opened from the Memories tab the chapters may not be loaded yet (needed for the caption meta).
  useEffect(() => {
    if (!chapters.length) loadChapters(tripId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  useEffect(() => {
    if (!items.length) router.back();
    else if (current > items.length - 1) setCurrent(items.length - 1);
  }, [items.length, current]);

  const m = items[Math.min(current, items.length - 1)];
  if (!m) return <View style={styles.root} />;
  const chapter = chapters.find((c) => c.id === m.chapterId);

  const confirmDelete = () => {
    haptics.warn();
    Alert.alert('Delete photo?', 'This memory will be removed from Safar.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(m).catch(() => {}) },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={(x) => String(x.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={Math.min(initial, items.length - 1)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== current) {
            haptics.select();
            setCurrent(i);
          }
        }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setChrome((c) => !c)} style={{ width, height }}>
            <Image source={{ uri: photoUri(item.file) }} style={styles.flex} contentFit="contain" transition={150} />
          </Pressable>
        )}
      />

      {chrome && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={[styles.top, { paddingTop: insets.top + space.sm }]}>
          <IconButton icon="close" onPress={() => router.back()} background={colors.scrim} accessibilityLabel="Close" />
          <Text variant="heading" style={styles.flex} align="center">
            {current + 1} / {items.length}
          </Text>
          <IconButton icon="trash-can-outline" color={colors.danger} background={colors.scrim} onPress={confirmDelete} accessibilityLabel="Delete photo" />
        </Animated.View>
      )}

      {chrome && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.meta}>
            {chapter && <TypeIcon type={chapter.type} size={34} />}
            <View style={styles.flex}>
              <Text variant="body" style={styles.bold} numberOfLines={1}>
                {chapter?.title ?? 'Memory'}
              </Text>
              <Text variant="small" color={colors.textDim}>
                {formatDate(m.takenAt, true)} · {formatTime(m.takenAt)}
              </Text>
            </View>
          </View>
          <CaptionInput key={m.id} memory={m} />
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

function CaptionInput({ memory }: { memory: Memory }) {
  const setCaption = useMemories((s) => s.setCaption);
  const [text, setText] = useState(memory.caption);
  const commit = () => {
    const t = text.trim();
    if (t !== memory.caption) setCaption(memory, t).catch(() => {});
  };
  return (
    <TextInput
      value={text}
      onChangeText={setText}
      onEndEditing={commit}
      onSubmitEditing={commit}
      placeholder="Add a caption…"
      placeholderTextColor={colors.textFaint}
      selectionColor={colors.accent}
      cursorColor={colors.accent}
      multiline
      submitBehavior="blurAndSubmit"
      returnKeyType="done"
      style={styles.caption}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  bold: { fontWeight: '800' },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: space.lg,
    gap: space.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  caption: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    maxHeight: 120,
  },
});
