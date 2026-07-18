import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import ThinkingDots from '../components/ThinkingDots';
import { useVibe } from '../context/VibeContext';
import { COLORS } from '../theme';
import { track } from '../analytics';
import { playAudio } from '../audio';
import { getReply, speak } from '../api';

const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  quality: 0.5,
  base64: true,
  allowsEditing: false,
};

export default function PhotoScreen() {
  const { persona, vibe } = useVibe();
  const [photoUri, setPhotoUri] = useState(null);
  const [reply, setReply] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleImage = useCallback(
    async (asset) => {
      setPhotoUri(asset.uri);
      setReply(null);
      setAudioUri(null);
      setBusy(true);
      track('photo_sent');
      try {
        const text = await getReply({
          persona,
          vibe,
          imageBase64: asset.base64,
        });
        setReply(text);
        try {
          const uri = await speak(text, persona.voiceId, persona.voiceStyle);
          setAudioUri(uri);
          await playAudio(uri);
        } catch (e) {
          console.warn('audio failed:', e);
        }
      } catch (e) {
        setReply(`something broke 💀 (${e.message})`);
      } finally {
        setBusy(false);
      }
    },
    [persona, vibe]
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
          await handleImage(result.assets[0]);
        }
      } catch (e) {
        Alert.alert('oop', e.message);
      }
    },
    [handleImage]
  );

  const openPicker = useCallback(() => {
    Alert.alert('show me something 📸', 'where from?', [
      { text: '📷 camera', onPress: () => pickFrom('camera') },
      { text: '🖼️ library', onPress: () => pickFrom('library') },
      { text: 'cancel', style: 'cancel' },
    ]);
  }, [pickFrom]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>
          {persona.emoji} {persona.name} will react
        </Text>

        <Pressable onPress={openPicker} disabled={busy}>
          <LinearGradient
            colors={[COLORS.userBubble, COLORS.roastRed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bigButton, busy && { opacity: 0.5 }]}
          >
            <Text style={styles.bigButtonText}>show me something 📸</Text>
          </LinearGradient>
        </Pressable>

        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : null}

        {busy ? (
          <View style={styles.replyBubble}>
            <ThinkingDots />
          </View>
        ) : null}

        {reply && !busy ? (
          <View style={styles.replyBubble}>
            <Text style={styles.replyText}>{reply}</Text>
            {audioUri ? (
              <Pressable
                onPress={() => playAudio(audioUri)}
                hitSlop={10}
                style={styles.speaker}
              >
                <Text style={{ fontSize: 18 }}>🔊</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },
  bigButton: {
    borderRadius: 28,
    paddingVertical: 26,
    alignItems: 'center',
  },
  bigButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    marginTop: 20,
    backgroundColor: COLORS.card,
  },
  replyBubble: {
    backgroundColor: COLORS.aiBubble,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    padding: 16,
    marginTop: 16,
  },
  replyText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 23,
  },
  speaker: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});
