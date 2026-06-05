# IPTV Player — Samsung TV App

> Lecteur IPTV universel pour Samsung Smart TV (Tizen) avec interface Netflix-like.

![Status](https://img.shields.io/badge/status-phase%202%20complete-red)
![Stack](https://img.shields.io/badge/stack-React%2018%20%2B%20Vite%20%2B%20Zustand-blue)
![Platform](https://img.shields.io/badge/platform-Samsung%20TV%20(Tizen%204.0%2B)-1428a0)

## 🎯 Objectif

Un lecteur IPTV qui combine :
- **L'UI de Netflix** (Hero Banner, Tile Rows, animations fluides)
- **Les fonctionnalités IPTV** (M3U/XTream, EPG, multi-playlists, favoris, catch-up)
- **La performance TV** (animations GPU, bundle < 3 Mo, navigation télécommande)

## 🏗️ Architecture

```
src/
├── components/
│   ├── tiles/        # HeroBanner, Tile, TileRow (Netflix-like)
│   ├── player/       # Player HLS (natif + HLS.js fallback)
│   └── shell/        # Layout TV 1920×1080, navigation clavier
├── hooks/            # useTVPlayer, usePlaylist, useRemoteNav
├── services/         # M3U parser, IndexedDB storage
├── stores/           # Zustand (player, playlists, settings)
└── utils/            # Key codes, animations TV-safe
```

## 🚀 Quick Start

```bash
npm install
npm run dev        # Développement dans Chrome (flèches = télécommande)
npm run build      # Build → dist/
```

### Déploiement sur Samsung TV

```bash
# Copier config.xml + icon.png dans dist/
# Puis :
tizen package -t wgt -- dist/
tizen install -n iptv-player.wgt -- 192.168.X.X:26101
```

## 📦 Stack

| Couche | Technologie |
|--------|-------------|
| Framework | React 18 + Vite |
| State | Zustand |
| Player | HLS.js (fallback si natif Tizen indisponible) |
| Storage | IndexedDB (pas de localStorage sur TV) |
| Target | Tizen 4.0+ (Samsung Smart TV 2018+) |

## 🗺️ Roadmap

- [x] **Phase 1** — Setup Vite + React, Tizen bridge, Player HLS, M3U parser, IndexedDB
- [x] **Phase 2** — Shell Netflix : HeroBanner, TileRows, animations fluides
- [ ] **Phase 3** — IPTV Core : EPG, multi-playlists, favoris, catch-up, timeshift
- [ ] **Phase 4** — Polish : profils, recherche, contrôle parental, thèmes, packaging Tizen

## ⚠️ Contraintes TV

- Résolution fixe 1920×1080
- Navigation **clavier uniquement** (pas de souris)
- RAM < 512 Mo → bundle < 3 Mo
- Animations `transform` + `opacity` seulement (GPU)
- Pas de `localStorage` → IndexedDB
- HLS natif pas fiable → fallback HLS.js

## 📄 Licence

MIT
