import { router } from 'expo-router';
import { TripForm } from '@/components/TripForm';
import { haptics } from '@/lib/haptics';
import { useTrips } from '@/store/trips';

export default function NewTrip() {
  const create = useTrips((s) => s.create);
  return (
    <TripForm
      heading="New trip"
      submitLabel="Create trip"
      onSubmit={async (fields, cover) => {
        const trip = await create(fields, typeof cover === 'string' && cover !== 'keep' ? cover : null);
        haptics.success();
        router.replace(`/trip/${trip.id}`);
      }}
    />
  );
}
