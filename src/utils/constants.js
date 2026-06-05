// utils/constants.js
// Constantes pour TV Samsung (1920×1080, WebKit)

export const SCREEN = {
  WIDTH: 1920,
  HEIGHT: 1080,
  SAFE_LEFT: 80,    // Marge gauche pour le contenu
  SAFE_TOP: 60,
};

export const TILE = {
  WIDTH: 300,
  HEIGHT: 170,
  GAP: 12,
  FOCUS_SCALE: 1.15,
};

export const FONT = {
  XS: '20px',
  SM: '24px',
  MD: '28px',
  LG: '40px',
  XL: '56px',
  XXL: '80px',
};

export const COLORS = {
  BG_PRIMARY: '#141414',
  BG_SECONDARY: '#1a1a1a',
  BG_ELEVATED: '#232323',
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#b3b3b3',
  TEXT_MUTED: '#808080',
  ACCENT: '#e50914',
  ACCENT_HOVER: '#f40612',
  FOCUS_RING: '#ffffff',
  SUCCESS: '#2ecc71',
  WARNING: '#f39c12',
};

export const KEY = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  ENTER: 13,
  BACK: 10009,
  EXIT: 10182,
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
  FF: 417,
  REW: 412,
  CH_UP: 10010,
  CH_DOWN: 10011,
  RED: 403,
  GREEN: 404,
  YELLOW: 405,
  BLUE: 406,
  DIGIT_0: 48,
  DIGIT_9: 57,
  // Tizen/Samsung specific mapping
  MEDIA_PLAY_PAUSE: 10252,
  MEDIA_PLAY: 415,
  MEDIA_PAUSE: 19,
  MEDIA_STOP: 413,
  MEDIA_TRACK_PREV: 10232,
  MEDIA_TRACK_NEXT: 10233,
};

export const ANIMATION = {
  FAST: '150ms',
  NORMAL: '250ms',
  SLOW: '400ms',
  EASE_SMOOTH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  EASE_BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Durée max avant d'afficher un loader
export const LOADER_THRESHOLD = 500; // ms
