import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useTrip } from '@/store/trips';
import { space } from '@/theme/tokens';

// Placeholder until the timeline lands in phase 2.
export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTrip(Number(id));
  if (!trip) return <Screen />;
  return (
    <Screen>
      <View style={styles.wrap}>
        <Text variant="display">{trip.title}</Text>
        <Button label="Edit" variant="secondary" onPress={() => router.push(`/trip/${trip.id}/edit`)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ wrap: { padding: space.xl, gap: space.lg } });
