/**
 * SchadensChat - Cloud Functions
 *
 * Functions:
 * - onNewRequest: Benachrichtigt Werkstätten über neue Anfragen
 * - onNewOffer: Benachrichtigt Kunden über neue Angebote
 * - onNewMessage: Benachrichtigt über neue Chat-Nachrichten
 * - onOfferAccepted: Benachrichtigt Werkstatt über Annahme
 * - cleanupOldRequests: Löscht alte abgeschlossene Anfragen (Scheduled)
 * - registerFCMToken: Registriert FCM-Token für Push-Benachrichtigungen
 * - getVapidPublicKey: Gibt VAPID Public Key für Web Push zurück
 */

const functions = require("firebase-functions");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// VAPID Keys als Firebase Secrets definieren (für Legacy Web Push & getVapidPublicKey)
const vapidPublicKey = defineSecret("VAPID_PUBLIC_KEY");

// ========== HELPER FUNCTIONS ==========

/**
 * Sendet FCM-Benachrichtigung an alle Tokens eines Users
 * @param {string} userId - User ID oder Telefonnummer
 * @param {object} payload - Notification payload
 */
async function sendFCMToUser(userId, payload) {
  try {
    // FCM-Tokens für diesen User abrufen
    const tokensSnapshot = await db.collection("fcmTokens")
      .where("userId", "==", userId)
      .get();

    if (tokensSnapshot.empty) {
      console.log(`No FCM tokens found for user: ${userId}`);
      return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    if (tokens.length === 0) {
      console.log(`No valid tokens for user: ${userId}`);
      return;
    }

    // FCM Multicast Message erstellen
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        type: payload.data?.type || "notification",
        requestId: payload.data?.requestId || "",
        offerId: payload.data?.offerId || "",
        messageId: payload.data?.messageId || "",
        url: payload.data?.url || "",
        tag: payload.tag || "schadens-chat",
        requireInteraction: String(payload.requireInteraction || false),
      },
      webpush: {
        notification: {
          icon: payload.icon || "/schadens-chat-app/img/icon-192.png",
          badge: payload.badge || "/schadens-chat-app/img/badge-72.png",
          tag: payload.tag || "schadens-chat",
          requireInteraction: payload.requireInteraction || false,
        },
        fcmOptions: {
          link: payload.data?.url || "/schadens-chat-app/",
        },
      },
      android: {
        notification: {
          icon: "notification_icon",
          color: "#1e3a5f",
          channelId: "schadens-chat-default",
        },
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: "default",
          },
        },
      },
      tokens: tokens,
    };

    // Multicast senden
    const response = await messaging.sendEachForMulticast(message);

    console.log(`FCM sent: ${response.successCount} success, ${response.failureCount} failures`);

    // Ungültige Tokens entfernen
    if (response.failureCount > 0) {
      const tokensToDelete = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (errorCode === "messaging/registration-token-not-registered" ||
              errorCode === "messaging/invalid-registration-token") {
            tokensToDelete.push(tokensSnapshot.docs[idx].ref);
          }
        }
      });

      // Ungültige Tokens löschen
      if (tokensToDelete.length > 0) {
        const batch = db.batch();
        tokensToDelete.forEach((ref) => batch.delete(ref));
        await batch.commit();
        console.log(`Deleted ${tokensToDelete.length} invalid tokens`);
      }
    }
  } catch (error) {
    console.error("sendFCMToUser error:", error);
  }
}

/**
 * Sendet FCM an alle Werkstätten in einem Radius
 * @param {object} location - {lat, lng, zip}
 * @param {object} payload - Notification payload
 */
async function sendFCMToNearbyWorkshops(location, payload) {
  try {
    // Vereinfacht: Alle Werkstätten mit gleicher PLZ-Präfix
    const zipPrefix = location.zip ? location.zip.substring(0, 2) : null;

    let query = db.collection("workshops").where("active", "==", true);

    if (zipPrefix) {
      query = query.where("zipPrefix", "==", zipPrefix);
    }

    const workshops = await query.limit(50).get();

    if (workshops.empty) {
      console.log("No nearby workshops found");
      return;
    }

    const notifications = workshops.docs.map(async (doc) => {
      await sendFCMToUser(doc.id, payload);
    });

    await Promise.all(notifications);
    console.log(`Notified ${workshops.docs.length} workshops`);
  } catch (error) {
    console.error("sendFCMToNearbyWorkshops error:", error);
  }
}

/**
 * Übersetzt Text basierend auf Sprache
 * @param {string} key - Translation key
 * @param {string} lang - Language code
 * @param {object} params - Parameters
 */
