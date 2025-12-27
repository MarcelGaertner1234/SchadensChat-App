# CLAUDE.md - SchadensChat App

Dieses Dokument gibt Claude Code alle wichtigen Informationen zur SchadensChat PWA.

---

## Aktueller Status (2024-12-27)

### ERLEDIGT - UX Verbesserungen
- **Bild-Komprimierung:** `compressImage()` in `js/app.js` - 70% kleinere Uploads
- **ARIA Accessibility:** Labels auf Buttons, aria-hidden auf SVGs, role="alert" auf Toasts
- **Firebase Hosting:** https://schadens-chat-app.web.app
- **Commit:** `e6a0279 ux: Add image compression and ARIA accessibility labels`

### ERLEDIGT - Android Build (Play Store Ready)
- **Signed Release AAB:** `android/app/build/outputs/bundle/release/app-release.aab` (3.0 MB)
- **Signed Release APK:** `android/app/build/outputs/apk/release/app-release.apk` (3.1 MB)
- **Getestet:** Android Emulator (SchadensChat AVD, Android 14, Pixel 6)

### ERLEDIGT - iOS Build (App Store Ready)
- **Release Archive:** `ios/App/build/SchadensChat.xcarchive` (9.1 MB)
- **Getestet:** iPhone 17 Pro Simulator
- **Status:** Signing in Xcode erforderlich fuer App Store Upload

---

## WICHTIG - Android Keystore Backup

**DIESE DATEIEN SICHERN! Ohne sie keine App-Updates moeglich:**

```
android/schadenschat-release.keystore
android/keystore.properties
```

| Info | Wert |
|------|------|
| **Datei** | `android/schadenschat-release.keystore` |
| **Alias** | `schadenschat` |
| **Passwort** | `schadenschat2024` |
| **Gueltigkeit** | 10.000 Tage (~27 Jahre) |

---

## Quick Commands

### Development
```bash
npm run start              # Server starten (localhost:8000)
npm run build:web          # Web Assets nach www/ kopieren
```

### Mobile Builds

#### Android
```bash
# Web Assets synchronisieren
npx cap sync android

# Debug APK bauen
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew assembleDebug

# Release AAB fuer Play Store
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew bundleRelease

# Release APK
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew assembleRelease

# Auf Emulator installieren
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### iOS
```bash
# Web Assets synchronisieren
npx cap sync ios

# Xcode oeffnen
open ios/App/App.xcodeproj

# Simulator Build (CLI)
cd ios/App && xcodebuild -project App.xcodeproj -scheme App -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build

# Archive fuer App Store
cd ios/App && xcodebuild -project App.xcodeproj -scheme App -configuration Release archive -archivePath build/SchadensChat.xcarchive
```

### Firebase
```bash
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
firebase emulators:start --only firestore,auth
```

---

## Naechste Schritte - App Store Release

### Google Play Store
1. **Account:** Google Play Developer Account ($25 einmalig)
2. **Upload:** `app-release.aab` in Play Console hochladen
3. **Store Listing:** Screenshots, Beschreibung, Datenschutz-URL

### Apple App Store
1. **Account:** Apple Developer Program ($99/Jahr)
2. **In Xcode:**
   - Target "App" > Signing & Capabilities
   - Team auswaehlen (Apple Developer Account)
   - "Automatically manage signing" aktivieren
3. **Archive:** Product > Archive > Distribute App

---

## Projekt-Uebersicht

**SchadensChat** ist eine mobile-first Progressive Web App (PWA) zur Vermittlung von Fahrzeugschaeden zwischen Kunden und Werkstaetten.

| Info | Wert |
|------|------|
| **Repository** | https://github.com/MarcelGaertner1234/SchadensChat-App.git |
| **Live URL** | https://marcelgaertner1234.github.io/SchadensChat-App/ |
| **Firebase Hosting** | https://schadens-chat-app.web.app |
| **Bundle ID** | `com.schadenschat.app` |

---

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| **Frontend** | Vanilla JS, HTML5, CSS3 (keine Frameworks!) |
| **Backend** | Firebase (Firestore, Auth, Storage, Functions) |
| **Hosting** | GitHub Pages + Firebase Hosting |
| **Mobile** | Capacitor 8.0 (iOS/Android Wrapper) |
| **PWA** | Service Worker, Manifest, Offline-Support |
| **Icons** | SVG Sprite System (keine Emojis!) |

---

## Dateistruktur

```
schadens-chat-app/
├── index.html              # Kunden-App (Schadensmeldung)
├── werkstatt.html          # Werkstatt-Portal (Dashboard, Anfragen, Chat)
├── landing.html            # Marketing Landingpage
├── offline.html            # Offline-Fallback
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker
├── capacitor.config.json   # Capacitor Config (iOS/Android)
├── js/
│   ├── app.js              # Kunden-App Logik (inkl. compressImage!)
│   ├── workshop.js         # Werkstatt-Portal Logik
│   ├── auth.js             # Firebase Auth
│   ├── firebase-config.js  # Firebase Initialisierung
│   ├── i18n.js             # Internationalisierung (DE/EN/TR/RU)
│   ├── notifications.js    # Push Notifications
│   └── subscription.js     # Abo-System
├── css/
│   └── mobile.css          # Hauptstyles
├── android/                # Capacitor Android Build
│   ├── app/build.gradle    # Signing Config
│   ├── keystore.properties # Keystore Credentials (gitignored!)
│   └── schadenschat-release.keystore # Signing Key (gitignored!)
├── ios/                    # Capacitor iOS Build
│   └── App/
│       ├── App.xcodeproj   # Xcode Projekt
│       └── build/          # Archive Output
└── www/                    # Capacitor Web Assets (auto-generiert)
```

---

## SVG Icon System

**WICHTIG:** Keine Emojis verwenden! Stattdessen SVG Icons:

```html
<!-- Icon einbinden -->
<svg class="icon icon-lg"><use href="#icon-car"></use></svg>

