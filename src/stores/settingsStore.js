// stores/settingsStore.js
import { create } from 'zustand';
import * as storage from '../services/storage';

const DEFAULT_SETTINGS = {
  theme: 'dark',           // 'dark' | 'oled'
  fontSize: 'medium',      // 'small' | 'medium' | 'large'
  autoPlayHero: true,      // Lecture auto du hero banner
  parentalPin: null,       // Code PIN contrôle parental
  defaultVolume: 0.8,
  language: 'fr',
  epgDaysToShow: 3,        // Jours d'EPG à charger
  channelSwitchDelay: 300,  // ms entre changements de chaîne
  showAdultContent: false,  // Afficher les chaînes adultes
};

const useSettingsStore = create((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  loaded: false,

  init: async () => {
    try {
      const stored = await storage.getSettings();
      set({
        settings: { ...DEFAULT_SETTINGS, ...stored },
        loaded: true,
      });
    } catch {
      set({ settings: { ...DEFAULT_SETTINGS }, loaded: true });
    }
  },

  updateSetting: async (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
    await storage.setSetting(key, value);
  },

  resetSetting: async (key) => {
    const defaultValue = DEFAULT_SETTINGS[key];
    set((state) => ({
      settings: { ...state.settings, [key]: defaultValue },
    }));
    if (defaultValue !== undefined) {
      await storage.setSetting(key, defaultValue);
    }
  },

  getSetting: (key) => {
    return get().settings[key] ?? DEFAULT_SETTINGS[key];
  },
}));

export default useSettingsStore;
export { DEFAULT_SETTINGS };
