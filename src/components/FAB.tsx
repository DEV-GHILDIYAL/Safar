import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface Props {
  onPress: () => void;
  icon?: IconName;
  label?: string;
  /** Hide the label (e.g. while scrolling down); animates width. */
  collapsed?: boolean;
  /** Extra bottom offset, e.g. tab bar space on tab screens (replaces the safe-area inset). */
  bottomOffset?: number;
}

export function FAB({ onPress, icon = 'plus', label, collapsed, bottomOffset }: Props) {
  const insets = useSafeAreaInsets();
  const showLabel = !!label && !collapsed;
  return (
    <Animated.View
      entering={ZoomIn.delay(250).springify()}
      layout={LinearTransition.springify().damping(18)}
      style={[styles.wrap, { bottom: (bottomOffset ?? insets.bottom) + space.lg }]}
    >
      <PressableScale haptic="press" scaleTo={0.9} onPress={onPress} style={[styles.fab, showLabel ? styles.extended : null]} accessibilityLabel={label}>
        <Icon name={icon} size={26} color={colors.onAccent} />
        {showLabel ? (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(100)}>
            <Text variant="body" color={colors.onAccent} style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </Animated.View>
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
