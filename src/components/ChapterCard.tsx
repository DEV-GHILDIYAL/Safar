import type { ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { daysBetween, formatDuration, formatTime } from '@/lib/dates';
import { haptics, type HapticKind } from '@/lib/haptics';
import { useChapters } from '@/store/chapters';
import { CHAPTER_TYPES, tint } from '@/theme/chapterTypes';
import { colors, radius, space, stagger } from '@/theme/tokens';
import type { Chapter } from '@/types';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { TypeIcon } from './TypeIcon';

export const RAIL = 56;
export const rowLayout = LinearTransition.duration(220);

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
    <Animated.View entering={FadeInDown.delay(stagger(index, 55) + 260).duration(320)} layout={rowLayout} style={styles.row}>
      <View style={styles.rail}>
        <Animated.View key={String(c.done)} entering={FadeIn.duration(200)}>
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
          <Text variant="label" color={m.color} numberOfLines={1} style={styles.shrink}>
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
            {/* Equal-width toolbar: always fits the card, whatever the screen width. */}
            <View style={styles.actions}>
              <Action
                icon={c.done ? 'check-circle' : 'checkbox-blank-circle-outline'}
                label={c.done ? 'Done' : 'Mark done'}
                color={c.done ? colors.success : colors.text}
                active={c.done}
                haptic="success"
                onPress={() => toggleDone(c)}
              />
              <Action icon="arrow-up" label="Up" disabled={!canUp} onPress={() => move(c, -1)} />
              <Action icon="arrow-down" label="Down" disabled={!canDown} onPress={() => move(c, 1)} />
              <Action icon="pencil-outline" label="Edit" onPress={onEdit} />
              <Action icon="trash-can-outline" label="Delete" color={colors.danger} onPress={confirmDelete} />
            </View>
          </Animated.View>
        )}
      </PressableScale>
    </Animated.View>
  );
}

interface ActionProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  active?: boolean;
  haptic?: HapticKind;
}

function Action({ icon, label, onPress, color = colors.text, disabled, active, haptic = 'select' }: ActionProps) {
  return (
    <PressableScale
      haptic={disabled ? undefined : haptic}
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.94}
      accessibilityLabel={label}
      style={[styles.action, active && { backgroundColor: tint(colors.success, 0.16) }, disabled && styles.disabled]}
    >
      <Icon name={icon} size={20} color={color} />
      <Text variant="label" color={active ? colors.success : colors.textFaint} numberOfLines={1} style={styles.actionLabel}>
        {label}
      </Text>
    </PressableScale>
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
  mono: { flexShrink: 1, fontFamily: 'monospace', fontWeight: '700', letterSpacing: 0.5 },
  actions: {
    flexDirection: 'row',
    gap: space.xs,
    marginTop: space.xs,
    padding: space.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  action: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: space.sm, borderRadius: radius.sm },
  actionLabel: { fontSize: 9, letterSpacing: 0.4 },
  disabled: { opacity: 0.3 },
});
