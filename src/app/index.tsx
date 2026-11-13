import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { colors, space } from '@/theme/tokens';

export default function Home() {
  return (
    <Screen>
      <View style={styles.wrap}>
        <Text variant="label" color={colors.accent}>
          Safar
        </Text>
        <Text variant="display">Every trip is a story.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: space.xl, gap: space.sm },
});
