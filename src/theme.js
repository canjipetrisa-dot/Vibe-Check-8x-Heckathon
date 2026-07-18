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
    voiceId: 'shimmer',
    gradient: ['#FF8AD8', '#7C5CFF'],
  },
  {
    id: 'no_nonsense_auntie',
    name: 'No-Nonsense Auntie',
    emoji: '💅',
    tagline: 'said what she said',
    voiceId: 'nova',
    gradient: ['#FFB86B', '#FF5E8A'],
  },
  {
    id: 'chaotic_gremlin',
    name: 'Chaotic Gremlin',
    emoji: '😈',
    tagline: 'unhinged (affectionate)',
    voiceId: 'echo',
    gradient: ['#5CFF9D', '#00C2FF'],
  },
  {
    id: 'zen_one',
    name: 'Zen One',
    emoji: '🧘',
    tagline: 'inhale the good vibes',
    voiceId: 'onyx',
    gradient: ['#8BE9FD', '#A78BFA'],
  },
];

export function vibeLabel(vibe) {
  if (vibe <= 33) return '🥺 hype me up';
  if (vibe <= 66) return '😐 real talk';
  return '💀 humble me';
}
