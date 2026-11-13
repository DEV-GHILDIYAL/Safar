import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, PanResponder, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, spring } from '@/theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Custom modal bottom sheet: spring in, drag the handle down (or tap backdrop) to dismiss. */
export function BottomSheet({ visible, onClose, children }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(height);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      y.value = height;
      y.value = withSpring(0, spring.gentle);
      return;
    }
    if (!mounted) return;
    y.value = withTiming(height, { duration: 220 });
    const t = setTimeout(() => setMounted(false), 230);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6,
      onPanResponderMove: (_, g) => {
        y.value = Math.max(0, g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 1.1) closeRef.current();
        else y.value = withSpring(0, spring.gentle);
      },
    }),
  ).current;

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, height * 0.6], [1, 0], 'clamp') }));

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { maxHeight: height - insets.top - space.xl, paddingBottom: insets.bottom }, sheetStyle]}>
          <View {...pan.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  handleArea: { alignItems: 'center', paddingTop: space.md, paddingBottom: space.sm },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border },
});
