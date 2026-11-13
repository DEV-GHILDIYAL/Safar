import type { TextStyle } from 'react-native';

export const colors = {
  bg: '#0A0C10',
  surface: '#13161D',
  surfaceAlt: '#1B1F28',
  elevated: '#232834',
  border: '#2A303C',
  text: '#F5F6F8',
  textDim: '#A3AAB8',
  textFaint: '#646C7B',
  accent: '#FF7A3D',
  accentSoft: 'rgba(255,122,61,0.14)',
  onAccent: '#1A0B03',
  danger: '#FF5C6C',
  dangerSoft: 'rgba(255,92,108,0.14)',
  success: '#3DDC97',
  overlay: 'rgba(4,5,8,0.72)',
  scrim: 'rgba(10,12,16,0.55)',
} as const;

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.5 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

/** Animation durations (ms). Motion is timing-based with ease-out curves: no springs or bounce. */
export const motion = { press: 110, release: 170, fast: 220, base: 300, slow: 380 } as const;

export const stagger = (index: number, base = 60) => Math.min(index, 10) * base;
