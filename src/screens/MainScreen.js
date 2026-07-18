// The whole app on one page.
// Landing: logo + persona grid + mic. Once a conversation starts, the grid
// collapses into persona chips docked with the vibe slider, and the chat
// takes over the body. Photo is a small attach icon next to the mic.
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import LogoHeader from '../components/LogoHeader';
import PersonaCard from '../components/PersonaCard';
import PersonaChips from '../components/PersonaChips';
import VibeSlider from '../components/VibeSlider';
import MessageBubble from '../components/MessageBubble';
import { useVibe } from '../context/VibeContext';
import { COLORS, PERSONAS } from '../theme';
import { track } from '../analytics';
import { startRecording, stopRecording, playAudio } from '../audio';
import { transcribe, checkCrisis, getReply, speak } from '../api';

const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  quality: 0.5,
  base64: true,
  allowsEditing: false,
};

export default function MainScreen() {
  const {
    persona,
    setPersona,
    vibe,
    messages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
  } = useVibe();

  const [recording, setRecording] = useState(null);
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const inConvo = messages.length > 0;

  // Pulse the mic while recording
  useEffect(() => {
    if (recording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 500, useNativeDriver: true }),
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

  const selectPersona = useCallback(
    (p) => {
      Haptics.selectionAsync().catch(() => {});
      setPersona(p);
    },
    [setPersona]
  );

  // ---------- voice flow ----------
  const onPressIn = useCallback(async () => {
    if (busy || recording) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
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

      thinkingId = addMessage({ role: 'ai', thinking: true });
      const userText = await transcribe(audioUri);
      removeMessage(thinkingId);
      thinkingId = null;

      if (!userText) {
        addMessage({ role: 'ai', text: 'Heard nothing — try that again.' });
        return;
      }
      addMessage({ role: 'user', text: userText });

      thinkingId = addMessage({ role: 'ai', thinking: true });
      const crisis = await checkCrisis(userText);
      if (crisis) {
        removeMessage(thinkingId);
        thinkingId = null;
        addMessage({ role: 'crisis' });
        track('crisis_guard_triggered');
        return;
      }

      const replyText = await getReply({ persona, vibe, userText, history: messages });
      removeMessage(thinkingId);
      thinkingId = null;
      const msgId = addMessage({ role: 'ai', text: replyText });

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

  // ---------- photo flow ----------
  const sendImage = useCallback(
    async (asset) => {
      setBusy(true);
      track('photo_sent');
      addMessage({ role: 'user', imageUri: asset.uri });
      let thinkingId = addMessage({ role: 'ai', thinking: true });
      try {
        const replyText = await getReply({
          persona,
          vibe,
          imageBase64: asset.base64,
          history: messages,
        });
        removeMessage(thinkingId);
        thinkingId = null;
        const msgId = addMessage({ role: 'ai', text: replyText });
        try {
          const uri = await speak(replyText, persona);
          updateMessage(msgId, { audioUri: uri });
          await playAudio(uri);
        } catch (e) {
          console.warn('audio failed:', e);
        }
      } catch (e) {
        if (thinkingId) removeMessage(thinkingId);
        addMessage({ role: 'ai', text: `Something broke (${e.message})` });
      } finally {
        setBusy(false);
      }
    },
    [persona, vibe, messages, addMessage, updateMessage, removeMessage]
  );

  const pickFrom = useCallback(
    async (source) => {
      try {
        let result;
        if (source === 'camera') {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return;
          result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
        } else {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return;
          result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
        }
        if (!result.canceled && result.assets?.[0]?.base64) {
          await sendImage(result.assets[0]);
        }
      } catch (e) {
        Alert.alert('Something went wrong', e.message);
      }
    },
    [sendImage]
  );

  const openPhoto = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    Alert.alert('Show me something', 'Where from?', [
      { text: 'Camera', onPress: () => pickFrom('camera') },
      { text: 'Library', onPress: () => pickFrom('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [pickFrom]);

  const onReplay = useCallback((message) => {
    if (message.audioUri) playAudio(message.audioUri);
  }, []);

  const onNewChat = useCallback(() => {
    if (!inConvo || busy) return;
    Haptics.selectionAsync().catch(() => {});
    Alert.alert('Start fresh?', 'This clears the conversation.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New chat', style: 'destructive', onPress: () => clearMessages() },
    ]);
  }, [inConvo, busy, clearMessages]);

  // ---------- render ----------
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.blobViolet} pointerEvents="none" />
      <View style={styles.blobTeal} pointerEvents="none" />

      <LogoHeader width={inConvo ? 100 : 160} />

      {!inConvo ? (
        <ScrollView contentContainerStyle={styles.landing} bounces={false}>
          <View style={styles.steps}>
            {['Pick a persona', 'Set the vibe', 'Hold the mic'].map((t, i) => (
              <View key={t} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={styles.grid}>
            {PERSONAS.map((p) => (
              <PersonaCard
                key={p.id}
                persona={p}
                selected={persona?.id === p.id}
                onPress={() => selectPersona(p)}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} onReplay={onReplay} />
          )}
          contentContainerStyle={styles.list}
          style={{ flex: 1 }}
        />
      )}

      <View style={styles.dock}>
        {inConvo ? (
          <PersonaChips
            personas={PERSONAS}
            selected={persona}
            onSelect={selectPersona}
          />
        ) : null}
        <VibeSlider />
        <View style={styles.inputRow}>
          <Pressable
            onPress={openPhoto}
            disabled={busy}
            hitSlop={10}
            style={({ pressed }) => [
              styles.photoBtn,
              pressed && { opacity: 0.6 },
              busy && { opacity: 0.35 },
            ]}
          >
            <Ionicons name="image-outline" size={28} color={COLORS.textMid} />
          </Pressable>

          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} disabled={busy}>
              <LinearGradient
                colors={
                  recording ? [COLORS.roastRed, '#F0705E'] : ['#4F46E5', '#8B5CF6']
                }
                style={[styles.micButton, busy && { opacity: 0.5 }]}
              >
                <Ionicons name="mic" size={30} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Pressable
            onPress={onNewChat}
            disabled={!inConvo || busy}
            hitSlop={10}
            style={({ pressed }) => [
              styles.photoBtn,
              pressed && { opacity: 0.6 },
              (!inConvo || busy) && { opacity: 0.3 },
            ]}
          >
            <Ionicons name="refresh-outline" size={26} color={COLORS.textMid} />
          </Pressable>
        </View>
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
  blobViolet: {
    position: 'absolute',
    top: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(139, 124, 246, 0.13)',
  },
  blobTeal: {
    position: 'absolute',
    top: 300,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  landing: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 12,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 124, 246, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    color: COLORS.textMid,
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  list: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  dock: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  photoBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHint: {
    color: COLORS.textDim,
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
});
