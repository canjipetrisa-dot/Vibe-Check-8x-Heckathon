# Vibe Check ✨

An AI friend that gives short Gen Z advice. Pick a persona, set the vibe slider (gentle hype → savage roast), then talk to it or show it a photo.

## Run it on your phone (Expo Go)

1. Install [Expo Go](https://expo.dev/go) on your phone.
2. In this folder:

   ```bash
   npm install
   npx expo install --fix   # aligns native package versions with your Expo SDK
   OPENAI_API_KEY=sk-... POSTHOG_KEY=phc_... npx expo start
   ```

3. Scan the QR code with your phone (Camera app on iOS, Expo Go on Android). Phone and computer must be on the same Wi-Fi.

Keys are read from the environment via `app.config.js` → `extra` — nothing is hardcoded. You can also put them in a `.env` file and run `npx expo start` (Expo loads `.env` automatically); just don't commit it.

⚠️ Note: shipping an OpenAI key inside a client app is fine for a prototype but not for production — the key is extractable from the bundle. For a real release, proxy these calls through a tiny backend.

## File structure

```
vibe-check/
├── App.js                      # Tabs + persistent vibe slider (rendered inside the tab bar)
├── index.js                    # Entry point
├── app.config.js               # Expo config; reads OPENAI_API_KEY / POSTHOG_KEY from env
├── babel.config.js
├── package.json
└── src/
    ├── api.js                  # transcribe / checkCrisis / getReply / speak (OpenAI)
    ├── audio.js                # expo-av record + playback helpers
    ├── analytics.js            # PostHog init + track()
    ├── theme.js                # Colors, personas, vibe label logic
    ├── context/
    │   └── VibeContext.js      # Global state: persona, vibe, chat history (memory only)
    ├── components/
    │   ├── VibeSlider.js       # Hero gradient slider, pinned to bottom on every tab
    │   ├── PersonaCard.js
    │   ├── MessageBubble.js
    │   ├── ThinkingDots.js
    │   └── CrisisCard.js       # Plain, non-jokey 988 card
    └── screens/
        ├── HomeScreen.js       # 2x2 persona grid
        ├── ChatScreen.js       # Voice loop: record → transcribe → crisis check → reply → TTS
        └── PhotoScreen.js      # Pick photo → AI reaction → TTS
```

## Flows

- **Voice:** hold mic → release → `transcribe(audioUri)` → `checkCrisis(text)` → (if flagged: crisis card + `crisis_guard_triggered`, persona is never called) → `getReply({persona, vibe, userText})` → bubble + `speak()` → autoplay. 🔊 on any AI bubble replays.
- **Photo:** pick camera/library (base64) → `getReply({persona, vibe, imageBase64})` → reaction + autoplay.

## Analytics events

`persona_selected` (name), `vibe_changed` (value, fired on drag end), `voice_message_sent`, `photo_sent`, `crisis_guard_triggered`. If `POSTHOG_KEY` is unset, analytics no-ops silently.

## Notes

- Chat history is in-memory only (React context). Kill the app, it's gone — by design.
- `checkCrisis` runs a local keyword pass first (works offline), then OpenAI moderation as a second pass.
- Persona → TTS voice mapping lives in `src/theme.js` (`voiceId`).
