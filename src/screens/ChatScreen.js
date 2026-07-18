import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import MessageBubble from '../components/MessageBubble';
import { useVibe } from '../context/VibeContext';
import { COLORS } from '../theme';
import { track } from '../analytics';
import { startRecording, stopRecording, playAudio } from '../audio';
import { transcribe, checkCrisis, getReply, speak } from '../api';

export default function ChatScreen() {
  const {
    persona,
    vibe,
    messages,
    addMessage,
    updateMessage,
    removeMessage,
  } = useVibe();

  const [recording, setRecording] = useState(null);
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  // Pulse the mic while recording
  useEffect(() => {
    if (recording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
  }, [recording, pulse]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(scrollToEnd, [messages.length, scrollToEnd]);

  const onPressIn = useCallback(async () => {
    if (busy || recording) return;
    try {
      const rec = await startRecording();
      setRecording(rec);
    } catch (e) {
      addMessage({ role: 'ai', text: 'mic said no 😔 check permissions?' });
    }
  }, [busy, recording, addMessage]);

  const onPressOut = useCallback(async () => {
    if (!recording) return;
    const rec = recording;
    setRecording(null);
    setBusy(true);

    let thinkingId = null;
    try {
      const audioUri = await stopRecording(rec);
      track('voice_message_sent');

      // 1. transcribe
      thinkingId = addMessage({ role: 'ai', thinking: true });
      const userText = await transcribe(audioUri);
      removeMessage(thinkingId);
      thinkingId = null;

      if (!userText) {
        addMessage({ role: 'ai', text: "i heard... nothing? say it again bestie" });
        return;
      }
      addMessage({ role: 'user', text: userText });

      // 2. crisis guard — if triggered, do NOT call the persona
      thinkingId = addMessage({ role: 'ai', thinking: true });
      const crisis = await checkCrisis(userText);
      if (crisis) {
        removeMessage(thinkingId);
        thinkingId = null;
        addMessage({ role: 'crisis' });
        track('crisis_guard_triggered');
        return;
      }

      // 3. persona reply
      const replyText = await getReply({ persona, vibe, userText });
      removeMessage(thinkingId);
      thinkingId = null;
      const msgId = addMessage({ role: 'ai', text: replyText });

      // 4. speak + autoplay
      try {
        const uri = await speak(replyText, persona.voiceId);
        updateMessage(msgId, { audioUri: uri });
        await playAudio(uri);
      } catch (e) {
        // text already shown; audio is best-effort
      }
    } catch (e) {
      if (thinkingId) removeMessage(thinkingId);
      addMessage({ role: 'ai', text: `something broke 💀 (${e.message})` });
    } finally {
      setBusy(false);
    }
  }, [recording, persona, vibe, addMessage, updateMessage, removeMessage]);

  const onReplay = useCallback((message) => {
    if (message.audioUri) playAudio(message.audioUri);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.header}>
        {persona.emoji} {persona.name}
      </Text>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} onReplay={onReplay} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            hold the mic and say what's on your mind 🎙️
          </Text>
        }
      />
      <View style={styles.micArea}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={busy}
          >
            <LinearGradient
              colors={
                recording
                  ? [COLORS.roastRed, '#FF7A5C']
                  : [COLORS.userBubble, COLORS.hypeBlue]
              }
              style={[styles.micButton, busy && styles.micBusy]}
            >
              <Text style={styles.micIcon}>🎙️</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
        <Text style={styles.micHint}>
          {recording
            ? 'listening... release to send'
            : busy
            ? 'hold on...'
            : 'hold to talk'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 10,
  },
  list: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  empty: {
    color: COLORS.textDim,
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  micArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  micButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBusy: {
    opacity: 0.5,
  },
  micIcon: {
    fontSize: 36,
  },
  micHint: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});
