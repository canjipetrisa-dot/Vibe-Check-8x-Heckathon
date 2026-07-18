import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PersonaCard from '../components/PersonaCard';
import { useVibe } from '../context/VibeContext';
import { COLORS, PERSONAS } from '../theme';

export default function HomeScreen() {
  const { persona, setPersona } = useVibe();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>vibe check ✨</Text>
        <Text style={styles.subtitle}>who's giving you advice today?</Text>
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
          then set the vibe below — from gentle hype to savage roast 👇
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 16,
    marginTop: 4,
    marginBottom: 20,
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
    marginTop: 8,
  },
});
