// stores/playlistStore.js — mis à jour avec favoris toggle + groupes custom
import { create } from 'zustand';

const usePlaylistStore = create((set, get) => ({
  sources: [],
  channels: [],
  groups: [],
  customGroups: [],       // Groupes créés par l'utilisateur
  favorites: new Set(),
  history: [],
  loading: true,
  searchQuery: '',
  epgProgrammes: [],      // Données EPG
  epgChannels: [],        // Chaînes avec EPG

  setSources: (sources) => set({ sources }),
  setChannels: (channels) => set({ channels }),
  setGroups: (groups) => set({ groups }),
  setFavorites: (favorites) => set({ favorites }),
  setHistory: (history) => set({ history }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setEPGData: (channels, programmes) => set({ epgChannels: channels, epgProgrammes: programmes }),

  // Favoris
  toggleFavorite: (channelId) => {
    const { favorites } = get();
    const next = new Set(favorites);
    if (next.has(channelId)) {
      next.delete(channelId);
    } else {
      next.add(channelId);
    }
    set({ favorites: next });
  },

  isFavorite: (channelId) => get().favorites.has(channelId),

  favoriteChannels: () => {
    const { channels, favorites } = get();
    return channels.filter((ch) => favorites.has(ch.id));
  },

  // Groupes personnalisés
  addCustomGroup: (name) => {
    const { customGroups } = get();
    if (customGroups.find((g) => g.name === name)) return;
    set({ customGroups: [...customGroups, { id: `custom_${Date.now()}`, name, channelIds: [] }] });
  },

  removeCustomGroup: (groupId) => {
    set({ customGroups: get().customGroups.filter((g) => g.id !== groupId) });
  },

  addToCustomGroup: (groupId, channelId) => {
    set({
      customGroups: get().customGroups.map((g) =>
        g.id === groupId ? { ...g, channelIds: [...new Set([...g.channelIds, channelId])] } : g
      ),
    });
  },

  removeFromCustomGroup: (groupId, channelId) => {
    set({
      customGroups: get().customGroups.map((g) =>
        g.id === groupId ? { ...g, channelIds: g.channelIds.filter((id) => id !== channelId) } : g
      ),
    });
  },

  channelsByGroup: (group) => {
    const { channels, customGroups } = get();
    // Groupe standard (depuis M3U)
    const standard = channels.filter((ch) => ch.group === group);
    if (standard.length > 0) return standard;

    // Groupe personnalisé
    const custom = customGroups.find((g) => g.name === group);
    if (custom) {
      return custom.channelIds
        .map((id) => channels.find((ch) => ch.id === id))
        .filter(Boolean);
    }
    return [];
  },

  filteredChannels: (query) => {
    const { channels } = get();
    if (!query?.trim()) return channels;
    const q = query.toLowerCase();
    return channels.filter((ch) => ch.name.toLowerCase().includes(q));
  },
}));

export default usePlaylistStore;
