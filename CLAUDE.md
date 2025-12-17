# CLAUDE.md - SchadensChat App

Dieses Dokument gibt Claude Code alle wichtigen Informationen zur SchadensChat PWA.

---

## Aktueller Status (2024-12-16)

### ✅ ERLEDIGT - Business/Corporate Redesign
Das Design wurde von "verspielt/neon" zu "Business/Corporate" umgestaltet:

**Farbänderungen:**
```css
/* ALT (Neon/Playful) */
--primary: #667eea;
--accent: #f093fb;

/* NEU (Business Blue) */
--primary: #1e3a5f;      /* Dark Navy Blue */
--primary-dark: #0f2744;
--primary-light: #4a6fa5;
--secondary: #2d3748;
--accent: #3182ce;
```

**Entfernt:**
- Alle Emoji-Icons → ersetzt durch SVG Icon Sprite System
- Bouncy Animations (bounceIn, float, confetti, heroGlow, particleFloat)
- Übertriebene Glasmorphism-Effekte
- Neon Gradients

**Commits:**
- `14a0e41` - style: Business/Corporate redesign
- `4e8df50` - feat: App Store deployment preparation

---

### ✅ ERLEDIGT - App Store Vorbereitung

**Icons generiert:**
- 15 iOS Icons (20px - 1024px) in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- 15 Android Icons (48px - 192px) in `android/app/src/main/res/mipmap-*/`
- Icon Generator Script: `scripts/generate-icons.js`

**Capacitor Config aktualisiert:**
- Background Color: `#1e3a5f` (neu)
- Splash Screen Color: `#1e3a5f`
- Status Bar Color: `#1e3a5f`

**Build Status:**
- iOS Build: ✅ ERFOLGREICH (getestet mit xcodebuild)
- Android Build: ⏳ Bereit (Gradle Download timeout, manuell testen)

---

### 🔲 OFFEN - Nächste Schritte für App Store

#### iOS App Store
1. **Apple Developer Account** erstellen ($99/Jahr)
   - developer.apple.com
   - App ID registrieren: `com.schadenschat.app`

2. **In Xcode:**
   ```bash
   npm run ios  # Öffnet Xcode
   ```
   - Signing & Capabilities konfigurieren
   - Team auswählen
   - Product → Archive → Distribute App

