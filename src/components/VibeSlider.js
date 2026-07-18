// The hero element: gradient track (soft blue -> hot red), docked at the bottom.
// Haptic ticks when crossing vibe bands.
import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useVibe } from '../context/VibeContext';
import { COLORS, vibeLabel } from '../theme';

function bandOf(v) {
  if (v <= 33) return 0;
  if (v <= 66) return 1;
  return 2;
}

export default function VibeSlider() {
  const { vibe, setVibe, commitVibe } = useVibe();
  const lastBand = useRef(bandOf(vibe));

  const onChange = (v) => {
    setVibe(v);
    const b = bandOf(v);
    if (b !== lastBand.current) {
      lastBand.current = b;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  const onComplete = (v) => {
    commitVibe(v);
    Haptics.selectionAsync().catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{vibeLabel(vibe)}</Text>
      <View style={styles.trackArea}>
        <LinearGradient
          colors={[COLORS.hypeBlue, COLORS.accent, COLORS.roastRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientTrack}
        />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={vibe}
          onValueChange={onChange}
          onSlidingComplete={onComplete}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#FFFFFF"
        />
      </View>
      <View style={styles.ends}>
        <Text style={styles.endText}>gentle hype</Text>
        <Text style={styles.endText}>savage roast</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 10,
    paddingBottom: 2,
    paddingHorizontal: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  trackArea: {
    height: 44,
    justifyContent: 'center',
  },
  gradientTrack: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 12,
    borderRadius: 6,
  },
  slider: {
    width: '100%',
    height: 44,
  },
  ends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  endText: {
    color: COLORS.textDim,
    fontSize: 12.5,
    fontWeight: '600',
  },
});
