import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { TripForm } from '@/components/TripForm';
import { haptics } from '@/lib/haptics';
import { useTrip, useTrips } from '@/store/trips';

export default function EditTrip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const trip = useTrip(tripId);
  const update = useTrips((s) => s.update);
  const remove = useTrips((s) => s.remove);

  if (!trip) return <Screen />;

  const confirmDelete = () => {
    haptics.warn();
    Alert.alert('Delete trip?', `"${trip.title}" and all its chapters and memories will be removed. This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove(tripId);
          router.dismissAll();
        },
      },
    ]);
  };

  return (
    <TripForm
      heading="Edit trip"
      submitLabel="Save changes"
      initial={trip}
      onDelete={confirmDelete}
      onSubmit={async (fields, cover) => {
        await update(tripId, fields, cover);
        haptics.success();
        router.back();
      }}
    />
  );
}
