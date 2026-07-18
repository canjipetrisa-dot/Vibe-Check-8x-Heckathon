// api.js — transcribe / checkCrisis / getReply / speak
// Keys come from Expo config (app.config.js -> extra). Never hardcoded.
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY;
const BASE = 'https://api.openai.com/v1';

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

export async function getReply({ persona, vibe, userText, imageBase64 }) {
  assertKey();

  const system = [
    PERSONA_STYLE[persona?.id] || PERSONA_STYLE.hype_bestie,
    vibeDirective(vibe ?? 50),
    'Speak in Gen Z voice. Keep the reply SHORT: 1–3 sentences, under 50 words.',
    'Never be genuinely cruel. Never comment negatively on bodies, identity, race, gender, or mental health.',
    'The reply will be spoken aloud — write it like natural speech, minimal emoji.',
  ].join(' ');

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
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
    }),
  });
  if (!res.ok) throw new Error(`getReply failed: ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content || '').trim();
}

// ---------- 4. Text -> speech ----------
export async function speak(text, voiceId = 'nova') {
  assertKey();
  const res = await fetch(`${BASE}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: voiceId,
      input: text,
      response_format: 'mp3',
    }),
  });
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
