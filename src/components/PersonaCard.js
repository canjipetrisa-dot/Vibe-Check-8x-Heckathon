import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, hexToRgba } from '../theme';

export default function PersonaCard({ persona, selected, onPress }) {
  const glow = selected
    ? {
        shadowColor: persona.gradient[1],
        shadowOpacity: 0.6,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 14,
      }
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <LinearGradient
        colors={
          selected
            ? persona.gradient
            : persona.gradient.map((c) => hexToRgba(c, 0.16))
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.border, selected && styles.borderSelected, glow]}
      >
        <View style={[styles.card, selected && styles.cardSelected]}>
          {selected ? (
            <View
              style={[styles.badge, { backgroundColor: persona.gradient[1] }]}
            >
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
            </View>
          ) : null}
          <View style={{ opacity: selected ? 1 : 0.65, alignItems: 'center' }}>
            <View
              style={[
                styles.emojiWrap,
                {
                  backgroundColor: hexToRgba(
                    persona.gradient[0],
                    selected ? 0.3 : 0.1
                  ),
                },
              ]}
            >
              <Text style={styles.emoji}>{persona.emoji}</Text>
            </View>
            <Text style={styles.name}>{persona.name}</Text>
            <Text style={styles.tagline}>{persona.tagline}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '47.5%',
    marginBottom: 14,
  },
  border: {
    borderRadius: 30,
    padding: 1.5,
  },
  borderSelected: {
    padding: 2.5,
  },
  card: {
    borderRadius: 27.5,
    backgroundColor: COLORS.card,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    minHeight: 164,
  },
  cardSelected: {
    backgroundColor: COLORS.cardSelected,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 29,
  },
  name: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tagline: {
    color: COLORS.textMid,
    fontSize: 13.5,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 19,
  },
});
