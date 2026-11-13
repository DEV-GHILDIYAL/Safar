import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDays, startOfDay } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { pickPhotos, type PhotoSource } from '@/lib/photos';
import type { CoverChange, TripFields } from '@/store/trips';
import { colors, radius, space, stagger } from '@/theme/tokens';
import type { Trip } from '@/types';
import { Button } from './Button';
import { CoverImage } from './CoverImage';
import { DateField } from './DateField';
import { IconButton } from './IconButton';
import { Text } from './Text';
import { TextField } from './TextField';

interface Props {
  heading: string;
  initial?: Trip;
  submitLabel: string;
  onSubmit: (fields: TripFields, cover: CoverChange) => Promise<void>;
  onDelete?: () => void;
}

export function TripForm({ heading, initial, submitLabel, onSubmit, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const today = startOfDay(Date.now());
  const [title, setTitle] = useState(initial?.title ?? '');
  const [destination, setDestination] = useState(initial?.destination ?? '');
  const [start, setStart] = useState(initial?.startDate ?? addDays(today, 7));
  const [end, setEnd] = useState(initial?.endDate ?? addDays(today, 10));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [cover, setCover] = useState<CoverChange>('keep');
  const [saving, setSaving] = useState(false);

  const previewUri = typeof cover === 'string' && cover !== 'keep' ? cover : null;
  const previewFile = cover === 'keep' ? initial?.cover : null;
  const hasCover = !!(previewUri || previewFile);

  const pick = async (source: PhotoSource) => {
    const [p] = await pickPhotos(source);
    if (p) {
      haptics.select();
      setCover(p.uri);
    }
  };

  const submit = async () => {
    if (!title.trim()) {
      haptics.warn();
      Alert.alert('Name your trip', 'Give this story a title first.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit(
        { title: title.trim(), destination: destination.trim(), startDate: startOfDay(start), endDate: startOfDay(end), notes: notes.trim() },
        cover,
      );
    } catch (e) {
      Alert.alert('Could not save', String(e));
      setSaving(false);
    }
  };

  const fields = [
    <TextField key="t" label="Trip title" icon="book-open-page-variant-outline" value={title} onChangeText={setTitle} placeholder="Monsoon in Kerala" autoFocus={!initial} />,
    <TextField key="d" label="Destination" icon="map-marker-outline" value={destination} onChangeText={setDestination} placeholder="Kochi, Munnar, Alleppey" />,
    <View key="dates" style={styles.dates}>
      <DateField
        label="Starts"
        value={start}
        onChange={(v) => {
          const s = startOfDay(v);
          setStart(s);
          if (end < s) setEnd(s);
        }}
      />
      <DateField
        label="Ends"
        value={end}
        onChange={(v) => {
          const e = startOfDay(v);
          setEnd(e < start ? start : e);
        }}
      />
    </View>,
    <TextField key="n" label="Notes" icon="text" value={notes} onChangeText={setNotes} placeholder="Packing list, who's coming, budget…" multiline />,
  ];

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <IconButton icon="close" onPress={() => router.back()} />
        <Text variant="heading">{heading}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(320)}>
          <CoverImage uri={previewUri} file={previewFile} seed={initial?.id ?? 0} scrim={0.6} style={styles.cover}>
            <View style={styles.coverActions}>
              <Button compact variant="secondary" icon="image-outline" label="Gallery" onPress={() => pick('library')} />
              <Button compact variant="secondary" icon="camera-outline" label="Camera" onPress={() => pick('camera')} />
              {hasCover && <IconButton icon="trash-can-outline" size={40} color={colors.danger} onPress={() => setCover(null)} />}
            </View>
          </CoverImage>
        </Animated.View>
        {fields.map((f, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(stagger(i + 1, 50)).duration(320)}>
            {f}
          </Animated.View>
        ))}
        {onDelete && <Button variant="danger" icon="trash-can-outline" label="Delete trip" onPress={onDelete} />}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button label={submitLabel} icon="check" onPress={submit} loading={saving} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  content: { padding: space.xl, gap: space.xl, paddingBottom: space.xxxl },
  cover: { height: 190, borderRadius: radius.lg, justifyContent: 'flex-end' },
  coverActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, padding: space.md, alignItems: 'center' },
  dates: { flexDirection: 'row', gap: space.md },
  footer: { paddingHorizontal: space.xl, paddingTop: space.md, backgroundColor: colors.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
