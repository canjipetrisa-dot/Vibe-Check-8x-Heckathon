import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, hexToRgba } from '../theme';

export default function PersonaCard({ persona, selected, onPress }) {
  const glow = selected
    ? {
        shadowColor: persona.gradient[1],
        shadowOpacity: 0.55,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 12,
      }
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <LinearGradient
        colors={
          selected
            ? persona.gradient
            : persona.gradient.map((c) => hexToRgba(c, 0.5))
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.border, glow]}
      >
        <View style={[styles.card, selected && styles.cardSelected]}>
          <View
            style={[
              styles.emojiWrap,
              { backgroundColor: hexToRgba(persona.gradient[0], selected ? 0.28 : 0.15) },
            ]}
          >
            <Text style={styles.emoji}>{persona.emoji}</Text>
          </View>
          <Text style={styles.name}>{persona.name}</Text>
          <Text style={styles.tagline}>{persona.tagline}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '48%',
    marginBottom: 14,
  },
  border: {
    borderRadius: 28,
    padding: 1.5,
  },
  card: {
    borderRadius: 26.5,
    backgroundColor: COLORS.card,
    paddingVertical: 30,
    paddingHorizontal: 14,
    alignItems: 'center',
    minHeight: 176,
  },
  cardSelected: {
    backgroundColor: COLORS.cardSelected,
  },
  emojiWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tagline: {
    color: COLORS.textMid,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
