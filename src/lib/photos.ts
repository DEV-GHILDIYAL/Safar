import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { parseExifDate } from './dates';

const PHOTO_DIR = 'photos';

function photosDir(): Directory {
  const dir = new Directory(Paths.document, PHOTO_DIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Resolves a stored filename to a file:// URI. */
export function photoUri(file: string): string {
  return new File(Paths.document, PHOTO_DIR, file).uri;
}

/** Copies a picked/captured image into the app's photos dir; returns the new filename. */
export async function savePhoto(sourceUri: string): Promise<string> {
  const ext = sourceUri.split('?')[0].match(/\.(jpe?g|png|webp|heic)$/i)?.[1]?.toLowerCase() ?? 'jpg';
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dest = new File(photosDir(), name);
  await new File(sourceUri).copy(dest);
  return name;
}

export function deletePhoto(file: string | null | undefined): void {
  if (!file) return;
  try {
    const f = new File(Paths.document, PHOTO_DIR, file);
    if (f.exists) f.delete();
  } catch {
    // Missing files are fine.
  }
}

export interface PickedPhoto {
  uri: string;
  takenAt: number;
}

export type PhotoSource = 'camera' | 'library';

/** Asks permission, opens camera or gallery, returns picked images (empty when cancelled/denied). */
export async function pickPhotos(source: PhotoSource, multiple = false): Promise<PickedPhoto[]> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo'} access in Settings to add photos.`);
    return [];
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.85,
    exif: source === 'library',
    allowsMultipleSelection: source === 'library' && multiple,
  };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return [];
  const now = Date.now();
  return result.assets.map((a) => ({
    uri: a.uri,
    takenAt: parseExifDate(a.exif?.DateTimeOriginal ?? a.exif?.DateTime) ?? now,
  }));
}
