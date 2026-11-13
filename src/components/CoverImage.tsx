import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { photoUri } from '@/lib/photos';
import { colors } from '@/theme/tokens';
import { Icon } from './Icon';

const GRADIENTS: readonly (readonly [string, string])[] = [
  ['#FF7A3D', '#5B1A3A'],
  ['#4F8CFF', '#1B1446'],
  ['#2BC48A', '#0E3346'],
  ['#F472B6', '#341036'],
  ['#F5B638', '#6B2310'],
  ['#9C7BFA', '#1B1446'],
];

interface Props {
  /** Stored filename (resolved via photoUri). */
  file?: string | null;
  /** Direct URI (e.g. freshly picked, not yet saved). Wins over `file`. */
  uri?: string | null;
  /** Picks the fallback gradient. */
  seed?: number;
  /** Bottom scrim strength 0..1 so text stays readable. */
  scrim?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** Trip cover photo, or a seeded gradient with a route glyph when there is none. */
export function CoverImage({ file, uri, seed = 0, scrim = 0, style, children }: Props) {
  const src = uri ?? (file ? photoUri(file) : null);
  const g = GRADIENTS[Math.abs(seed) % GRADIENTS.length];
  return (
    <View style={[styles.base, style]}>
      {src ? (
        <Image source={{ uri: src }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      ) : (
        <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill}>
          <View style={styles.glyph}>
            <Icon name="map-marker-path" size={180} color="rgba(255,255,255,0.09)" />
          </View>
        </LinearGradient>
      )}
      {scrim > 0 && (
        <LinearGradient
          colors={['rgba(10,12,16,0)', `rgba(10,12,16,${0.55 * scrim})`, `rgba(10,12,16,${0.96 * scrim})`]}
          locations={[0.25, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: colors.surfaceAlt },
  glyph: { position: 'absolute', right: -30, top: -10, transform: [{ rotate: '-12deg' }] },
});
