// Small helpers around expo-av so record + playback modes don't fight.
import { Audio } from 'expo-av';

let currentSound = null;

export async function startRecording() {
  const perm = await Audio.requestPermissionsAsync();
  if (!perm.granted) throw new Error('Microphone permission denied');
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  return recording;
}

export async function stopRecording(recording) {
  await recording.stopAndUnloadAsync();
  // Switch out of recording mode so playback uses the loud speaker on iOS.
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });
  return recording.getURI();
}

export async function playAudio(uri) {
  try {
    if (currentSound) {
      await currentSound.unloadAsync().catch(() => {});
      currentSound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
    currentSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) currentSound = null;
      }
    });
  } catch (e) {
    // playback is best-effort; text is already on screen
  }
}
