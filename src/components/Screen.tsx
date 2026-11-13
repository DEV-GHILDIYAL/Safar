import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

interface Props extends ViewProps {
  /** Pad for the status bar. Disable for screens with full-bleed headers. */
  safeTop?: boolean;
}

export function Screen({ safeTop = true, style, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return <View {...rest} style={[styles.root, safeTop && { paddingTop: insets.top }, style]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
