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
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import ThinkingDots from '../components/ThinkingDots';
import LogoHeader from '../components/LogoHeader';
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
          const uri = await speak(text, persona);
          setAudioUri(uri);
          await playAudio(uri);
        } catch (e) {
          console.warn('audio failed:', e);
        }
      } catch (e) {
        setReply(`Something broke (${e.message})`);
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
        Alert.alert('Something went wrong', e.message);
      }
    },
    [handleImage]
  );

  const openPicker = useCallback(() => {
    Alert.alert('Show me something', 'Where from?', [
      { text: 'Camera', onPress: () => pickFrom('camera') },
      { text: 'Library', onPress: () => pickFrom('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [pickFrom]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LogoHeader width={96} />
        <View style={styles.headerRow}>
          <LinearGradient colors={persona.gradient} style={styles.headerDot} />
          <Text style={styles.header}>{persona.name} will react</Text>
        </View>

        <Pressable onPress={openPicker} disabled={busy}>
          <LinearGradient
            colors={['#4F46E5', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bigButton, busy && { opacity: 0.5 }]}
          >
            <Ionicons name="camera-outline" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.bigButtonText}>Show me something</Text>
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
                <Ionicons name="volume-medium-outline" size={18} color={COLORS.textDim} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
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
  bigButton: {
    borderRadius: 32,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 28,
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
