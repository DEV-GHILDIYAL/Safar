import { StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface Props {
  onPress: () => void;
  icon?: IconName;
  label?: string;
}

export function FAB({ onPress, icon = 'plus', label }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View entering={ZoomIn.delay(250).springify()} style={[styles.wrap, { bottom: insets.bottom + space.xl }]}>
      <PressableScale haptic="press" scaleTo={0.9} onPress={onPress} style={[styles.fab, label ? styles.extended : null]}>
        <Icon name={icon} size={26} color={colors.onAccent} />
        {label ? (
          <Text variant="body" color={colors.onAccent} style={styles.label}>
            {label}
          </Text>
        ) : null}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: space.xl },
  fab: {
    height: 64,
    minWidth: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 10,
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  extended: { paddingHorizontal: space.xl, gap: space.sm },
  label: { fontWeight: '800' },
});
