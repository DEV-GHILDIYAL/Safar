import type { Chapter, ChapterInput, ChapterType } from '@/types';
import { getDb } from './client';

interface ChapterRow {
  id: number;
  trip_id: number;
  type: string;
  title: string;
  start_at: number;
  end_at: number | null;
  from_place: string;
  to_place: string;
  booking_ref: string;
  notes: string;
  done: number;
  sort_order: number;
  created_at: number;
}

const mapChapter = (r: ChapterRow): Chapter => ({
  id: r.id,
  tripId: r.trip_id,
  type: r.type as ChapterType,
  title: r.title,
  startAt: r.start_at,
  endAt: r.end_at,
  fromPlace: r.from_place,
  toPlace: r.to_place,
  bookingRef: r.booking_ref,
  notes: r.notes,
  done: r.done === 1,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

export async function listChapters(tripId: number): Promise<Chapter[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ChapterRow>(
    'SELECT * FROM chapters WHERE trip_id = ? ORDER BY start_at ASC, sort_order ASC',
    [tripId],
  );
  return rows.map(mapChapter);
}

async function getChapter(id: number): Promise<Chapter> {
  const db = await getDb();
  const row = await db.getFirstAsync<ChapterRow>('SELECT * FROM chapters WHERE id = ?', [id]);
  if (!row) throw new Error(`Chapter ${id} not found`);
  return mapChapter(row);
}

/** sort_order starts as start_at so new chapters land in time order; manual reorder swaps values. */
export async function insertChapter(c: ChapterInput): Promise<Chapter> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO chapters (trip_id, type, title, start_at, end_at, from_place, to_place, booking_ref, notes, done, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [c.tripId, c.type, c.title, c.startAt, c.endAt, c.fromPlace, c.toPlace, c.bookingRef, c.notes, c.startAt, Date.now()],
  );
  return getChapter(res.lastInsertRowId);
}

export async function updateChapter(id: number, c: ChapterInput, sortOrder: number): Promise<Chapter> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE chapters SET type = ?, title = ?, start_at = ?, end_at = ?, from_place = ?, to_place = ?,
       booking_ref = ?, notes = ?, sort_order = ? WHERE id = ?`,
    [c.type, c.title, c.startAt, c.endAt, c.fromPlace, c.toPlace, c.bookingRef, c.notes, sortOrder, id],
  );
  return getChapter(id);
}

export async function setChapterDone(id: number, done: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE chapters SET done = ? WHERE id = ?', [done ? 1 : 0, id]);
}

export async function setSortOrders(pairs: { id: number; sortOrder: number }[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const p of pairs) {
      await db.runAsync('UPDATE chapters SET sort_order = ? WHERE id = ?', [p.sortOrder, p.id]);
    }
  });
}

/** Returns memory filenames to remove from disk. */
export async function deleteChapter(id: number): Promise<string[]> {
  const db = await getDb();
  const files = await db.getAllAsync<{ file: string }>('SELECT file FROM memories WHERE chapter_id = ?', [id]);
  await db.runAsync('DELETE FROM chapters WHERE id = ?', [id]);
  return files.map((f) => f.file);
}
