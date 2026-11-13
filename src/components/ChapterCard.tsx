import type { ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { daysBetween, formatDuration, formatTime } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useChapters } from '@/store/chapters';
import { CHAPTER_TYPES, tint } from '@/theme/chapterTypes';
import { colors, radius, space, stagger } from '@/theme/tokens';
import type { Chapter } from '@/types';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { TypeIcon } from './TypeIcon';

export const RAIL = 56;
export const rowLayout = LinearTransition.springify().damping(20).stiffness(180);

interface Props {
  chapter: Chapter;
  index: number;
  expanded: boolean;
  canUp: boolean;
  canDown: boolean;
  onToggle: () => void;
  onEdit: () => void;
  /** Extra content shown when expanded (memory strip). */
  children?: ReactNode;
}

export function ChapterCard({ chapter: c, index, expanded, canUp, canDown, onToggle, onEdit, children }: Props) {
  const toggleDone = useChapters((s) => s.toggleDone);
  const move = useChapters((s) => s.move);
  const remove = useChapters((s) => s.remove);
  const m = CHAPTER_TYPES[c.type];

  const overnight = c.endAt ? daysBetween(c.startAt, c.endAt) : 0;
  const time = c.endAt ? `${formatTime(c.startAt)} → ${formatTime(c.endAt)}${overnight > 0 ? ` +${overnight}d` : ''}` : formatTime(c.startAt);
  const hasRoute = m.route && (c.fromPlace || c.toPlace);

  const confirmDelete = () => {
    haptics.warn();
    Alert.alert('Delete chapter?', `"${c.title}" and its memories will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(c).catch(() => {}) },
    ]);
  };

  return (
    <Animated.View entering={FadeInDown.delay(stagger(index, 55) + 260).springify().damping(18)} layout={rowLayout} style={styles.row}>
      <View style={styles.rail}>
        <Animated.View key={String(c.done)} entering={ZoomIn.springify().damping(12)}>
          <TypeIcon type={c.type} size={40} solid done={c.done} />
        </Animated.View>
      </View>
      <PressableScale
        haptic="select"
        scaleTo={0.98}
        onPress={onToggle}
        onLongPress={onEdit}
        style={[styles.card, { borderColor: expanded ? tint(m.color, 0.55) : colors.border }, c.done && !expanded && styles.doneCard]}
      >
        <View style={styles.top}>
          <Text variant="label" color={m.color}>
            {m.label} · {time}
          </Text>
          {c.bookingRef && !expanded ? <Icon name="ticket-confirmation-outline" size={16} color={colors.textFaint} /> : null}
        </View>
        <Text variant="heading" color={c.done ? colors.textDim : colors.text} style={c.done && styles.strike} numberOfLines={expanded ? undefined : 2}>
          {c.title}
        </Text>
        {hasRoute ? (
          <View style={styles.route}>
            <Text variant="small" color={colors.textDim} numberOfLines={1} style={styles.shrink}>
              {c.fromPlace || '—'}
            </Text>
            <Icon name="arrow-right-thin" size={18} color={m.color} />
            <Text variant="small" color={colors.text} numberOfLines={1} style={styles.shrink}>
              {c.toPlace || '—'}
            </Text>
          </View>
        ) : null}

        {expanded && (
          <Animated.View entering={FadeIn.duration(240)} exiting={FadeOut.duration(120)} style={styles.details}>
            {c.bookingRef ? <Info icon="ticket-confirmation-outline" label={c.type === 'train' ? 'PNR' : 'Booking'} value={c.bookingRef} /> : null}
            {c.endAt ? <Info icon="timer-outline" label="Duration" value={formatDuration(c.endAt - c.startAt)} /> : null}
            {c.notes ? (
              <Text variant="body" color={colors.textDim}>
                {c.notes}
              </Text>
            ) : null}
            {children}
            <View style={styles.actions}>
              <PressableScale
                haptic="success"
                onPress={() => toggleDone(c)}
                style={[styles.doneBtn, { backgroundColor: c.done ? tint(colors.success, 0.16) : colors.surfaceAlt }]}
              >
                <Icon name={c.done ? 'check-circle' : 'checkbox-blank-circle-outline'} size={20} color={c.done ? colors.success : colors.textDim} />
                <Text variant="small" color={c.done ? colors.success : colors.text} style={styles.bold}>
                  {c.done ? 'Done' : 'Mark done'}
                </Text>
              </PressableScale>
              <View style={styles.spacer} />
              <IconButton icon="arrow-up" size={38} disabled={!canUp} haptic="select" onPress={() => move(c, -1)} />
              <IconButton icon="arrow-down" size={38} disabled={!canDown} haptic="select" onPress={() => move(c, 1)} />
              <IconButton icon="pencil-outline" size={38} onPress={onEdit} />
              <IconButton icon="trash-can-outline" size={38} color={colors.danger} background={colors.dangerSoft} onPress={confirmDelete} />
            </View>
          </Animated.View>
        )}
      </PressableScale>
    </Animated.View>
  );
}

function Info({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Icon name={icon} size={16} color={colors.textFaint} />
      <Text variant="label" color={colors.textFaint}>
        {label}
      </Text>
      <Text variant="body" selectable style={styles.mono}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.md },
  rail: { width: RAIL, alignItems: 'center', paddingTop: space.md },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.xs + 2,
    borderWidth: 1,
  },
  doneCard: { opacity: 0.62 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strike: { textDecorationLine: 'line-through' },
  route: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  shrink: { flexShrink: 1 },
  details: { gap: space.md, marginTop: space.sm },
  info: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  mono: { fontFamily: 'monospace', fontWeight: '700', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    paddingHorizontal: space.md,
    height: 38,
    borderRadius: radius.pill,
  },
  bold: { fontWeight: '800' },
  spacer: { flex: 1 },
});
