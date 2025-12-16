# CLAUDE.md - SchadensChat App

Dieses Dokument gibt Claude Code alle wichtigen Informationen zur SchadensChat PWA.

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
| **Mobile** | Capacitor (iOS/Android Wrapper) |
| **PWA** | Service Worker, Manifest, Offline-Support |

---

## Dateistruktur

```
schadens-chat-app/
├── index.html          # Kunden-App (Schadensmeldung)
├── werkstatt.html      # Werkstatt-Portal (Dashboard, Anfragen, Chat)
├── landing.html        # Marketing Landingpage
├── offline.html        # Offline-Fallback
├── manifest.json       # PWA Manifest
├── sw.js               # Service Worker
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
│   └── workshop.css        # Werkstatt-Portal Styles
├── firestore.rules         # Firestore Security Rules
├── storage.rules           # Storage Security Rules
├── firebase.json           # Firebase Config
├── functions/              # Cloud Functions
├── android/                # Capacitor Android Build
├── ios/                    # Capacitor iOS Build
└── www/                    # Capacitor Web Assets
```

---

## Hauptseiten

### 1. index.html (Kunden-App)
- Schadensmeldung mit Fotos
- AI-gestützte Schadensanalyse
- Sprachaufnahme für Beschreibung
- QR-Code Scanner
- Standort-Erkennung

### 2. werkstatt.html (Werkstatt-Portal)
- **Login/Registrierung** mit Firebase Auth
- **Dashboard** mit Statistiken & Trends
- **Anfragen-Liste** (Neu, Angebote, In Arbeit, Fertig)
- **Chat-System** mit Kunden
- **Einstellungen** (Profil, Notifications, Sprache)
- **Abo-Verwaltung** (Trial, Starter, Pro, Enterprise)
- **Legal Pages:** AGB, Datenschutz, Impressum

### 3. landing.html (Marketing)
- Hero-Section mit CTA
- Features-Übersicht
- So funktioniert's (3 Schritte)
- Preise (3 Tarife)
- FAQ (Accordion)
- Über uns
- Hilfe-Center
- Partner werden
- Kontakt-Formular
- Testimonials

---

## Firebase Collections

```javascript
// Haupt-Collections
users                    // User-Profile
workshops                // Werkstatt-Daten
damageReports            // Schadensmeldungen
requests                 // Anfragen (Kunde → Werkstatt)
messages                 // Chat-Nachrichten
subscriptions            // Abo-Status
subscriptionLogs         // Abo-Events

// Sub-Collections
workshops/{id}/settings  // Werkstatt-Einstellungen
requests/{id}/messages   // Anfrage-Chat
```

---

## Abo-System (subscription.js)

| Plan | Preis | Features |
|------|-------|----------|
| **Trial** | 0€ (14 Tage) | Alle Features |
| **Starter** | 29€/Monat | 50 Anfragen/Monat |
| **Pro** | 79€/Monat | Unbegrenzt, Priority |
| **Enterprise** | 199€/Monat | Multi-Standort, API |

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

### Modal Dialog
```javascript
Workshop.showModal({
    icon: '⚠️',
    title: 'Titel',
    text: 'Beschreibung',
    confirmText: 'OK',
    cancelText: 'Abbrechen',
    onConfirm: () => {},
    onCancel: () => {}
});
```

### Loading Overlay
```javascript
Workshop.showLoading('Titel', 'Untertitel');
Workshop.hideLoading();
```

### Navigation
```javascript
Workshop.navigateTo('dashboard');  // dashboard, chats, settings, request-detail
Workshop.showPage('page-id');
```

---

## CSS Design System

### Farben (CSS Variables)
```css
--primary: #667eea;           /* Haupt-Lila */
--primary-dark: #5a67d8;
--success: #10b981;           /* Grün */
--danger: #ef4444;            /* Rot */
--warning: #f59e0b;           /* Orange */
--surface: #1e1e2e;           /* Dark Surface */
--surface-elevated: #2a2a3e;
--text-primary: #ffffff;
--text-secondary: #a0a0b0;
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

## Quick Commands

### Development
```bash
cd schadens-chat-app
python -m http.server 8000  # oder: npx serve
# → http://localhost:8000
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

### Mobile Build
```bash
npx cap sync
npx cap open android  # Android Studio
npx cap open ios      # Xcode
```

---

## Nächste Schritte (TODO)

### Priorität 1 - Core Features
- [ ] **Stripe Integration** - Echte Zahlungen für Abos
- [ ] **Push Notifications** - FCM Setup vervollständigen
- [ ] **Email-System** - Transaktionale Emails (AWS SES oder SendGrid)

### Priorität 2 - Verbesserungen
- [ ] **Foto-Upload optimieren** - Kompression, Progress-Anzeige
- [ ] **Offline-Sync** - IndexedDB für Anfragen
- [ ] **Chat-Verbesserungen** - Read-Receipts, Typing-Indicator live

### Priorität 3 - Extras
- [ ] **Analytics Dashboard** - Statistiken für Werkstätten
- [ ] **PDF-Export** - Angebote als PDF
- [ ] **Partner-Programm** - Referral-System

### Priorität 4 - Mobile
- [ ] **App Store Submission** - iOS/Android veröffentlichen
- [ ] **Deep Links** - App-Links für Sharing
- [ ] **Biometric Auth** - Face ID / Fingerprint

---

## Bekannte Issues

1. **Service Worker Path** - Bei GitHub Pages muss der Pfad `/schadens-chat-app/sw.js` sein
2. **Firebase Auth Persistence** - LocalStorage wird verwendet
3. **Mobile Viewport** - `safe-area-inset-*` für Notch-Geräte beachten

---

## Kontakt & Links

- **GitHub:** https://github.com/MarcelGaertner1234/SchadensChat-App
- **Live Demo:** https://marcelgaertner1234.github.io/SchadensChat-App/
- **Kunden-App:** .../index.html
- **Werkstatt-Portal:** .../werkstatt.html
- **Landingpage:** .../landing.html

---

_Version: 1.0 (2024-12-16)_
