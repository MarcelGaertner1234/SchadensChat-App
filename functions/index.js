/**
 * SchadensChat - Cloud Functions
 *
 * Functions:
 * - onNewRequest: Benachrichtigt Werkstätten über neue Anfragen
 * - onNewOffer: Benachrichtigt Kunden über neue Angebote
 * - onNewMessage: Benachrichtigt über neue Chat-Nachrichten
 * - onOfferAccepted: Benachrichtigt Werkstatt über Annahme
 * - cleanupOldRequests: Löscht alte abgeschlossene Anfragen (Scheduled)
 */

const functions = require("firebase-functions");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const webpush = require("web-push");

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// VAPID Keys als Firebase Secrets definieren
const vapidPublicKey = defineSecret("VAPID_PUBLIC_KEY");
const vapidPrivateKey = defineSecret("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = "mailto:info@schadens-chat.de";

// Web Push wird lazy initialisiert (bei erstem Aufruf)
let webpushInitialized = false;
function initWebPush() {
  if (!webpushInitialized) {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      vapidPublicKey.value(),
      vapidPrivateKey.value()
    );
    webpushInitialized = true;
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Sendet Push-Benachrichtigung an alle Subscriptions eines Users
 * @param {string} userId - User ID oder Telefonnummer
 * @param {object} payload - Notification payload
 */
async function sendPushToUser(userId, payload) {
  try {
    // Lazy init webpush mit Secrets
    initWebPush();

    const subscriptions = await db.collection("pushSubscriptions")
      .where("userId", "==", userId)
      .get();

    if (subscriptions.empty) {
      console.log(`No subscriptions found for user: ${userId}`);
      return;
    }

    const notifications = subscriptions.docs.map(async (doc) => {
      const subscription = doc.data().subscription;
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        console.log(`Push sent to ${doc.id}`);
      } catch (error) {
        console.error(`Push failed for ${doc.id}:`, error.message);
        // Subscription ungültig? Löschen
        if (error.statusCode === 404 || error.statusCode === 410) {
          await doc.ref.delete();
          console.log(`Deleted invalid subscription: ${doc.id}`);
        }
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("sendPushToUser error:", error);
  }
}

/**
 * Sendet Push an alle Werkstätten in einem Radius
 * @param {object} location - {lat, lng, zip}
 * @param {object} payload - Notification payload
 */
async function sendPushToNearbyWorkshops(location, payload) {
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
      await sendPushToUser(doc.id, payload);
    });

    await Promise.all(notifications);
    console.log(`Notified ${workshops.docs.length} workshops`);
  } catch (error) {
    console.error("sendPushToNearbyWorkshops error:", error);
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
  .runWith({secrets: [vapidPublicKey, vapidPrivateKey]})
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
      data: {
        type: "new_request",
        requestId: requestId,
        url: `/schadens-chat-app/werkstatt.html#request-${requestId}`,
      },
      actions: [
        {action: "view", title: "Ansehen"},
        {action: "dismiss", title: "Später"},
      ],
    };

    // Push an Werkstätten senden
    await sendPushToNearbyWorkshops(request.location, payload);

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
  .runWith({secrets: [vapidPublicKey, vapidPrivateKey]})
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

    if (!customerPhone) {
      console.error("No customer phone for request:", requestId);
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
      actions: [
        {action: "view", title: "Ansehen"},
        {action: "dismiss", title: "Später"},
      ],
    };

    // Push an Kunden senden
    await sendPushToUser(customerPhone, payload);

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
  .runWith({secrets: [vapidPublicKey, vapidPrivateKey]})
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
      recipientId = request.contact?.phone;
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
      renotify: true,
      data: {
        type: "new_message",
        requestId: requestId,
        messageId: messageId,
      },
    };

    // Push senden
    await sendPushToUser(recipientId, payload);

    return null;
  });

/**
 * Trigger: Angebot angenommen
 * Benachrichtigt die Werkstatt
 */
exports.onOfferAccepted = functions
  .region("europe-west1")
  .runWith({secrets: [vapidPublicKey, vapidPrivateKey]})
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
      },
      actions: [
        {action: "view", title: "Details"},
        {action: "chat", title: "Chat öffnen"},
      ],
    };

    // Push an Werkstatt senden
    await sendPushToUser(after.workshopId, payload);

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
 * Scheduled: Push-Subscriptions aufräumen
 * Läuft wöchentlich
 */
exports.cleanupInvalidSubscriptions = functions
  .region("europe-west1")
  .runWith({secrets: [vapidPublicKey, vapidPrivateKey]})
  .pubsub
  .schedule("0 4 * * 0") // Sonntag 4:00 Uhr
  .timeZone("Europe/Berlin")
  .onRun(async () => {
    console.log("Cleaning up invalid push subscriptions...");

    // Init webpush mit Secrets
    initWebPush();

    const subscriptions = await db.collection("pushSubscriptions").get();
    let cleaned = 0;

    for (const doc of subscriptions.docs) {
      const sub = doc.data().subscription;
      try {
        // Test-Push senden
        await webpush.sendNotification(sub, JSON.stringify({
          title: "Connection test",
          body: "This is a test",
          tag: "test",
          silent: true,
        }));
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await doc.ref.delete();
          cleaned++;
        }
      }
    }

    console.log(`Cleaned up ${cleaned} invalid subscriptions`);
    return null;
  });

// ========== CALLABLE FUNCTIONS ==========

/**
 * Callable: Push-Subscription registrieren
 */
exports.registerPushSubscription = functions
  .region("europe-west1")
  .https
  .onCall(async (data, context) => {
    // User muss nicht authentifiziert sein (Phone-basiert)
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

// Export VAPID public key für Client
exports.getVapidPublicKey = functions
  .region("europe-west1")
  .runWith({secrets: [vapidPublicKey]})
  .https
  .onRequest((req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.json({vapidPublicKey: vapidPublicKey.value()});
  });
