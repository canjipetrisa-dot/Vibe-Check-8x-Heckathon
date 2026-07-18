// The hero element: gradient track (soft blue -> hot red), pinned above the tab bar.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useVibe } from '../context/VibeContext';
import { COLORS, vibeLabel } from '../theme';

export default function VibeSlider() {
  const { vibe, setVibe, commitVibe } = useVibe();

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
          onValueChange={setVibe}
          onSlidingComplete={commitVibe}
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
    backgroundColor: COLORS.card,
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  trackArea: {
    height: 40,
    justifyContent: 'center',
  },
  gradientTrack: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 10,
    borderRadius: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  endText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
});
