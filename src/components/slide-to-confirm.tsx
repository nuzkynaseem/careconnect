import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Care } from '@/constants/care-theme';

const KNOB = 52;
const PADDING = 4;
/** How far along the track (0–1) the knob must be dragged to confirm. */
const THRESHOLD = 0.85;

export function SlideToConfirm({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const x = useRef(new Animated.Value(0)).current;
  const maxRef = useRef(0);
  const [confirmed, setConfirmed] = useState(false);
  const confirmedRef = useRef(false);
  // The pan responder is created once, so read the latest callback through a ref.
  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  });

  const onLayout = (e: LayoutChangeEvent) => {
    maxRef.current = e.nativeEvent.layout.width - KNOB - PADDING * 2;
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !confirmedRef.current,
      onMoveShouldSetPanResponder: () => !confirmedRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => x.setValue(Math.max(0, Math.min(g.dx, maxRef.current))),
      onPanResponderRelease: (_, g) => {
        const max = maxRef.current;
        if (max > 0 && g.dx >= max * THRESHOLD) {
          confirmedRef.current = true;
          setConfirmed(true);
          Animated.timing(x, { toValue: max, duration: 120, useNativeDriver: false }).start(() =>
            onConfirmRef.current(),
          );
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
        }
      },
    }),
  ).current;

  const labelOpacity = x.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.2],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={styles.track}
      onLayout={onLayout}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => {
        if (confirmedRef.current) return;
        confirmedRef.current = true;
        setConfirmed(true);
        onConfirmRef.current();
      }}>
      <Animated.View style={[styles.fill, { width: Animated.add(x, KNOB + PADDING) }]} />
      <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
        {confirmed ? 'AGREED' : label}
      </Animated.Text>
      <Animated.View
        style={[styles.knob, { transform: [{ translateX: x }] }]}
        {...responder.panHandlers}>
        <Ionicons name={confirmed ? 'checkmark' : 'arrow-forward'} size={22} color={Care.text} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: KNOB + PADDING * 2,
    borderRadius: (KNOB + PADDING * 2) / 2,
    backgroundColor: '#2A3242',
    justifyContent: 'center',
    padding: PADDING,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: (KNOB + PADDING * 2) / 2,
    backgroundColor: 'rgba(47, 107, 255, 0.25)',
  },
  label: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: Care.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: Care.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
