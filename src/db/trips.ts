import type { Trip, TripInput } from '@/types';
import { getDb } from './client';

interface TripRow {
  id: number;
  title: string;
  destination: string;
  start_date: number;
  end_date: number;
  cover: string | null;
  notes: string;
  created_at: number;
}

const mapTrip = (r: TripRow): Trip => ({
  id: r.id,
  title: r.title,
  destination: r.destination,
  startDate: r.start_date,
  endDate: r.end_date,
  cover: r.cover,
  notes: r.notes,
  createdAt: r.created_at,
});

export async function listTrips(): Promise<Trip[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TripRow>('SELECT * FROM trips ORDER BY start_date ASC, id ASC');
  return rows.map(mapTrip);
}

export async function getTrip(id: number): Promise<Trip | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?', [id]);
  return row ? mapTrip(row) : null;
}

export async function insertTrip(t: TripInput): Promise<Trip> {
  const db = await getDb();
  const res = await db.runAsync(
    'INSERT INTO trips (title, destination, start_date, end_date, cover, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [t.title, t.destination, t.startDate, t.endDate, t.cover, t.notes, Date.now()],
  );
  const trip = await getTrip(res.lastInsertRowId);
  if (!trip) throw new Error('Trip insert failed');
  return trip;
}

export async function updateTrip(id: number, t: TripInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE trips SET title = ?, destination = ?, start_date = ?, end_date = ?, cover = ?, notes = ? WHERE id = ?',
    [t.title, t.destination, t.startDate, t.endDate, t.cover, t.notes, id],
  );
}

/** Deletes the trip (cascades to chapters + memories). Returns photo filenames that should be removed from disk. */
export async function deleteTrip(id: number): Promise<string[]> {
  const db = await getDb();
  const files = await db.getAllAsync<{ file: string }>(
    `SELECT file FROM memories WHERE trip_id = ?
     UNION ALL SELECT cover AS file FROM trips WHERE id = ? AND cover IS NOT NULL`,
    [id, id],
  );
  await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
  return files.map((f) => f.file);
}
