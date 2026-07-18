import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function PersonaCard({ persona, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <LinearGradient
        colors={selected ? persona.gradient : [COLORS.card, COLORS.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, selected && styles.cardSelected]}
      >
        <Text style={styles.emoji}>{persona.emoji}</Text>
        <Text style={styles.name}>{persona.name}</Text>
        <Text style={[styles.tagline, selected && styles.taglineSelected]}>
          {persona.tagline}
        </Text>
        {selected ? <Text style={styles.check}>✓ locked in</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '48%',
    marginBottom: 14,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 150,
  },
  cardSelected: {
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  tagline: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  taglineSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
});
