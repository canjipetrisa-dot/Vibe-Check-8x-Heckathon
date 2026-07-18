// api.js — transcribe / checkCrisis / getReply / speak
// Keys come from Expo config (app.config.js -> extra). Never hardcoded.
import Constants from 'expo-constants';
// v19 moved this API to /legacy — the main entry no longer exports
// cacheDirectory / writeAsStringAsync, which broke TTS silently.
import * as FileSystem from 'expo-file-system/legacy';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = Constants.expoConfig?.extra?.ELEVENLABS_API_KEY;
const BASE = 'https://api.openai.com/v1';
const ELEVEN_BASE = 'https://api.elevenlabs.io/v1';

function assertKey() {
  if (!OPENAI_API_KEY) {
    throw new Error(
      'Missing OPENAI_API_KEY. Start with: OPENAI_API_KEY=sk-... npx expo start'
    );
  }
}

// ---------- 1. Speech -> text ----------
export async function transcribe(audioUri) {
  assertKey();
  const form = new FormData();
  form.append('file', {
    uri: audioUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  });
  form.append('model', 'whisper-1');

  const res = await fetch(`${BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`transcribe failed: ${res.status}`);
  const json = await res.json();
  return (json.text || '').trim();
}

// ---------- 2. Crisis guard ----------
const CRISIS_PATTERNS = [
  /\bkill(ing)? myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend(ing)? it all\b/i,
  /\bend my life\b/i,
  /\bwant(ed)? to die\b/i,
  /\bdon'?t want to (be alive|live)\b/i,
  /\bself[- ]harm\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bcut(ting)? myself\b/i,
  /\bno reason to live\b/i,
  /\bbetter off dead\b/i,
];

export async function checkCrisis(userText) {
  if (!userText) return false;
  // Fast local check first — works even offline.
  if (CRISIS_PATTERNS.some((re) => re.test(userText))) return true;

  // Second pass: OpenAI moderation (best-effort; never blocks the flow on error).
  try {
    assertKey();
    const res = await fetch(`${BASE}/moderations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: userText }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    const cats = json.results?.[0]?.categories || {};
    return Boolean(
      cats['self-harm'] ||
        cats['self-harm/intent'] ||
        cats['self-harm/instructions']
    );
  } catch (e) {
    return false;
  }
}

// ---------- 3. Persona reply ----------
function vibeDirective(vibe) {
  if (vibe <= 33)
    return 'Vibe: HYPE MODE. Be warm, encouraging, gas them up. Zero negativity.';
  if (vibe <= 66)
    return 'Vibe: REAL TALK. Be honest and balanced — kind but direct, no sugarcoating.';
  return 'Vibe: HUMBLE ME. Playfully roast them — savage but clearly affectionate. Punch at choices and situations, never at identity, body, or appearance-shaming.';
}

const PERSONA_STYLE = {
  hype_bestie:
    "You are Hype Bestie 🥰 — the user's ride-or-die best friend. Bubbly, supportive, lots of energy.",
  no_nonsense_auntie:
    'You are No-Nonsense Auntie 💅 — loving but blunt. You keep it 100 and call things out with style.',
  chaotic_gremlin:
    'You are Chaotic Gremlin 😈 — unhinged (affectionate), absurd humor, feral little comments.',
  zen_one:
    'You are Zen One 🧘 — calm, grounded, a little cosmic. Chill wisdom with a wink.',
};

// history: array of prior chat messages [{role: 'user'|'ai', text}] for continuity.
export async function getReply({ persona, vibe, userText, imageBase64, history = [] }) {
  assertKey();

  const system = [
    PERSONA_STYLE[persona?.id] || PERSONA_STYLE.hype_bestie,
    vibeDirective(vibe ?? 50),
    'You are the friend whose replies get screenshotted. Sharp, funny, zero filler.',
    'Lead with the punchline or the truth bomb — never open with warm-up phrases like "okay so" or "I hear you".',
    'You still read the person: catch the real dynamic underneath (avoidance, fear of rejection, burnout, comparison) and weave ONE concrete, specific move INTO the joke — an action, an exact script to say, or a decision rule. Never vague advice like "just communicate".',
    'Humor: current internet Gen Z wit, unexpected comparisons, playful exaggeration. Absolutely no dad jokes, no stale millennial slang, no "chef\'s kiss" energy.',
    'Remember earlier parts of this conversation — you have been listening, callbacks are funny.',
    'Length: 1–2 sentences, HARD MAX 35 words. Every word earns its place. Spoken aloud, so write like speech — contractions, rhythm, no emoji.',
    'Never be genuinely cruel. Never comment negatively on bodies, identity, race, gender, or mental health. Roasts target choices and situations only.',
  ].join(' ');

  // Map prior chat into OpenAI roles, skipping crisis cards / thinking bubbles.
  const historyMessages = history
    .filter((m) => (m.role === 'user' || m.role === 'ai') && m.text)
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

  const userContent = [];
  if (userText) userContent.push({ type: 'text', text: userText });
  if (imageBase64) {
    if (!userText)
      userContent.push({
        type: 'text',
        text: 'React to this photo I just showed you.',
      });
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
    });
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 90,
      temperature: 1.05,
      presence_penalty: 0.4,
      messages: [
        { role: 'system', content: system },
        ...historyMessages,
        { role: 'user', content: userContent },
      ],
    }),
  });
  if (!res.ok) throw new Error(`getReply failed: ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content || '').trim();
}

// ---------- 4. Text -> speech ----------
// speak(text, persona) — prefers ElevenLabs character voices when
// ELEVENLABS_API_KEY is set; falls back to OpenAI TTS otherwise.
export async function speak(text, persona = {}) {
  let res = null;

  // 1. ElevenLabs: actual character voices with per-persona expressiveness.
  if (ELEVENLABS_API_KEY && persona.elevenVoiceId) {
    try {
      res = await fetch(
        `${ELEVEN_BASE}/text-to-speech/${persona.elevenVoiceId}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: persona.elevenSettings,
          }),
        }
      );
      if (!res.ok) res = null; // fall through to OpenAI
    } catch (e) {
      res = null;
    }
  }

  // 2. OpenAI steerable TTS fallback.
  if (!res) {
    assertKey();
    const request = (body) =>
      fetch(`${BASE}/audio/speech`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

    res = await request({
      model: 'gpt-4o-mini-tts',
      voice: persona.voiceId || 'nova',
      input: text,
      ...(persona.voiceStyle ? { instructions: persona.voiceStyle } : {}),
      response_format: 'mp3',
    });

    if (!res.ok) {
      res = await request({
        model: 'tts-1',
        voice: persona.voiceId || 'nova',
        input: text,
        response_format: 'mp3',
      });
    }
  }
  if (!res.ok) throw new Error(`speak failed: ${res.status}`);

  // RN fetch: blob -> base64 -> local file for expo-av.
  const blob = await res.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const fileUri = `${FileSystem.cacheDirectory}vibe-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}
