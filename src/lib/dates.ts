import type { Trip, TripStatus } from '@/types';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function addDays(ms: number, days: number): number {
  const d = new Date(ms);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Whole calendar days from a to b (DST safe). */
export function daysBetween(a: number, b: number): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
}

export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "Wed, 14 Nov" (+ year when asked). */
export function formatDate(ms: number, withYear = false): string {
  const d = new Date(ms);
  const base = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return withYear ? `${base} ${d.getFullYear()}` : base;
}

/** "14 Nov" */
export function formatShort(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "14 – 18 Nov 2026", "28 Nov – 2 Dec 2026", "30 Dec 2026 – 3 Jan 2027" */
export function formatRange(start: number, end: number): string {
  const a = new Date(start);
  const b = new Date(end);
  if (a.getFullYear() !== b.getFullYear()) return `${formatShort(start)} ${a.getFullYear()} – ${formatShort(end)} ${b.getFullYear()}`;
  if (a.getMonth() !== b.getMonth()) return `${formatShort(start)} – ${formatShort(end)} ${b.getFullYear()}`;
  if (a.getDate() === b.getDate()) return `${formatShort(start)} ${b.getFullYear()}`;
  return `${a.getDate()} – ${formatShort(end)} ${b.getFullYear()}`;
}

/** 24h "08:45". */
export function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function relativeDay(ms: number, now = Date.now()): string {
  const diff = daysBetween(now, ms);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return formatDate(ms);
}

export function tripStatus(trip: Pick<Trip, 'startDate' | 'endDate'>, now = Date.now()): TripStatus {
  const today = startOfDay(now);
  if (today < startOfDay(trip.startDate)) return 'upcoming';
  if (today > startOfDay(trip.endDate)) return 'past';
  return 'current';
}

export function tripLength(trip: Pick<Trip, 'startDate' | 'endDate'>): number {
  return daysBetween(trip.startDate, trip.endDate) + 1;
}

/** Compact countdown: "now", "45m", "3h 20m", "2d 4h". */
export function countdown(target: number, now = Date.now()): string {
  const diff = target - now;
  if (diff <= 0) return 'now';
  const mins = Math.floor(diff / MINUTE);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/** Duration like "45m", "2h 30m", "1d 3h". */
export function formatDuration(ms: number): string {
  const mins = Math.round(ms / MINUTE);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return mins % 60 ? `${h}h ${mins % 60}m` : `${h}h`;
  return h % 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${Math.floor(h / 24)}d`;
}

/** Keeps the calendar day of `dateMs` and the clock time of `timeMs`. */
export function withTime(dateMs: number, timeMs: number): number {
  const d = new Date(dateMs);
  const t = new Date(timeMs);
  d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  return d.getTime();
}

/** Parses EXIF "YYYY:MM:DD HH:MM:SS" into epoch ms, or null. */
export function parseExifDate(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const m = value.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}
