// utils/tv-animations.js
// Animations optimisées GPU pour WebKit Tizen

/**
 * Règle d'or TV : uniquement transform + opacity (GPU-accelerated)
 * Interdit : box-shadow, filter:blur, width/height, background-color transitions
 */

export const ANIM_PRESETS = {
  // Apparition fluide des tuiles (décalée par rang)
  tileEnter: (index) => ({
    initial: { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
    animate: { opacity: 1, transform: 'translateY(0) scale(1)' },
    transition: {
      duration: 0.35,
      delay: index * 0.05,  // Stagger effect
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),

  // Focus tuile (zoom Netflix-like)
  tileFocus: {
    scale: 1.15,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },

  // Transition de page
  pageEnter: {
    initial: { opacity: 0, transform: 'translateX(40px)' },
    animate: { opacity: 1, transform: 'translateX(0)' },
    exit: { opacity: 0, transform: 'translateX(-20px)' },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Apparition modale/overlay
  overlayEnter: {
    initial: { opacity: 0, transform: 'scale(0.95)' },
    animate: { opacity: 1, transform: 'scale(1)' },
    exit: { opacity: 0, transform: 'scale(0.95)' },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // Hero banner parallaxe lent
  heroParallax: {
    transition: { duration: 6, ease: 'easeOut' },
  },

  // OSD fade in/out
  osdFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
};

// Générer un style CSS inline pour les animations
export function focusStyle(scale = 1.15) {
  return {
    transform: `scale(${scale})`,
    transition: `transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
    outline: '3px solid #ffffff',
    outlineOffset: '4px',
    zIndex: 10,
  };
}

export function normalStyle() {
  return {
    transform: 'scale(1)',
    transition: `transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
    outline: 'none',
    outlineOffset: 0,
    zIndex: 1,
  };
}
