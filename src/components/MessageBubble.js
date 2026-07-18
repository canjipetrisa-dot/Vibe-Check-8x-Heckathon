import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ThinkingDots from './ThinkingDots';
import CrisisCard from './CrisisCard';
import { COLORS } from '../theme';

export default function MessageBubble({ message, onReplay }) {
  if (message.role === 'crisis') {
    return <CrisisCard />;
  }

  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAi]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {message.thinking ? (
          <ThinkingDots />
        ) : (
          <Text style={styles.text}>{message.text}</Text>
        )}
        {!isUser && !message.thinking && message.audioUri ? (
          <Pressable
            onPress={() => onReplay?.(message)}
            hitSlop={10}
            style={styles.speaker}
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 16,
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAi: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 6,
  },
  text: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
  },
  speaker: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  speakerIcon: {
    fontSize: 16,
  },
});
