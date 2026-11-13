import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { StyleSheet, View } from 'react-native';
import { formatDate, formatTime } from '@/lib/dates';
import { colors, radius, space } from '@/theme/tokens';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface Props {
  label: string;
  /** epoch ms, or null for "not set" (only with `onClear`). */
  value: number | null;
  mode?: 'date' | 'time';
  onChange: (ms: number) => void;
  /** Shows a clear button and makes the field optional. */
  onClear?: () => void;
  placeholder?: string;
  /** Used as the picker's starting value when `value` is null. */
  fallback?: number;
}

/** Tappable field that opens the native Android date or time picker. */
export function DateField({ label, value, mode = 'date', onChange, onClear, placeholder = 'Not set', fallback }: Props) {
  const open = () => {
    DateTimePickerAndroid.open({
      value: new Date(value ?? fallback ?? Date.now()),
      mode,
      is24Hour: true,
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChange(date.getTime());
      },
    });
  };
  const display = value == null ? placeholder : mode === 'date' ? formatDate(value, true) : formatTime(value);
  return (
    <View style={styles.wrap}>
      <Text variant="label" color={colors.textFaint}>
        {label}
      </Text>
      <PressableScale haptic="tap" scaleTo={0.97} onPress={open} style={styles.box}>
        <Icon name={mode === 'date' ? 'calendar-blank-outline' : 'clock-outline'} size={20} color={colors.accent} />
        <Text variant="body" color={value == null ? colors.textFaint : colors.text} style={styles.value} numberOfLines={1}>
          {display}
        </Text>
        {onClear && value != null ? (
          <IconButton icon="close" size={28} background="transparent" color={colors.textFaint} onPress={onClear} />
        ) : null}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, flex: 1 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 54,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { flex: 1, fontWeight: '700' },
});
