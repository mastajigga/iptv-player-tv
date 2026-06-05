// stores/playerStore.js
import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
  // État
  currentChannel: null,     // Canal en cours de lecture
  isPlaying: false,
  volume: 0.8,
  muted: false,
  audioTrack: null,
  subtitleTrack: null,
  showOSD: false,           // Info-bar visible
  showChannelList: false,   // Liste overlay visible
  error: null,

  // Actions
  setChannel: (channel) => set({
    currentChannel: channel,
    isPlaying: true,
    error: null,
  }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setVolume: (vol) => set({
    volume: Math.max(0, Math.min(1, vol)),
    muted: vol === 0,
  }),

  toggleMute: () => set((state) => ({ muted: !state.muted })),

  setError: (error) => set({ error, isPlaying: false }),

  clearError: () => set({ error: null }),

  toggleOSD: () => set((state) => {
    // Si OSD déjà visible, le cacher après un délai
    return { showOSD: !state.showOSD };
  }),

  showOSDTemporarily: () => {
    set({ showOSD: true });
    // Auto-hide après 5 secondes
    clearTimeout(get()._osdTimer);
    const timer = setTimeout(() => set({ showOSD: false }), 5000);
    set({ _osdTimer: timer });
  },

  toggleChannelList: () => set((state) => ({
    showChannelList: !state.showChannelList,
  })),

  setAudioTrack: (track) => set({ audioTrack: track }),
  setSubtitleTrack: (track) => set({ subtitleTrack: track }),

  stop: () => set({
    currentChannel: null,
    isPlaying: false,
    showOSD: false,
    showChannelList: false,
    error: null,
  }),
}));

export default usePlayerStore;
