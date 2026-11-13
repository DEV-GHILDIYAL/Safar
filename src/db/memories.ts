import type { Memory } from '@/types';
import { getDb } from './client';

interface MemoryRow {
  id: number;
  chapter_id: number;
  trip_id: number;
  file: string;
  caption: string;
  taken_at: number;
  created_at: number;
}

const mapMemory = (r: MemoryRow): Memory => ({
  id: r.id,
  chapterId: r.chapter_id,
  tripId: r.trip_id,
  file: r.file,
  caption: r.caption,
  takenAt: r.taken_at,
  createdAt: r.created_at,
});

export async function listMemoriesByTrip(tripId: number): Promise<Memory[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MemoryRow>(
    'SELECT * FROM memories WHERE trip_id = ? ORDER BY taken_at ASC, id ASC',
    [tripId],
  );
  return rows.map(mapMemory);
}

export async function listAllMemories(): Promise<Memory[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MemoryRow>('SELECT * FROM memories ORDER BY taken_at ASC, id ASC');
  return rows.map(mapMemory);
}

export async function insertMemories(
  items: { chapterId: number; tripId: number; file: string; takenAt: number }[],
): Promise<Memory[]> {
  const db = await getDb();
  const ids: number[] = [];
  await db.withTransactionAsync(async () => {
    for (const m of items) {
      const res = await db.runAsync(
        'INSERT INTO memories (chapter_id, trip_id, file, caption, taken_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [m.chapterId, m.tripId, m.file, '', m.takenAt, Date.now()],
      );
      ids.push(res.lastInsertRowId);
    }
  });
  if (!ids.length) return [];
  const rows = await db.getAllAsync<MemoryRow>(
    `SELECT * FROM memories WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids,
  );
  return rows.map(mapMemory);
}

export async function updateMemoryCaption(id: number, caption: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE memories SET caption = ? WHERE id = ?', [caption, id]);
}

export async function deleteMemory(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM memories WHERE id = ?', [id]);
}
