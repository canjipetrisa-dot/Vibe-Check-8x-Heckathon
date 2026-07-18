export const COLORS = {
  bg: '#050509',
  card: '#13131D',
  cardSelected: '#1A1A2A',
  text: '#FFFFFF',
  textMid: '#B9B9C9',
  textDim: '#8A8A9E',
  accent: '#8B7CF6',
  hypeBlue: '#5B8DEF',
  roastRed: '#E5484D',
  userBubble: '#4F46E5',
  aiBubble: '#15151F',
  crisisBg: '#F5F2FF',
  crisisText: '#1A1A2E',
};

export const PERSONAS = [
  {
    id: 'hype_bestie',
    name: 'Hype Bestie',
    emoji: '🔥',
    tagline: 'your #1 fan',
    voiceId: 'coral', // female (OpenAI fallback)
    voiceStyle:
      'Young excited female best friend. High energy, fast-paced, warm, giggly. Genuinely thrilled for the listener, like sharing amazing news.',
    elevenVoiceId: 'XfNU2rGpBa01ckF309OY', // user-picked: Hype Bestie
    elevenSettings: { stability: 0.3, similarity_boost: 0.8, style: 0.6 },
    gradient: ['#E0709A', '#8B5CF6'],
  },
  {
    id: 'no_nonsense_auntie',
    name: 'No-Nonsense Auntie',
    emoji: '🎯',
    tagline: 'said what she said',
    voiceId: 'nova', // female (OpenAI fallback)
    voiceStyle:
      'Confident older female with sass and attitude. Deliberate pacing, dramatic pauses, side-eye energy. Loving but done with nonsense — every word lands.',
    elevenVoiceId: '4O1sYUnmtThcBoSBrri7', // user-picked: Auntie
    elevenSettings: { stability: 0.45, similarity_boost: 0.8, style: 0.65 },
    gradient: ['#D98E4A', '#C74B6E'],
  },
  {
    id: 'chaotic_gremlin',
    name: 'Chaotic Gremlin',
    emoji: '😈',
    tagline: 'unhinged, affectionate',
    voiceId: 'ash', // male (OpenAI fallback)
    voiceStyle:
      'Chaotic young male gremlin. Mischievous, unpredictable rhythm — sudden speed-ups, conspiratorial whispers, barely contained laughter. Feral but friendly.',
    elevenVoiceId: 'SCbIlR40EEyW2I6quW1h', // user-picked: Gremlin
    elevenSettings: { stability: 0.2, similarity_boost: 0.75, style: 0.8 },
    gradient: ['#3ECF8E', '#38BDF8'],
  },
  {
    id: 'zen_one',
    name: 'Zen One',
    emoji: '🌊',
    tagline: 'calm in the chaos',
    voiceId: 'onyx', // male (OpenAI fallback)
    voiceStyle:
      'Deep calm male voice, slow and grounded like a meditation guide with a sense of humor. Soothing, spacious pauses, gentle warmth.',
    elevenVoiceId: 'auq43ws1oslv0tO4BDa7', // user-picked: Zen One
    elevenSettings: { stability: 0.8, similarity_boost: 0.8, style: 0.15 },
    gradient: ['#67B8D6', '#8B7CF6'],
  },
];

export function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function vibeLabel(vibe) {
  if (vibe <= 33) return 'hype me up';
  if (vibe <= 66) return 'real talk';
  return 'humble me';
}