3. **App Store Connect:**
   - Screenshots hochladen (6.7", 6.5", 5.5")
   - Beschreibung, Keywords
   - Datenschutz-URL

#### Google Play Store
1. **Google Play Developer Account** erstellen ($25 einmalig)
   - play.google.com/console

2. **Keystore erstellen:**
   ```bash
   keytool -genkey -v -keystore schadens-chat.keystore \
     -alias schadens-chat -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **In Android Studio:**
   ```bash
   npm run android  # Öffnet Android Studio
   ```
   - Build → Generate Signed Bundle/APK
   - AAB (Android App Bundle) für Play Store

---

## Projekt-Übersicht

**SchadensChat** ist eine mobile-first Progressive Web App (PWA) zur Vermittlung von Fahrzeugschäden zwischen Kunden und Werkstätten.

**Repository:** https://github.com/MarcelGaertner1234/SchadensChat-App.git
**Live URL:** https://marcelgaertner1234.github.io/SchadensChat-App/

---

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| **Frontend** | Vanilla JS, HTML5, CSS3 (keine Frameworks!) |
| **Backend** | Firebase (Firestore, Auth, Storage, Functions) |
| **Hosting** | GitHub Pages (Auto-Deploy bei Push) |
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
│   ├── app.js              # Kunden-App Logik
│   ├── workshop.js         # Werkstatt-Portal Logik (Hauptdatei!)
│   ├── auth.js             # Firebase Auth
│   ├── firebase-config.js  # Firebase Initialisierung
│   ├── i18n.js             # Internationalisierung (DE/EN/TR/RU)
│   ├── notifications.js    # Push Notifications
│   ├── subscription.js     # Abo-System (Trial, Starter, Pro, Enterprise)
│   ├── request-manager.js  # Anfragen-Verwaltung
│   └── workshop-requests.js # Werkstatt-spezifische Anfragen
├── css/
│   └── mobile.css          # Hauptstyles (ehemals workshop.css)
├── img/
│   ├── icon.svg            # App Icon (512x512, Business Blue)
│   └── icon-192.svg        # App Icon klein (192x192)
├── scripts/
│   └── generate-icons.js   # Icon Generator für iOS/Android
├── firestore.rules         # Firestore Security Rules
├── storage.rules           # Storage Security Rules
├── firebase.json           # Firebase Config
├── functions/              # Cloud Functions
├── android/                # Capacitor Android Build
│   └── app/src/main/res/mipmap-*/ # Android Icons
├── ios/                    # Capacitor iOS Build
│   └── App/App/Assets.xcassets/AppIcon.appiconset/ # iOS Icons
└── www/                    # Capacitor Web Assets (auto-generiert)
```

---

## Quick Commands

### Development
```bash
npm run start          # Server starten (localhost:8000)
npm run build:web      # Web Assets nach www/ kopieren
```

### Mobile Development
```bash
npm run generate:icons # Icons für iOS/Android generieren
npm run sync           # Web Assets + Capacitor sync
npm run ios            # Xcode öffnen
npm run android        # Android Studio öffnen
```

### Deployment
```bash
git add . && git commit -m "feat: ..." && git push
# Auto-Deploy zu GitHub Pages in ~2 Min
```

### Firebase
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
firebase emulators:start --only firestore,auth
```

---

## SVG Icon System

**WICHTIG:** Keine Emojis mehr verwenden! Stattdessen SVG Icons:

```html
<!-- Icon einbinden -->
<svg class="icon icon-lg"><use href="#icon-car"></use></svg>

<!-- Größen: icon-sm (16px), icon-md (20px), icon-lg (24px), icon-xl (32px) -->
```

**Verfügbare Icons in index.html/werkstatt.html:**
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

/* Surfaces */
--surface: #f8fafc;
--surface-elevated: #ffffff;
--text-primary: #1a202c;
--text-secondary: #4a5568;
```

### Komponenten
- `.btn` - Buttons (btn-primary, btn-secondary, btn-danger)
- `.card` - Karten
- `.input-group` - Formular-Gruppe
- `.toast` - Benachrichtigung
- `.stat-card` - Statistik-Karte
- `.tab-bar` - Bottom Navigation
- `.badge` - Status-Badge

---

## Abo-System (subscription.js)

| Plan | Preis | Features |
|------|-------|----------|
| **Trial** | 0€ (14 Tage) | Alle Features |
| **Starter** | 49€/Monat | 20 Anfragen/Monat |
| **Professional** | 99€/Monat | 100 Anfragen/Monat |
| **Enterprise** | 199€/Monat | Unlimited, Priority Support |

---

## Wichtige Patterns

### Firebase Auth Check
```javascript
// IMMER vor Firebase-Operationen
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

### Modal Dialog (mit SVG Icons!)
```javascript
Workshop.showModal({
    icon: '<svg class="icon icon-xl"><use href="#icon-shield"></use></svg>',
    title: 'Titel',
    text: 'Beschreibung',
    confirmText: 'OK',
    cancelText: 'Abbrechen',
    onConfirm: () => {},
    onCancel: () => {}
});
```

---

## Bekannte Issues

1. **Service Worker Path** - Bei GitHub Pages muss der Pfad `/SchadensChat-App/sw.js` sein
2. **Firebase Auth Persistence** - LocalStorage wird verwendet
3. **Mobile Viewport** - `safe-area-inset-*` für Notch-Geräte beachten
4. **Android Gradle** - Bei Timeout manuell in Android Studio bauen

---

## TODO - Noch ausstehend

### Priorität 1 - App Store Release
- [ ] Apple Developer Account ($99/Jahr)
- [ ] Google Play Developer Account ($25)
- [ ] App Store Screenshots erstellen
- [ ] Store-Beschreibungen schreiben
- [ ] Datenschutz-URL bereitstellen

### Priorität 2 - Core Features
- [ ] **Stripe Integration** - Echte Zahlungen für Abos
- [ ] **Push Notifications** - FCM Setup vervollständigen
- [ ] **Email-System** - Transaktionale Emails

### Priorität 3 - Verbesserungen
- [ ] **Foto-Upload optimieren** - Kompression, Progress
- [ ] **Offline-Sync** - IndexedDB für Anfragen
- [ ] **Analytics Dashboard** - Statistiken

---

## Kontakt & Links

- **GitHub:** https://github.com/MarcelGaertner1234/SchadensChat-App
- **Live Demo:** https://marcelgaertner1234.github.io/SchadensChat-App/
- **Kunden-App:** .../index.html
- **Werkstatt-Portal:** .../werkstatt.html

---

_Version: 2.0 (2024-12-16) - Business Theme + App Store Prep_
