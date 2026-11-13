import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { daysBetween, formatDate, formatTime, tripLength, tripStatus } from '@/lib/dates';
import { groupByDay } from '@/lib/timeline';
import { colors, space, stagger } from '@/theme/tokens';
import type { Chapter, Trip } from '@/types';
import { ChapterCard, RAIL, rowLayout } from './ChapterCard';
import { LiveDot, Pill } from './Pill';
import { Text } from './Text';

interface Props {
  trip: Trip;
  chapters: Chapter[];
  now: number;
  expandedId: number | null;
  onToggle: (id: number) => void;
  onEdit: (c: Chapter) => void;
  renderExtra?: (c: Chapter) => ReactNode;
}

/** Day-grouped vertical timeline with an animated rail and a live "now" marker. */
export function Timeline({ trip, chapters, now, expandedId, onToggle, onEdit, renderExtra }: Props) {
  const groups = useMemo(() => groupByDay(chapters), [chapters]);
  const draw = useSharedValue(0);
  useEffect(() => {
    draw.value = withDelay(220, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [draw]);
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: draw.value }] }));

  const items: ReactNode[] = [];
  let placed = tripStatus(trip, now) !== 'current';
  let i = 0;
  const marker = () => <NowMarker key="now" now={now} />;

  for (const g of groups) {
    if (!placed && g.chapters[0].startAt > now && now < g.day) {
      items.push(marker());
      placed = true;
    }
    items.push(<DayHeader key={g.key} day={g.day} trip={trip} now={now} index={i} />);
    g.chapters.forEach((c, j) => {
      if (!placed && c.startAt > now) {
        items.push(marker());
        placed = true;
      }
      items.push(
        <ChapterCard
          key={c.id}
          chapter={c}
          index={i++}
          expanded={expandedId === c.id}
          canUp={j > 0}
          canDown={j < g.chapters.length - 1}
          onToggle={() => onToggle(c.id)}
          onEdit={() => onEdit(c)}
        >
          {renderExtra?.(c)}
        </ChapterCard>,
      );
    });
  }
  if (!placed) items.push(marker());

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.line, lineStyle]}>
        <LinearGradient colors={[colors.accent, colors.border, colors.border]} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {items}
    </View>
  );
}

function DayHeader({ day, trip, now, index }: { day: number; trip: Trip; now: number; index: number }) {
  const n = daysBetween(trip.startDate, day) + 1;
  const inTrip = n >= 1 && n <= tripLength(trip);
  const today = daysBetween(now, day) === 0;
  return (
    <Animated.View entering={FadeInDown.delay(stagger(index, 55) + 200).duration(320)} layout={rowLayout} style={styles.dayRow}>
      <View style={styles.rail}>
        <View style={[styles.dayDot, today && styles.dayDotToday]} />
      </View>
      <View style={styles.dayText}>
        <Text variant="label" color={today ? colors.accent : colors.textFaint}>
          {inTrip ? `Day ${n}` : n < 1 ? 'Before the trip' : 'After the trip'}
        </Text>
        <Text variant="heading">{formatDate(day)}</Text>
      </View>
      {today && <Pill label="Today" color={colors.accent} background={colors.accentSoft} />}
    </Animated.View>
  );
}

function NowMarker({ now }: { now: number }) {
  return (
    <Animated.View entering={FadeIn.delay(900).duration(400)} layout={rowLayout} style={styles.nowRow}>
      <View style={styles.rail}>
        <LiveDot size={12} />
      </View>
      <View style={styles.nowLine} />
      <Pill label={`Now · ${formatTime(now)}`} color={colors.accent} background={colors.accentSoft} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, paddingTop: space.sm },
  line: {
    position: 'absolute',
    left: space.lg + RAIL / 2 - 1,
    top: space.lg,
    bottom: space.xl,
    width: 2,
    borderRadius: 1,
    overflow: 'hidden',
    transformOrigin: 'top',
  },
  rail: { width: RAIL, alignItems: 'center' },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.lg, marginBottom: space.md },
  dayDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.bg, borderWidth: 2, borderColor: colors.textFaint },
  dayDotToday: { borderColor: colors.accent, backgroundColor: colors.accent },
  dayText: { flex: 1, gap: 2 },
  nowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.md, gap: space.sm },
  nowLine: { flex: 1, height: 2, borderRadius: 1, backgroundColor: colors.accent, opacity: 0.6 },
});