function translate(key, lang = "de", params = {}) {
  const translations = {
    newRequest: {
      de: "Neue Schadens-Anfrage",
      en: "New damage request",
      tr: "Yeni hasar talebi",
      ru: "Новая заявка о повреждении",
    },
    newOffer: {
      de: "Neues Angebot erhalten!",
      en: "New offer received!",
      tr: "Yeni teklif alındı!",
      ru: "Получено новое предложение!",
    },
    newMessage: {
      de: "Neue Nachricht",
      en: "New message",
      tr: "Yeni mesaj",
      ru: "Новое сообщение",
    },
    offerAccepted: {
      de: "Angebot angenommen!",
      en: "Offer accepted!",
      tr: "Teklif kabul edildi!",
      ru: "Предложение принято!",
    },
  };

  let text = translations[key]?.[lang] || translations[key]?.de || key;

  // Parameter ersetzen
  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, params[param]);
  });

  return text;
}

// ========== TRIGGER FUNCTIONS ==========

/**
 * Trigger: Neue Anfrage erstellt
 * Benachrichtigt Werkstätten in der Nähe
 */
exports.onNewRequest = functions
  .region("europe-west1")
  .firestore
  .document("requests/{requestId}")
  .onCreate(async (snap, context) => {
    const request = snap.data();
    const requestId = context.params.requestId;

    console.log(`New request created: ${requestId}`);

    // Payload für Werkstätten
    const vehicleInfo = `${request.vehicle?.brand || ""} ${request.vehicle?.model || ""}`.trim() || "Fahrzeug";
    const damageType = request.damage?.type || "Schaden";

    const payload = {
      title: translate("newRequest", "de"),
      body: `${vehicleInfo} - ${damageType}`,
      icon: "/schadens-chat-app/img/icon-192.png",
      badge: "/schadens-chat-app/img/badge-72.png",
      tag: `new-request-${requestId}`,
      requireInteraction: true,
      data: {
        type: "new_request",
        requestId: requestId,
        url: `/schadens-chat-app/werkstatt.html#request-${requestId}`,
      },
    };

    // FCM an Werkstätten senden
    await sendFCMToNearbyWorkshops(request.location, payload);

    // Analytics Event speichern
    await db.collection("analytics").add({
      event: "request_created",
      requestId: requestId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      zip: request.location?.zip,
      damageType: request.damage?.type,
    });

    return null;
  });

/**
 * Trigger: Neues Angebot erstellt
 * Benachrichtigt den Kunden
 */
