import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { photoUri } from '@/lib/photos';
import { colors } from '@/theme/tokens';
import { Icon } from './Icon';
import { Text } from './Text';

interface Props {
  name: string;
  file?: string | null;
  uri?: string | null;
  size?: number;
}

/** Profile photo, or initials on a saffron gradient. */
export function Avatar({ name, file, uri, size = 84 }: Props) {
  const src = uri ?? (file ? photoUri(file) : null);
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  const box = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.base, box]}>
      {src ? (
        <Image source={{ uri: src }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <LinearGradient colors={[colors.accent, '#B4386A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.center]}>
          {initials ? (
            <Text variant="title" color={colors.onAccent} style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}>
              {initials}
            </Text>
          ) : (
            <Icon name="account" size={size * 0.5} color={colors.onAccent} />
          )}
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: colors.surfaceAlt },
  center: { alignItems: 'center', justifyContent: 'center' },
});
