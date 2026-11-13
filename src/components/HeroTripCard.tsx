import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { countdown, daysBetween, formatRange, formatTime, relativeDay, tripLength, tripStatus } from '@/lib/dates';
import { findNext } from '@/lib/timeline';
import { useChapters, useTripChapters } from '@/store/chapters';
import { CHAPTER_TYPES } from '@/theme/chapterTypes';
import { colors, radius, space } from '@/theme/tokens';
import type { Trip } from '@/types';
import { CoverImage } from './CoverImage';
import { Icon } from './Icon';
import { Pill } from './Pill';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { useOpenTrip } from './TripCard';
import { TypeIcon } from './TypeIcon';

interface Props {
  trip: Trip;
  now: number;
}

/** Home card for the current (or next upcoming) trip: compact cover + next chapter with countdown. */
export function HeroTripCard({ trip, now }: Props) {
  const { ref, open } = useOpenTrip(trip);
  const chapters = useTripChapters(trip.id);
  const load = useChapters((s) => s.load);
  useEffect(() => {
    load(trip.id).catch(() => {});
  }, [trip.id, load]);

  const status = tripStatus(trip, now);
  const next = findNext(chapters, now);
  const day = daysBetween(trip.startDate, now) + 1;
  const pill = status === 'current' ? `Day ${day} of ${tripLength(trip)}` : `Starts in ${countdown(trip.startDate, now)}`;

  return (
    <Animated.View entering={FadeInDown.delay(60).springify().damping(18)}>
      <PressableScale haptic="tap" onPress={open} scaleTo={0.98}>
        <View ref={ref} collapsable={false} style={styles.card}>
          <CoverImage file={trip.cover} seed={trip.id} scrim={1.1} style={styles.cover}>
            <View style={styles.coverInner}>
              <Pill label={pill} live={status === 'current'} color={status === 'current' ? colors.accent : colors.text} />
              <View style={styles.titleBlock}>
                <Text variant="title" numberOfLines={1}>
                  {trip.title}
                </Text>
                <Text variant="small" color={colors.textDim} numberOfLines={1}>
                  {trip.destination ? `${trip.destination} · ` : ''}
                  {formatRange(trip.startDate, trip.endDate)}
                </Text>
              </View>
            </View>
          </CoverImage>
          <View style={styles.next}>
            {next ? (
              <>
                <TypeIcon type={next.chapter.type} size={40} />
                <View style={styles.nextText}>
                  <Text variant="label" color={CHAPTER_TYPES[next.chapter.type].color} numberOfLines={1}>
                    {next.live ? 'Happening now' : `Next · ${relativeDay(next.chapter.startAt, now)} ${formatTime(next.chapter.startAt)}`}
                  </Text>
                  <Text variant="body" style={styles.bold} numberOfLines={1}>
                    {next.chapter.title}
                  </Text>
                </View>
                <View style={styles.count}>
                  <Text variant="label" color={colors.textFaint}>
                    {next.live ? 'until' : 'in'}
                  </Text>
                  <Text variant="heading" color={colors.accent}>
                    {countdown(next.live && next.chapter.endAt ? next.chapter.endAt : next.chapter.startAt, now)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.plus}>
                  <Icon name={chapters.length ? 'check-all' : 'plus'} size={20} color={colors.accent} />
                </View>
                <View style={styles.nextText}>
                  <Text variant="label" color={colors.textFaint}>
                    {chapters.length ? 'All caught up' : 'No chapters yet'}
                  </Text>
                  <Text variant="body" style={styles.bold}>
                    {chapters.length ? 'Open the story' : 'Write the first chapter'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={22} color={colors.textDim} />
              </>
            )}
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cover: { height: 168 },
  coverInner: { flex: 1, justifyContent: 'space-between', padding: space.lg },
  titleBlock: { gap: 2 },
  next: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, paddingHorizontal: space.lg },
  nextText: { flex: 1, gap: 2 },
  bold: { fontWeight: '800' },
  count: { alignItems: 'flex-end' },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
});
