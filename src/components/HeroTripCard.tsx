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

/** Big home card for the current (or next upcoming) trip, with next chapter + countdown. */
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
  const pill =
    status === 'current'
      ? `On the road · Day ${day} of ${tripLength(trip)}`
      : `Starts in ${countdown(trip.startDate, now)}`;

  return (
    <Animated.View entering={FadeInDown.delay(60).springify().damping(18)}>
      <PressableScale haptic="tap" onPress={open} scaleTo={0.98}>
        <View ref={ref} collapsable={false} style={styles.card}>
          <CoverImage file={trip.cover} seed={trip.id} scrim={1.1} style={StyleSheet.absoluteFill} />
          <View style={styles.top}>
            <Pill label={pill} live={status === 'current'} color={status === 'current' ? colors.accent : colors.text} />
          </View>
          <View style={styles.bottom}>
            {trip.destination ? (
              <View style={styles.row}>
                <Icon name="map-marker" size={15} color={colors.accent} />
                <Text variant="label" color={colors.textDim}>
                  {trip.destination}
                </Text>
              </View>
            ) : null}
            <Text variant="display" numberOfLines={2}>
              {trip.title}
            </Text>
            <Text variant="small" color={colors.textDim}>
              {formatRange(trip.startDate, trip.endDate)}
            </Text>
            <View style={styles.next}>
              {next ? (
                <>
                  <TypeIcon type={next.chapter.type} size={44} />
                  <View style={styles.nextText}>
                    <Text variant="label" color={CHAPTER_TYPES[next.chapter.type].color}>
                      {next.live ? 'Happening now' : `Next · ${relativeDay(next.chapter.startAt, now)} ${formatTime(next.chapter.startAt)}`}
                    </Text>
                    <Text variant="heading" numberOfLines={1}>
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
                    <Icon name="plus" size={22} color={colors.accent} />
                  </View>
                  <View style={styles.nextText}>
                    <Text variant="label" color={colors.textFaint}>
                      {chapters.length ? 'All caught up' : 'No chapters yet'}
                    </Text>
                    <Text variant="heading">{chapters.length ? 'Open the story' : 'Write the first chapter'}</Text>
                  </View>
                  <Icon name="arrow-right" size={22} color={colors.textDim} />
                </>
              )}
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 440,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  top: { padding: space.xl, flexDirection: 'row' },
  bottom: { padding: space.lg, paddingTop: 0, gap: space.xs + 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm },
  next: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(19,22,29,0.86)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  nextText: { flex: 1, gap: 2 },
  count: { alignItems: 'flex-end', paddingRight: space.xs },
  plus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
});
