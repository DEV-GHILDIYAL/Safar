import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface Props extends TextInputProps {
  label: string;
  icon?: IconName;
}

export function TextField({ label, icon, style, multiline, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text variant="label" color={colors.textFaint}>
        {label}
      </Text>
      <View style={[styles.box, multiline && styles.multiBox, focused && styles.focused]}>
        {icon && <Icon name={icon} size={20} color={focused ? colors.accent : colors.textFaint} />}
        <TextInput
          {...rest}
          multiline={multiline}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.multiInput, style]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiBox: { alignItems: 'flex-start', paddingVertical: space.md },
  focused: { borderColor: colors.accent },
  input: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '600', paddingVertical: space.sm },
  multiInput: { minHeight: 88, textAlignVertical: 'top' },
});
