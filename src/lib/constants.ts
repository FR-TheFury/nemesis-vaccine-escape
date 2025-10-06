export const GAME_CONFIG = {
  TIMER_DURATION: 3600, // 60 minutes en secondes
  MAX_PLAYERS: 8,
  MIN_PLAYERS: 1,
  MAX_HINTS: 3,
  HEARTBEAT_INTERVAL: 30000, // 30 secondes
  DISCONNECT_THRESHOLD: 120000, // 2 minutes
} as const;

export const ZONE_NAMES = {
  1: 'Bureau du Dr Morel',
  2: 'Laboratoire de Microbiologie',
  3: 'Salle de Confinement',
} as const;

export const AUDIO_FILES = {
  AMBIANCE: '/assets/sounds/ambiance.mp3',
  ALARM: '/assets/sounds/alarm.mp3',
  SUCCESS: '/assets/sounds/success.mp3',
  FAILURE: '/assets/sounds/failure.mp3',
  VOICE_ALERT: '/assets/sounds/voice-alert.mp3',
  UNLOCK: '/assets/sounds/unlock.mp3',
} as const;

export const COLORS = {
  NEON_BLUE: '#00d4ff',
  NEON_RED: '#ff0040',
  NEON_GREEN: '#00ff88',
  BG_DARK: '#0a0e1a',
  BG_DARKER: '#050711',
} as const;
