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
import { Ionicons } from '@expo/vector-icons';

import MessageBubble from '../components/MessageBubble';
import LogoHeader from '../components/LogoHeader';
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
      addMessage({ role: 'ai', text: 'Mic permission needed — enable it in Settings.' });
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
        addMessage({ role: 'ai', text: 'Heard nothing — try that again.' });
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

      // 3. persona reply (with conversation history for continuity)
      const replyText = await getReply({ persona, vibe, userText, history: messages });
      removeMessage(thinkingId);
      thinkingId = null;
      const msgId = addMessage({ role: 'ai', text: replyText });

      // 4. speak + autoplay
      try {
        const uri = await speak(replyText, persona);
        updateMessage(msgId, { audioUri: uri });
        await playAudio(uri);
      } catch (e) {
        console.warn('audio failed:', e);
        addMessage({ role: 'ai', text: `Audio failed: ${e.message}` });
      }
    } catch (e) {
      if (thinkingId) removeMessage(thinkingId);
      addMessage({ role: 'ai', text: `Something broke (${e.message})` });
    } finally {
      setBusy(false);
    }
  }, [recording, persona, vibe, messages, addMessage, updateMessage, removeMessage]);

  const onReplay = useCallback((message) => {
    if (message.audioUri) playAudio(message.audioUri);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LogoHeader width={96} />
      <View style={styles.headerRow}>
        <LinearGradient colors={persona.gradient} style={styles.headerDot} />
        <Text style={styles.header}>{persona.name}</Text>
      </View>
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
            Hold the mic and say what's on your mind.
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
                  ? [COLORS.roastRed, '#F0705E']
                  : ['#4F46E5', '#8B5CF6']
              }
              style={[styles.micButton, busy && styles.micBusy]}
            >
              <Ionicons name="mic" size={34} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
        <Text style={styles.micHint}>
          {recording
            ? 'Listening — release to send'
            : busy
            ? 'One sec...'
            : 'Hold to talk'}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    paddingBottom: 10,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  header: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  micHint: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});
