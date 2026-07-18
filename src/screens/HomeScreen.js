import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PersonaCard from '../components/PersonaCard';
import LogoHeader from '../components/LogoHeader';
import { useVibe } from '../context/VibeContext';
import { COLORS, PERSONAS } from '../theme';

export default function HomeScreen() {
  const { persona, setPersona } = useVibe();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Ambient glow blobs — pure decoration */}
      <View style={styles.blobViolet} pointerEvents="none" />
      <View style={styles.blobTeal} pointerEvents="none" />
      <View style={styles.blobRose} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <LogoHeader width={210} />
        <LinearGradient
          colors={[COLORS.hypeBlue, COLORS.accent, COLORS.roastRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleUnderline}
        />
        <Text style={styles.subtitle}>Who's giving you advice today?</Text>
        <View style={styles.grid}>
          {PERSONAS.map((p) => (
            <PersonaCard
              key={p.id}
              persona={p}
              selected={persona?.id === p.id}
              onPress={() => setPersona(p)}
            />
          ))}
        </View>
        <Text style={styles.hint}>
          Set the vibe below — gentle hype to savage roast.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  blobViolet: {
    position: 'absolute',
    top: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(139, 124, 246, 0.14)',
  },
  blobTeal: {
    position: 'absolute',
    top: 240,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(56, 189, 248, 0.09)',
  },
  blobRose: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(224, 112, 154, 0.08)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  titleUnderline: {
    width: 64,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    alignSelf: 'center',
  },
  subtitle: {
    color: COLORS.textMid,
    fontSize: 16,
    marginTop: 14,
    marginBottom: 26,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hint: {
    color: COLORS.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});
