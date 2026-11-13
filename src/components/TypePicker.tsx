import { ScrollView, StyleSheet } from 'react-native';
import { CHAPTER_TYPE_ORDER, CHAPTER_TYPES, tint } from '@/theme/chapterTypes';
import { colors, radius, space } from '@/theme/tokens';
import type { ChapterType } from '@/types';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface Props {
  value: ChapterType;
  onChange: (t: ChapterType) => void;
}

export function TypePicker({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
      {CHAPTER_TYPE_ORDER.map((t) => {
        const m = CHAPTER_TYPES[t];
        const on = t === value;
        return (
          <PressableScale
            key={t}
            haptic="select"
            scaleTo={0.9}
            onPress={() => onChange(t)}
            style={[styles.chip, { backgroundColor: on ? tint(m.color, 0.18) : colors.surfaceAlt, borderColor: on ? m.color : colors.border }]}
          >
            <Icon name={m.icon} size={24} color={on ? m.color : colors.textDim} />
            <Text variant="label" color={on ? m.color : colors.textFaint}>
              {m.label}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.sm, paddingHorizontal: space.xl },
  chip: {
    width: 78,
    height: 78,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs + 2,
  },
});
