import { StyleSheet, View } from 'react-native';
import { CHAPTER_TYPES, tint } from '@/theme/chapterTypes';
import { colors } from '@/theme/tokens';
import type { ChapterType } from '@/types';
import { Icon } from './Icon';

interface Props {
  type: ChapterType;
  size?: number;
  done?: boolean;
  /** Solid fill (used for timeline nodes). */
  solid?: boolean;
}

export function TypeIcon({ type, size = 40, done, solid }: Props) {
  const m = CHAPTER_TYPES[type];
  const bg = solid ? (done ? colors.surfaceAlt : m.color) : tint(m.color, 0.16);
  const fg = solid ? (done ? m.color : colors.bg) : m.color;
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: tint(m.color, solid ? 1 : 0.45) },
      ]}
    >
      <Icon name={done ? 'check-bold' : m.icon} size={size * 0.5} color={fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
});
