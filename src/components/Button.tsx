import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.accent, fg: colors.onAccent },
  secondary: { bg: colors.surfaceAlt, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.textDim },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function Button({ label, onPress, icon, variant = 'primary', disabled, loading, style, compact }: Props) {
  const p = palette[variant];
  return (
    <PressableScale
      haptic="tap"
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        compact && styles.compact,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', opacity: disabled ? 0.45 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={compact ? 18 : 20} color={p.fg} />}
          <Text variant={compact ? 'small' : 'body'} color={p.fg} style={styles.label}>
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  compact: { height: 40, paddingHorizontal: space.lg, borderRadius: radius.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { fontWeight: '800' },
});