<!-- Groessen: icon-sm (16px), icon-md (20px), icon-lg (24px), icon-xl (32px) -->
```

**Verfuegbare Icons:**
`car`, `camera`, `clipboard`, `lock`, `user`, `zap`, `dollar`, `shield`, `sun`, `moon`, `image`, `lightbulb`, `check-circle`, `message`, `settings`, `arrow-left`, `arrow-right`, `check`, `wrench`, `smartphone`, `clock`

---

## CSS Design System (Business Theme)

### Farben (CSS Variables)
```css
/* Primary Colors - Business Blue */
--primary: #1e3a5f;
--primary-dark: #0f2744;
--primary-light: #4a6fa5;
--secondary: #2d3748;
--accent: #3182ce;

/* Status Colors */
--success: #38a169;
--danger: #e53e3e;
--warning: #dd6b20;
--info: #3182ce;
```

---

## Wichtige Patterns

### Bild-Komprimierung (NEU!)
```javascript
// In js/app.js - automatisch bei Photo-Upload
async compressImage(file, maxWidth = 1200, quality = 0.8) {
    // Komprimiert auf max 1200px Breite, 80% JPEG Qualitaet
    // Reduziert Upload-Groesse um ~70%
}
```

### Firebase Auth Check
```javascript
await window.firebaseReady;
if (!firebase.auth().currentUser) {
    Workshop.showLogin();
    return;
}
```

### Toast Notifications
```javascript
Workshop.showToast('Nachricht', 'success'); // success, error, info, warning
```

---

## Bekannte Issues

1. **Service Worker Path** - Bei GitHub Pages: `/SchadensChat-App/sw.js`
2. **Firebase Auth Persistence** - LocalStorage wird verwendet
3. **Mobile Viewport** - `safe-area-inset-*` fuer Notch-Geraete beachten
4. **iOS Signing** - Apple Developer Account erforderlich fuer App Store

---

## Build-Outputs (aktuell)

| Plattform | Datei | Groesse | Status |
|-----------|-------|---------|--------|
| **Android AAB** | `android/app/build/outputs/bundle/release/app-release.aab` | 3.0 MB | Signiert, Play Store ready |
| **Android APK** | `android/app/build/outputs/apk/release/app-release.apk` | 3.1 MB | Signiert |
| **iOS Archive** | `ios/App/build/SchadensChat.xcarchive` | 9.1 MB | Signing erforderlich |

---

## Kontakt & Links

- **GitHub:** https://github.com/MarcelGaertner1234/SchadensChat-App
- **Live Demo:** https://marcelgaertner1234.github.io/SchadensChat-App/
- **Firebase Hosting:** https://schadens-chat-app.web.app
- **Kunden-App:** .../index.html
- **Werkstatt-Portal:** .../werkstatt.html

---

_Version: 3.0 (2024-12-27) - UX Improvements + Android/iOS Builds_
