import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { HOUR, tripStatus, withTime } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { orderedChapters } from '@/lib/timeline';
import { useChapters } from '@/store/chapters';
import { CHAPTER_TYPES } from '@/theme/chapterTypes';
import { colors, space } from '@/theme/tokens';
import type { Chapter, ChapterType, Trip } from '@/types';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { DateField } from './DateField';
import { Text } from './Text';
import { TextField } from './TextField';
import { TypePicker } from './TypePicker';

interface Props {
  visible: boolean;
  onClose: () => void;
  trip: Trip;
  chapters: Chapter[];
  /** null = create new chapter. */
  chapter: Chapter | null;
}

export function ChapterSheet({ visible, onClose, trip, chapters, chapter }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Modal unmounts children when hidden, so the form state resets on every open. */}
      <ChapterForm key={chapter?.id ?? 'new'} trip={trip} chapters={chapters} chapter={chapter} onDone={onClose} />
    </BottomSheet>
  );
}

/** Parent keeps `chapter` stable while closing so the exit animation shows the same form. */
export function useChapterSheet() {
  const [state, setState] = useState<{ visible: boolean; chapter: Chapter | null }>({ visible: false, chapter: null });
  return {
    ...state,
    openNew: () => setState({ visible: true, chapter: null }),
    openEdit: (chapter: Chapter) => setState({ visible: true, chapter }),
    close: () => setState((s) => ({ ...s, visible: false })),
  };
}

function defaultStart(trip: Trip, chapters: Chapter[]): number {
  const now = Date.now();
  if (tripStatus(trip, now) === 'current') {
    const d = new Date(now);
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.getTime();
  }
  const last = orderedChapters(chapters).at(-1);
  if (last) return last.endAt ?? last.startAt + HOUR;
  return withTime(trip.startDate, new Date(2000, 0, 1, 9, 0).getTime());
}

function ChapterForm({ trip, chapters, chapter, onDone }: { trip: Trip; chapters: Chapter[]; chapter: Chapter | null; onDone: () => void }) {
  const createChapter = useChapters((s) => s.create);
  const updateChapter = useChapters((s) => s.update);
  const [type, setType] = useState<ChapterType>(chapter?.type ?? 'activity');
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [start, setStart] = useState(() => chapter?.startAt ?? defaultStart(trip, chapters));
  const [end, setEnd] = useState<number | null>(chapter?.endAt ?? null);
  const [fromPlace, setFrom] = useState(chapter?.fromPlace ?? '');
  const [toPlace, setTo] = useState(chapter?.toPlace ?? '');
  const [bookingRef, setRef] = useState(chapter?.bookingRef ?? '');
  const [notes, setNotes] = useState(chapter?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const meta = CHAPTER_TYPES[type];
  const autoTitle = meta.route && toPlace.trim() ? `${meta.label} to ${toPlace.trim()}` : meta.label;

  const save = async () => {
    if (end != null && end < start) {
      haptics.warn();
      Alert.alert('Check the times', 'The end is before the start.');
      return;
    }
    setSaving(true);
    const input = {
      tripId: trip.id,
      type,
      title: title.trim() || autoTitle,
      startAt: start,
      endAt: end,
      fromPlace: meta.route ? fromPlace.trim() : '',
      toPlace: meta.route ? toPlace.trim() : '',
      bookingRef: bookingRef.trim(),
      notes: notes.trim(),
    };
    try {
      if (chapter) await updateChapter(chapter, input);
      else await createChapter(input);
      haptics.success();
      onDone();
    } catch (e) {
      setSaving(false);
      Alert.alert('Could not save', String(e));
    }
  };

  return (
    <>
      <View style={styles.head}>
        <Text variant="title">{chapter ? 'Edit chapter' : 'New chapter'}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
        <TypePicker value={type} onChange={setType} />
        <View style={styles.fields}>
          <TextField label="Title" value={title} onChangeText={setTitle} placeholder={autoTitle} icon={meta.icon} />
          <View style={styles.row}>
            <DateField label="Date" value={start} onChange={(v) => setStart(withTime(v, start))} />
            <DateField label="Starts" mode="time" value={start} onChange={(v) => setStart(withTime(start, v))} />
          </View>
          <View style={styles.row}>
            <DateField
              label="End date"
              value={end}
              fallback={start}
              placeholder="Optional"
              onChange={(v) => setEnd(withTime(v, end ?? start + HOUR))}
              onClear={() => setEnd(null)}
            />
            <DateField
              label="Ends"
              mode="time"
              value={end}
              fallback={start + HOUR}
              placeholder="—"
              onChange={(v) => setEnd(withTime(end ?? start, v))}
            />
          </View>
          {meta.route && (
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField label="From" value={fromPlace} onChangeText={setFrom} placeholder="New Delhi" />
              </View>
              <View style={styles.flex}>
                <TextField label="To" value={toPlace} onChangeText={setTo} placeholder="Jaipur" />
              </View>
            </View>
          )}
          <TextField
            label={type === 'train' ? 'PNR' : 'Booking ref'}
            icon="ticket-confirmation-outline"
            value={bookingRef}
            onChangeText={setRef}
            placeholder={type === 'train' ? '10-digit PNR' : 'Confirmation number'}
            autoCapitalize="characters"
          />
          <TextField label="Notes" icon="text" value={notes} onChangeText={setNotes} placeholder="Seat, address, what to remember…" multiline />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button label={chapter ? 'Save chapter' : 'Add chapter'} icon="check" onPress={save} loading={saving} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.xl, paddingBottom: space.md },
  body: { gap: space.xl, paddingBottom: space.xl },
  fields: { gap: space.lg, paddingHorizontal: space.xl },
  row: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
  footer: { paddingHorizontal: space.xl, paddingVertical: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
