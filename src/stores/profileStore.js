// stores/profileStore.js
// Gestion des profils utilisateurs (max 5)

import { create } from 'zustand';
import * as storage from '../services/storage';

const COLORS = ['#e50914', '#0071eb', '#46d369', '#f5c518', '#ff7b9c'];
const AVATARS = ['👤', '👩', '👨', '👶', '👵'];

const DEFAULT_PROFILES = [
  { id: 'default', name: 'Moi', avatar: '👤', color: COLORS[0], pin: null, isKid: false },
];

const useProfileStore = create((set, get) => ({
  profiles: [...DEFAULT_PROFILES],
  activeProfileId: 'default',
  showProfilePicker: false,
  loaded: false,

  init: async () => {
    try {
      const allSettings = await storage.getSettings();
      const storedProfiles = allSettings?.profiles;
      if (storedProfiles && Array.isArray(storedProfiles) && storedProfiles.length > 0) {
        const activeId = allSettings?.activeProfileId || storedProfiles[0].id;
        set({
          profiles: storedProfiles,
          activeProfileId: activeId,
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  setActiveProfile: async (profileId) => {
    const { profiles } = get();
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return false;

    // Vérifier le PIN si profil protégé
    if (profile.pin) {
      return 'pin_required';
    }

    set({ activeProfileId: profileId, showProfilePicker: false });
    await storage.setSetting('activeProfileId', profileId);
    return true;
  },

  verifyPin: async (profileId, pin) => {
    const { profiles } = get();
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile || profile.pin !== pin) return false;

    set({ activeProfileId: profileId, showProfilePicker: false });
    await storage.setSetting('activeProfileId', profileId);
    return true;
  },

  addProfile: async (name, isKid = false, pin = null) => {
    const { profiles } = get();
    if (profiles.length >= 5) return false;

    const colorIdx = profiles.length % COLORS.length;
    const newProfile = {
      id: `profile_${Date.now()}`,
      name: name || `Profil ${profiles.length + 1}`,
      avatar: AVATARS[profiles.length % AVATARS.length],
      color: COLORS[colorIdx],
      pin: pin || null,
      isKid,
    };

    const updated = [...profiles, newProfile];
    set({ profiles: updated });
    await storage.setSetting('profiles', updated);
    return newProfile;
  },

  removeProfile: async (profileId) => {
    const { profiles, activeProfileId } = get();
    if (profiles.length <= 1) return false;

    const updated = profiles.filter((p) => p.id !== profileId);
    const newActive = activeProfileId === profileId ? updated[0].id : activeProfileId;

    set({ profiles: updated, activeProfileId: newActive });
    await storage.setSetting('profiles', updated);
    await storage.setSetting('activeProfileId', newActive);
    return true;
  },

  setPin: async (profileId, pin) => {
    const { profiles } = get();
    const updated = profiles.map((p) => (p.id === profileId ? { ...p, pin } : p));
    set({ profiles: updated });
    await storage.setSetting('profiles', updated);
  },

  isKidProfile: () => {
    const { profiles, activeProfileId } = get();
    return profiles.find((p) => p.id === activeProfileId)?.isKid || false;
  },

  openProfilePicker: () => set({ showProfilePicker: true }),
  closeProfilePicker: () => set({ showProfilePicker: false }),
}));

export default useProfileStore;
