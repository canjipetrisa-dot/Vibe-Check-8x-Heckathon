import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        {message.imageUri ? (
          <Image source={{ uri: message.imageUri }} style={styles.image} />
        ) : null}
        {message.thinking ? (
          <ThinkingDots />
        ) : message.text ? (
          <Text style={styles.text}>{message.text}</Text>
        ) : null}
        {!isUser && !message.thinking && message.audioUri ? (
          <Pressable
            onPress={() => onReplay?.(message)}
            hitSlop={12}
            style={styles.speaker}
          >
            <Ionicons name="volume-medium-outline" size={19} color={COLORS.textDim} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 7,
    paddingHorizontal: 20,
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAi: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 8,
  },
  image: {
    width: 190,
    height: 190,
    borderRadius: 18,
    marginBottom: 6,
    backgroundColor: COLORS.card,
  },
  text: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 25,
  },
  speaker: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});