exports.onNewOffer = functions
  .region("europe-west1")
  .firestore
  .document("requests/{requestId}/offers/{offerId}")
  .onCreate(async (snap, context) => {
    const offer = snap.data();
    const {requestId, offerId} = context.params;

    console.log(`New offer created: ${offerId} for request ${requestId}`);

    // Request-Daten holen
    const requestDoc = await db.collection("requests").doc(requestId).get();
    if (!requestDoc.exists) {
      console.error("Request not found:", requestId);
      return null;
    }

    const request = requestDoc.data();
    const customerPhone = request.contact?.phone;
    const customerId = request.customerId;

    // User-ID für FCM bestimmen
    const userId = customerId || customerPhone;
    if (!userId) {
      console.error("No customer ID for request:", requestId);
      return null;
    }

    // Werkstatt-Name holen
    let workshopName = "Werkstatt";
    if (offer.workshopId) {
      const workshopDoc = await db.collection("workshops")
        .doc(offer.workshopId).get();
      if (workshopDoc.exists) {
        workshopName = workshopDoc.data().name || workshopName;
      }
    }

    // Payload für Kunden
    const payload = {
      title: translate("newOffer", "de"),
      body: `${workshopName}: ${offer.price}€`,
      icon: "/schadens-chat-app/img/icon-192.png",
      badge: "/schadens-chat-app/img/badge-72.png",
      tag: `new-offer-${offerId}`,
      data: {
        type: "new_offer",
        requestId: requestId,
        offerId: offerId,
        url: `/schadens-chat-app/#offers-${requestId}`,
      },
    };

    // FCM an Kunden senden
    await sendFCMToUser(userId, payload);

    // Request-Status aktualisieren
    await db.collection("requests").doc(requestId).update({
      status: "offers_received",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });

/**
 * Trigger: Neue Chat-Nachricht
 * Benachrichtigt den Empfänger
 */
exports.onNewMessage = functions
  .region("europe-west1")
  .firestore
  .document("requests/{requestId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const {requestId, messageId} = context.params;

    console.log(`New message: ${messageId} in request ${requestId}`);

    // Request-Daten holen
    const requestDoc = await db.collection("requests").doc(requestId).get();
    if (!requestDoc.exists) return null;

    const request = requestDoc.data();

    // Empfänger bestimmen
    let recipientId;
    let senderName;

    if (message.senderType === "customer") {
      // Nachricht vom Kunden → an Werkstatt
      recipientId = request.acceptedWorkshopId;
      senderName = request.contact?.name || "Kunde";
    } else {
      // Nachricht von Werkstatt → an Kunden
      recipientId = request.customerId || request.contact?.phone;
      // Werkstatt-Name holen
      if (message.senderId) {
        const ws = await db.collection("workshops").doc(message.senderId).get();
        senderName = ws.exists ? ws.data().name : "Werkstatt";
      }
    }

    if (!recipientId) {
      console.error("No recipient for message");
      return null;
    }

    // Payload
    const payload = {
      title: senderName || translate("newMessage", "de"),
      body: message.text.substring(0, 100) +
          (message.text.length > 100 ? "..." : ""),
      icon: "/schadens-chat-app/img/icon-192.png",
      badge: "/schadens-chat-app/img/badge-72.png",
      tag: `chat-${requestId}`,
      data: {
        type: "new_message",
        requestId: requestId,
        messageId: messageId,
        url: message.senderType === "customer" ?
          `/schadens-chat-app/werkstatt.html#chat-${requestId}` :
          `/schadens-chat-app/#chat-${requestId}`,
      },
    };

    // FCM senden
    await sendFCMToUser(recipientId, payload);

    return null;
  });

/**
 * Trigger: Angebot angenommen
 * Benachrichtigt die Werkstatt
 */
exports.onOfferAccepted = functions
  .region("europe-west1")
  .firestore
  .document("requests/{requestId}/offers/{offerId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const {requestId, offerId} = context.params;

    // Nur reagieren wenn Status zu "accepted" wechselt
    if (before.status === "accepted" || after.status !== "accepted") {
      return null;
    }

    console.log(`Offer accepted: ${offerId}`);

    // Request-Daten holen
    const requestDoc = await db.collection("requests").doc(requestId).get();
    if (!requestDoc.exists) return null;

    const request = requestDoc.data();
    const customerName = request.contact?.name || "Kunde";
    const vehicle = `${request.vehicle?.brand || ""} ${request.vehicle?.model || ""}`.trim();

    // Payload für Werkstatt
    const payload = {
      title: translate("offerAccepted", "de"),
      body: `${customerName} - ${vehicle}`,
      icon: "/schadens-chat-app/img/icon-192.png",
      badge: "/schadens-chat-app/img/badge-72.png",
      tag: `accepted-${offerId}`,
      requireInteraction: true,
      data: {
        type: "offer_accepted",
        requestId: requestId,
        offerId: offerId,
        url: `/schadens-chat-app/werkstatt.html#request-${requestId}`,
      },
    };

    // FCM an Werkstatt senden
    await sendFCMToUser(after.workshopId, payload);

    // Request aktualisieren
    await db.collection("requests").doc(requestId).update({
      status: "accepted",
      acceptedOfferId: offerId,
      acceptedWorkshopId: after.workshopId,
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });

// ========== SCHEDULED FUNCTIONS ==========

/**
 * Scheduled: Alte Anfragen aufräumen
 * Läuft täglich um 3:00 Uhr
 */
exports.cleanupOldRequests = functions
  .region("europe-west1")
  .pubsub
  .schedule("0 3 * * *")
  .timeZone("Europe/Berlin")
  .onRun(async () => {
    console.log("Running cleanup job...");

    // Anfragen älter als 90 Tage mit Status "completed" oder "cancelled"
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const oldRequests = await db.collection("requests")
      .where("status", "in", ["completed", "cancelled"])
      .where("updatedAt", "<", cutoffDate)
      .limit(100)
      .get();

    if (oldRequests.empty) {
      console.log("No old requests to clean up");
      return null;
    }

    const batch = db.batch();
    let count = 0;

    for (const doc of oldRequests.docs) {
      // Subcollections löschen
      const offers = await doc.ref.collection("offers").get();
      offers.docs.forEach((offer) => batch.delete(offer.ref));

      const messages = await doc.ref.collection("messages").get();
      messages.docs.forEach((msg) => batch.delete(msg.ref));

      // Hauptdokument löschen
      batch.delete(doc.ref);
      count++;
    }

    await batch.commit();
    console.log(`Cleaned up ${count} old requests`);

    return null;
  });

/**
 * Scheduled: Ungültige FCM-Tokens aufräumen
 * Läuft wöchentlich
 */
exports.cleanupInvalidFCMTokens = functions
  .region("europe-west1")
  .pubsub
  .schedule("0 4 * * 0") // Sonntag 4:00 Uhr
  .timeZone("Europe/Berlin")
  .onRun(async () => {
    console.log("Cleaning up invalid FCM tokens...");

    const tokensSnapshot = await db.collection("fcmTokens").get();
    let cleaned = 0;

    // Tokens in Batches verarbeiten
    const batch = db.batch();
    const invalidTokens = [];

    for (const doc of tokensSnapshot.docs) {
      const token = doc.data().token;
      try {
        // Dry-run: Token validieren ohne zu senden
        await messaging.send({
          token: token,
          notification: {
            title: "Test",
          },
        }, true); // dryRun = true
      } catch (error) {
        if (error.code === "messaging/registration-token-not-registered" ||
            error.code === "messaging/invalid-registration-token") {
          invalidTokens.push(doc.ref);
        }
      }
    }

    // Ungültige Tokens löschen
    invalidTokens.forEach((ref) => batch.delete(ref));
    if (invalidTokens.length > 0) {
      await batch.commit();
      cleaned = invalidTokens.length;
    }

    console.log(`Cleaned up ${cleaned} invalid FCM tokens`);
    return null;
  });

// ========== CALLABLE FUNCTIONS ==========

/**
 * Callable: FCM-Token registrieren
 */
exports.registerFCMToken = functions
  .region("europe-west1")
  .https
  .onCall(async (data, context) => {
    const {userId, token, platform} = data;

    if (!userId || !token) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "userId and token required",
      );
    }

    try {
      // Prüfen ob Token bereits existiert
      const existingToken = await db.collection("fcmTokens")
        .where("token", "==", token)
        .get();

      if (!existingToken.empty) {
        // Token existiert - Update userId falls geändert
        const docRef = existingToken.docs[0].ref;
        await docRef.update({
          userId: userId,
          platform: platform || "web",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`FCM token updated for user: ${userId}`);
      } else {
        // Neues Token erstellen
        await db.collection("fcmTokens").add({
          userId: userId,
          token: token,
          platform: platform || "web",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          userAgent: context.rawRequest?.headers?.["user-agent"] || "unknown",
        });
        console.log(`FCM token registered for user: ${userId}`);
      }

      return {success: true};
    } catch (error) {
      console.error("registerFCMToken error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

/**
 * Callable: FCM-Token löschen (bei Logout)
 */
exports.deleteFCMToken = functions
  .region("europe-west1")
  .https
  .onCall(async (data, context) => {
    const {token} = data;

    if (!token) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "token required",
      );
    }

    try {
      const tokensSnapshot = await db.collection("fcmTokens")
        .where("token", "==", token)
        .get();

      if (!tokensSnapshot.empty) {
        const batch = db.batch();
        tokensSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log("FCM token deleted");
      }

      return {success: true};
    } catch (error) {
      console.error("deleteFCMToken error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

/**
 * Callable: Legacy Push-Subscription registrieren (für Kompatibilität)
 */
exports.registerPushSubscription = functions
  .region("europe-west1")
  .https
  .onCall(async (data, context) => {
    const {userId, subscription} = data;

    if (!userId || !subscription) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "userId and subscription required",
      );
    }

    try {
      await db.collection("pushSubscriptions").add({
        userId: userId,
        subscription: subscription,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        userAgent: context.rawRequest?.headers?.["user-agent"] || "unknown",
      });

      return {success: true};
    } catch (error) {
      console.error("registerPushSubscription error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

/**
 * Callable: Werkstatt registrieren
 */
exports.registerWorkshop = functions
  .region("europe-west1")
  .https
  .onCall(async (data, context) => {
    // Authentifizierung erforderlich
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required",
      );
    }

    const {name, address, phone, email, zipPrefix} = data;

    if (!name || !address || !phone) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "name, address, and phone required",
      );
    }

    try {
      const workshopId = context.auth.uid;

      await db.collection("workshops").doc(workshopId).set({
        name,
        address,
        phone,
        email: email || null,
        zipPrefix: zipPrefix || null,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {success: true, workshopId};
    } catch (error) {
      console.error("registerWorkshop error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

/**
 * HTTP: VAPID public key für Client (Web Push Setup)
 */
exports.getVapidPublicKey = functions
  .region("europe-west1")
  .runWith({secrets: [vapidPublicKey]})
  .https
  .onCall(async (data, context) => {
    return {vapidPublicKey: vapidPublicKey.value()};
  });

/**
 * HTTP Request version of getVapidPublicKey (for CORS)
 */
exports.getVapidPublicKeyHttp = functions
  .region("europe-west1")
  .runWith({secrets: [vapidPublicKey]})
  .https
  .onRequest((req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.json({vapidPublicKey: vapidPublicKey.value()});
  });
