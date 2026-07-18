// Compact persona switcher shown in the bottom dock once a conversation starts.
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, hexToRgba } from '../theme';

export default function PersonaChips({ personas, selected, onSelect }) {
  return (
    <View>
      <View style={styles.row}>
        {personas.map((p) => {
          const isSel = selected?.id === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => onSelect(p)}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.92 }] }]}
            >
              <LinearGradient
                colors={
                  isSel
                    ? p.gradient
                    : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.05)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.ring, isSel && styles.ringSelected]}
              >
                <View
                  style={[
                    styles.chip,
                    isSel && { backgroundColor: hexToRgba(p.gradient[0], 0.3) },
                  ]}
                >
                  <Text style={[styles.emoji, !isSel && styles.emojiDim]}>
                    {p.emoji}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.name}>{selected?.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingTop: 12,
  },
  ring: {
    borderRadius: 27,
    padding: 2,
  },
  ringSelected: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  chip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  emojiDim: {
    opacity: 0.5,
  },
  name: {
    color: COLORS.textMid,
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
