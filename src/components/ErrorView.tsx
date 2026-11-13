import type { ErrorBoundaryProps } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

/** expo-router ErrorBoundary: shows the error instead of the app closing, with a retry. */
export function ErrorView({ error, retry }: ErrorBoundaryProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.icon}>
        <Icon name="alert-circle-outline" size={40} color={colors.danger} />
      </View>
      <Text variant="title" align="center">
        Something went wrong
      </Text>
      <Text variant="body" color={colors.textDim} align="center">
        Your trips are safe. Tap retry, and if it keeps happening share the message below.
      </Text>
      <ScrollView style={styles.box} contentContainerStyle={styles.boxContent}>
        <Text variant="small" color={colors.textDim} selectable style={styles.mono}>
          {error?.message ?? String(error)}
          {error?.stack ? `\n\n${error.stack.split('\n').slice(0, 8).join('\n')}` : ''}
        </Text>
      </ScrollView>
      <Button label="Retry" icon="refresh" onPress={retry} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', gap: space.md, paddingHorizontal: space.xl },
  icon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerSoft },
  box: { alignSelf: 'stretch', maxHeight: 220, borderRadius: radius.md, backgroundColor: colors.surface },
  boxContent: { padding: space.lg },
  mono: { fontFamily: 'monospace' },
  btn: { alignSelf: 'stretch' },
});
