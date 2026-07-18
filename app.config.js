// Env vars come from your shell / .env — never hardcoded.
// Run:  OPENAI_API_KEY=sk-... POSTHOG_KEY=phc_... npx expo start
export default {
  expo: {
    name: 'Vibe Check',
    slug: 'vibe-check',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    backgroundColor: '#0D0B1A',
    splash: {
      backgroundColor: '#0D0B1A',
    },
    ios: {
      supportsTablet: false,
      infoPlist: {
        NSMicrophoneUsageDescription:
          'Vibe Check listens so your AI bestie can respond.',
        NSCameraUsageDescription:
          'Show your AI bestie something to react to.',
        NSPhotoLibraryUsageDescription:
          'Pick a photo for your AI bestie to react to.',
      },
    },
    android: {
      permissions: ['RECORD_AUDIO', 'CAMERA', 'READ_MEDIA_IMAGES'],
    },
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      POSTHOG_KEY: process.env.POSTHOG_KEY,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    },
  },
};
