// Three bouncing dots for the "thinking…" AI bubble.
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

function Dot({ delay }) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, { toValue: -6, duration: 260, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.delay(400 - delay),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, y]);

  return <Animated.View style={[styles.dot, { transform: [{ translateY: y }] }]} />;
}

export default function ThinkingDots() {
  return (
    <View style={styles.row}>
      <Dot delay={0} />
      <Dot delay={130} />
      <Dot delay={260} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textDim,
    marginHorizontal: 3,
  },
});
