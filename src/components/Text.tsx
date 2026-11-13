import { Text as RNText, type TextProps } from 'react-native';
import { colors, type as typeScale } from '@/theme/tokens';

export type TextVariant = keyof typeof typeScale;

interface Props extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({ variant = 'body', color = colors.text, align, style, ...rest }: Props) {
  return <RNText {...rest} style={[typeScale[variant], { color, textAlign: align }, style]} />;
}
