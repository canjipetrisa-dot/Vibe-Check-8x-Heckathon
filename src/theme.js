export const COLORS = {
  bg: '#0D0B1A',
  card: '#1C1730',
  cardSelected: '#2A2150',
  text: '#F5F2FF',
  textDim: '#9B93B8',
  accent: '#A78BFA',
  hypeBlue: '#6EA8FF',
  roastRed: '#FF3D5A',
  userBubble: '#7C5CFF',
  aiBubble: '#221B3E',
  crisisBg: '#F5F2FF',
  crisisText: '#1A1A2E',
};

export const PERSONAS = [
  {
    id: 'hype_bestie',
    name: 'Hype Bestie',
    emoji: '🥰',
    tagline: 'your #1 fan fr',
    voiceId: 'coral', // female (OpenAI fallback)
    voiceStyle:
      'Young excited female best friend. High energy, fast-paced, warm, giggly. Genuinely thrilled for the listener, like sharing amazing news.',
    elevenVoiceId: 'XfNU2rGpBa01ckF309OY', // user-picked: Hype Bestie
    elevenSettings: { stability: 0.3, similarity_boost: 0.8, style: 0.6 },
    gradient: ['#FF8AD8', '#7C5CFF'],
  },
  {
    id: 'no_nonsense_auntie',
    name: 'No-Nonsense Auntie',
    emoji: '💅',
    tagline: 'said what she said',
    voiceId: 'nova', // female (OpenAI fallback)
    voiceStyle:
      'Confident older female with sass and attitude. Deliberate pacing, dramatic pauses, side-eye energy. Loving but done with nonsense — every word lands.',
    elevenVoiceId: '4O1sYUnmtThcBoSBrri7', // user-picked: Auntie
    elevenSettings: { stability: 0.45, similarity_boost: 0.8, style: 0.65 },
    gradient: ['#FFB86B', '#FF5E8A'],
  },
  {
    id: 'chaotic_gremlin',
    name: 'Chaotic Gremlin',
    emoji: '😈',
    tagline: 'unhinged (affectionate)',
    voiceId: 'ash', // male (OpenAI fallback)
    voiceStyle:
      'Chaotic young male gremlin. Mischievous, unpredictable rhythm — sudden speed-ups, conspiratorial whispers, barely contained laughter. Feral but friendly.',
    elevenVoiceId: 'SCbIlR40EEyW2I6quW1h', // user-picked: Gremlin
    elevenSettings: { stability: 0.2, similarity_boost: 0.75, style: 0.8 },
    gradient: ['#5CFF9D', '#00C2FF'],
  },
  {
    id: 'zen_one',
    name: 'Zen One',
    emoji: '🧘',
    tagline: 'inhale the good vibes',
    voiceId: 'onyx', // male (OpenAI fallback)
    voiceStyle:
      'Deep calm male voice, slow and grounded like a meditation guide with a sense of humor. Soothing, spacious pauses, gentle warmth.',
    elevenVoiceId: 'auq43ws1oslv0tO4BDa7', // user-picked: Zen One
    elevenSettings: { stability: 0.8, similarity_boost: 0.8, style: 0.15 },
    gradient: ['#8BE9FD', '#A78BFA'],
  },
];

export function vibeLabel(vibe) {
  if (vibe <= 33) return '🥺 hype me up';
  if (vibe <= 66) return '😐 real talk';
  return '💀 humble me';
}
