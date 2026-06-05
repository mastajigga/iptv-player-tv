// stores/playlistStore.js
import { create } from 'zustand';

const usePlaylistStore = create((set) => ({
  sources: [],          // [{ id, type, url, label }]
  channels: [],         // Toutes les chaînes normalisées
  groups: [],           // Groupes uniques
  favorites: new Set(),
  history: [],          // Historique (plus récent d'abord)
  loading: true,
  searchQuery: '',

  setSources: (sources) => set({ sources }),
  setChannels: (channels) => set({ channels }),
  setGroups: (groups) => set({ groups }),
  setFavorites: (favorites) => set({ favorites }),
  setHistory: (history) => set({ history }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Canaux filtrés par la recherche
  filteredChannels: (query) => {
    const { channels } = usePlaylistStore.getState();
    if (!query?.trim()) return channels;
    const q = query.toLowerCase();
    return channels.filter((ch) => ch.name.toLowerCase().includes(q));
  },

  // Canaux d'un groupe
  channelsByGroup: (group) => {
    const { channels } = usePlaylistStore.getState();
    return channels.filter((ch) => ch.group === group);
  },

  // Favoris sous forme de liste
  favoriteChannels: () => {
    const { channels, favorites } = usePlaylistStore.getState();
    return channels.filter((ch) => favorites.has(ch.id));
  },
}));

export default usePlaylistStore;
