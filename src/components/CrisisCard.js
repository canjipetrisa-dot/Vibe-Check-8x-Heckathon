// Plain, non-jokey, full-width. Intentionally breaks the app's playful style.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function CrisisCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>
        Hey — this sounds real, and you deserve real support, not a bit. If
        you're in the US, call or text 988 anytime. You're not alone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.crisisBg,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 18,
  },
  text: {
    color: COLORS.crisisText,
    fontSize: 16,
    lineHeight: 24,
  },
});
