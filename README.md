# Vibey

An AI friend that gives short, sharp Gen Z advice — out loud, in an actual voice. Pick a persona, set the vibe slider (gentle hype → savage roast), then talk to it or show it a photo. It listens, remembers the conversation, and answers with personality.

Built with Expo (React Native) for the 8x Hackathon.

## Features

- **4 personas, 4 real voices** — Hype Bestie, No-Nonsense Auntie, Chaotic Gremlin, Zen One. Each has its own ElevenLabs character voice (2 female, 2 male) and its own personality prompt.
- **Vibe slider** — 0–100 from "hype me up" through "real talk" to "humble me", pinned to the bottom of every screen. Changes the tone of every reply.
- **Voice loop** — hold the mic, talk, release. Speech → text → reply → spoken audio, autoplayed. Tap the speaker on any reply to rehear it.
- **Photo reactions** — show it a photo, get a spoken reaction in the same persona + vibe.
- **Conversation memory** — replies follow the thread (in-memory only; nothing is stored).
- **Crisis guard** — if a message signals real distress, the joke machine stops: no persona, no roast, just a plain card with the 988 lifeline. Runs a local keyword check plus a moderation-API pass.

## Run it

Requirements: Node 20+, the [Expo Go](https://expo.dev/go) app on your phone, and API keys (below).

```bash
git clone https://github.com/canjipetrisa-dot/Vibe-Check-8x-Heckathon.git
cd Vibe-Check-8x-Heckathon
echo "legacy-peer-deps=true" > .npmrc
npm install
npx expo install --fix
```

Create a `.env` file in the project root:

```
OPENAI_API_KEY=sk-...          # required — speech-to-text, replies, fallback TTS
ELEVENLABS_API_KEY=...         # optional — character voices (falls back to OpenAI TTS without it)
POSTHOG_KEY=phc_...            # optional — analytics (no-ops without it)
```

Then:

```bash
npx expo start
```

Scan the QR with your phone (iOS: Camera app; Android: Expo Go). Same Wi-Fi as your computer — or use `npx expo start --tunnel` to share with anyone anywhere.

Keys are read via `app.config.js` → `extra`. Nothing is hardcoded. **Note:** in this prototype the keys are embedded in the app manifest at runtime — fine for a hackathon demo with spending caps, not for production. A production build would proxy API calls through a small backend.

## File structure

```
├── App.js                      # Root: welcome overlay + main screen
├── index.js                    # Entry point
├── app.config.js               # Expo config; reads keys from .env
├── assets/logo.png             # Vibey wordmark
└── src/
    ├── api.js                  # transcribe / checkCrisis / getReply / speak
    ├── audio.js                # Recording + playback helpers (expo-av)
    ├── analytics.js            # PostHog events
    ├── theme.js                # Colors, personas, voices, vibe bands
    ├── context/VibeContext.js  # Global state: persona, vibe, chat history
    ├── components/             # VibeSlider (haptic), PersonaCard, PersonaChips,
    │                           # WelcomeScreen, LogoHeader, MessageBubble,
    │                           # ThinkingDots, CrisisCard
    └── screens/MainScreen.js   # Single-page app: landing grid collapses into
                                # chat + persona chips + docked slider/mic/photo
```

## How the voice loop works

Hold mic → record (expo-av) → Whisper transcription → crisis check (local regex + OpenAI moderation; if flagged, the persona is never called and a 988 support card renders) → GPT-4o reply shaped by persona + vibe + last 10 messages → ElevenLabs TTS (per-persona voice + expressiveness settings, OpenAI TTS fallback) → autoplay.

## Analytics events

`persona_selected`, `vibe_changed`, `voice_message_sent`, `photo_sent`, `crisis_guard_triggered`.

## Costs

Each voice exchange costs roughly a cent (Whisper + GPT-4o + TTS). ElevenLabs free tier covers ~10 minutes of audio/month, then falls back to OpenAI voices. Set a spending cap on your OpenAI account before sharing widely.
