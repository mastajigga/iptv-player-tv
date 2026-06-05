# Déploiement sur Samsung TV (Tizen)

## Prérequis

- **Tizen Studio** installé : https://developer.samsung.com/tizen
- Certificat Auteur créé dans Tizen Studio (`Tools → Certificate Manager`)
- TV Samsung en **Mode Développeur** :
  1. Menu TV → Apps → Appuyer 5× sur "123"
  2. Activer Developer Mode → noter l'IP

## Build

```bash
cd ~/projects/iptv-player-tv
npm run build
```

## Package Tizen

```bash
# Copier config.xml + icône dans dist/
cp config.xml dist/
# Créer une icône 512×512 (placeholder pour le dev)
# Pour la prod : utiliser une vraie icône

# Package .wgt
cd dist && tizen package -t wgt -- .
```

## Installer sur TV physique

```bash
# Se connecter à la TV
tizen connect 192.168.X.X:26101

# Installer
tizen install -n iptv-player.wgt -- 192.168.X.X:26101

# Lancer
tizen run -p 192.168.X.X:26101
```

## Installer sur émulateur

```bash
# Lancer l'émulateur TV
tizen emulator -- TV

# Installer
tizen install -n iptv-player.wgt -- emulator-26101

# Lancer
tizen run -p emulator-26101
```

## Debug

```bash
# Logs de l'app sur la TV
tizen device-log -- 192.168.X.X:26101

# Inspecter avec Chrome DevTools (si activé dans config.xml)
# Ouvrir chrome://inspect dans Chrome desktop
```

## Notes

- `config.xml` contient `YOUR_CERT_ID` — remplacer par l'ID du certificat Tizen
- L'icône `icon.png` doit être 512×512
- Le player vidéo nécessite le privilège DRM dans config.xml
