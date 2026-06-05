// services/storage.js
// IndexedDB wrapper — localStorage JAMAIS utilisé sur Tizen

const DB_NAME = 'iptv-player-tv';
const DB_VERSION = 1;

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store pour les favoris
      if (!database.objectStoreNames.contains('favorites')) {
        database.createObjectStore('favorites', { keyPath: 'channelId' });
      }

      // Store pour l'historique
      if (!database.objectStoreNames.contains('history')) {
        const historyStore = database.createObjectStore('history', {
          keyPath: 'id',
          autoIncrement: true,
        });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Store pour les paramètres
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }

      // Store pour les playlists
      if (!database.objectStoreNames.contains('playlists')) {
        database.createObjectStore('playlists', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

// --- Favoris ---

export async function getFavorites() {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('favorites', 'readonly');
    const store = tx.objectStore('favorites');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.map((f) => f.channelId));
  });
}

export async function addFavorite(channelId) {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('favorites', 'readwrite');
    tx.objectStore('favorites').put({ channelId });
    tx.oncomplete = () => resolve();
  });
}

export async function removeFavorite(channelId) {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('favorites', 'readwrite');
    tx.objectStore('favorites').delete(channelId);
    tx.oncomplete = () => resolve();
  });
}

// --- Historique ---

export async function getHistory(limit = 50) {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev');
    const results = [];
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
}

export async function addToHistory(entry) {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('history', 'readwrite');
    tx.objectStore('history').add({
      ...entry,
      timestamp: Date.now(),
    });
    tx.oncomplete = () => resolve();
  });
}

// --- Paramètres ---

export async function getSettings() {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.getAll();
    request.onsuccess = () => {
      const settings = {};
      for (const item of request.result) {
        settings[item.key] = item.value;
      }
      resolve(settings);
    };
  });
}

export async function setSetting(key, value) {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('settings', 'readwrite');
    tx.objectStore('settings').put({ key, value });
    tx.oncomplete = () => resolve();
  });
}

// --- Playlists ---

export async function getPlaylists() {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('playlists', 'readonly');
    const request = tx.objectStore('playlists').getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

export async function savePlaylist(playlist) {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('playlists', 'readwrite');
    tx.objectStore('playlists').put(playlist);
    tx.oncomplete = () => resolve();
  });
}

export async function deletePlaylist(id) {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction('playlists', 'readwrite');
    tx.objectStore('playlists').delete(id);
    tx.oncomplete = () => resolve();
  });
}
