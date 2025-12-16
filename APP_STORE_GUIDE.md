# SchadensChat - App Store Upload Anleitung

## Voraussetzungen

### Apple App Store (iOS)
- Mac mit Xcode 15+ installiert
- Apple Developer Account (99$/Jahr): https://developer.apple.com/programs/
- App Store Connect Zugang

### Google Play Store (Android)
- Android Studio installiert
- Google Play Developer Account (25$ einmalig): https://play.google.com/console/signup
- Keystore für App-Signierung

---

## 1. iOS App Store Upload

### Schritt 1: Xcode Projekt öffnen
```bash
cd schadens-chat-app
npm run ios
```

### Schritt 2: In Xcode konfigurieren
1. **Signing & Capabilities**:
   - Team: Dein Apple Developer Team auswählen
   - Bundle Identifier: `com.schadenschat.app`
   - Signing Certificate: "Apple Distribution" auswählen

2. **App Icons** (in `ios/App/App/Assets.xcassets/AppIcon.appiconset`):
   - Ersetze alle Icon-Größen mit deinem App-Icon
   - Benötigte Größen: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

3. **Splash Screen** (in `ios/App/App/Assets.xcassets/Splash.imageset`):
   - Ersetze mit deinem Splash-Bild

### Schritt 3: Archive erstellen
1. Wähle "Any iOS Device" als Build-Target
2. Product → Archive
3. Nach erfolgreichem Build: Organizer öffnet sich

### Schritt 4: App Store Connect Upload
1. Im Organizer: "Distribute App" klicken
2. "App Store Connect" auswählen
3. "Upload" klicken
4. Warten auf Verarbeitung (kann 10-30 Minuten dauern)

### Schritt 5: App Store Connect konfigurieren
1. https://appstoreconnect.apple.com öffnen
2. Neue App erstellen:
   - Name: SchadensChat
   - Bundle ID: com.schadenschat.app
   - SKU: schadenschat-app-001
3. Screenshots hochladen (6.5" und 5.5" iPhone)
4. Beschreibung, Keywords, Support-URL eingeben
5. Preise festlegen
6. "Zur Prüfung einreichen"

### Review-Zeit
- Erste Einreichung: 1-7 Tage
- Updates: 1-3 Tage

---

## 2. Google Play Store Upload

### Schritt 1: Android Studio Projekt öffnen
```bash
cd schadens-chat-app
npm run android
```

### Schritt 2: Keystore erstellen (einmalig!)
```bash
keytool -genkey -v -keystore schadenschat-release.keystore \
  -alias schadenschat -keyalg RSA -keysize 2048 -validity 10000
```
**WICHTIG**: Keystore und Passwort sicher aufbewahren! Ohne diese kannst du keine Updates veröffentlichen.

### Schritt 3: App Icons ersetzen
In `android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Schritt 4: Release APK/AAB erstellen
In Android Studio:
1. Build → Generate Signed Bundle / APK
2. "Android App Bundle" auswählen (empfohlen für Play Store)
3. Keystore-Datei und Passwort eingeben
4. "release" Build-Variante wählen
5. Finish

Output: `android/app/release/app-release.aab`

### Schritt 5: Google Play Console
1. https://play.google.com/console öffnen
2. "App erstellen" klicken
3. App-Details eingeben:
   - Name: SchadensChat
   - Sprache: Deutsch
   - App-Typ: App
   - Kostenlos/Kostenpflichtig
4. Dashboard → "App-Freigabe einrichten"
5. App Bundle hochladen (`.aab` Datei)

### Schritt 6: Store-Eintrag
1. **Grafiken**:
   - App-Symbol: 512x512 PNG
   - Feature-Grafik: 1024x500 PNG
   - Screenshots: mind. 2 für Telefon

2. **Beschreibung**:
   - Kurze Beschreibung (80 Zeichen)
   - Vollständige Beschreibung (4000 Zeichen)

3. **Kategorisierung**:
   - Kategorie: Autos & Fahrzeuge
   - Inhaltsaltersfreigabe ausfüllen

### Review-Zeit
- Erste Einreichung: 1-7 Tage
- Updates: wenige Stunden bis 3 Tage

---

## NPM Commands Übersicht

```bash
# Web-Version bauen
npm run build

# iOS App in Xcode öffnen
npm run ios

# Android App in Android Studio öffnen
npm run android

# iOS auf verbundenem iPhone testen
npm run ios:run

# Android auf verbundenem Gerät testen
npm run android:run

# Web-Version deployen (Firebase Hosting)
npm run deploy:web

# Native Projekte synchronisieren
npm run sync
```

---

## Checkliste vor Upload

### iOS
- [ ] App Icons in allen Größen
- [ ] Splash Screen
- [ ] Bundle ID korrekt
- [ ] Version & Build Number gesetzt
- [ ] Signing konfiguriert
- [ ] Screenshots erstellt (6.5" + 5.5")
- [ ] App Store Beschreibung
- [ ] Privacy Policy URL

### Android
- [ ] App Icons in allen dpi
- [ ] Splash Screen
- [ ] applicationId korrekt
- [ ] versionCode & versionName gesetzt
- [ ] Keystore erstellt und gesichert
- [ ] Release AAB gebaut
- [ ] Screenshots erstellt
- [ ] Beschreibung
- [ ] Datenschutzerklärung

---

## Kosten-Übersicht

| Platform | Einmalig | Jährlich |
|----------|----------|----------|
| Apple App Store | - | 99$ |
| Google Play Store | 25$ | - |

---

## Support

Bei Fragen: GitHub Issues erstellen oder Dokumentation lesen:
- Capacitor: https://capacitorjs.com/docs
- App Store Connect: https://developer.apple.com/app-store-connect/
- Google Play Console: https://support.google.com/googleplay/android-developer
