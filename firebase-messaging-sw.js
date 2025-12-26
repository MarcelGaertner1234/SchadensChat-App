/**
 * SchadensChat - Firebase Cloud Messaging Service Worker
 * Handles background push notifications via FCM
 */

// Import Firebase SDK for Service Workers
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration - must match main app config
firebase.initializeApp({
    apiKey: "AIzaSyCmyy9Z3qj2vQdMJyqZfSslrqugw86vlRc",
    authDomain: "schadens-chat-app.firebaseapp.com",
    projectId: "schadens-chat-app",
    storageBucket: "schadens-chat-app.firebasestorage.app",
    messagingSenderId: "1096578277772",
    appId: "1:1096578277772:web:484a04733bbd8a8d9eb6a9"
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

console.log('[FCM SW] Firebase Messaging Service Worker initialized');

/**
 * Background message handler
 * Called when app is in background or closed
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background message received:', payload);

    // Extract notification data
    const notificationTitle = payload.notification?.title || 'SchadensChat';
    const notificationBody = payload.notification?.body || 'Neue Benachrichtigung';
    const data = payload.data || {};

    // Determine icon based on notification type
    let icon = '/schadens-chat-app/img/icon-192.png';

    // Build notification options
    const notificationOptions = {
        body: notificationBody,
        icon: icon,
        badge: '/schadens-chat-app/img/badge-72.png',
        tag: data.tag || 'schadens-chat-' + Date.now(),
        data: data,
        vibrate: [200, 100, 200],
        requireInteraction: data.requireInteraction === 'true' || data.type === 'new_request',
        actions: getNotificationActions(data.type)
    };

    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Get notification actions based on type
 */
function getNotificationActions(type) {
    const actions = {
        new_offer: [
            { action: 'view', title: 'Ansehen' },
            { action: 'dismiss', title: 'Später' }
        ],
        new_message: [
            { action: 'reply', title: 'Antworten' },
            { action: 'dismiss', title: 'Schließen' }
        ],
        new_request: [
            { action: 'view', title: 'Angebot erstellen' },
            { action: 'dismiss', title: 'Später' }
        ],
        offer_accepted: [
            { action: 'view', title: 'Details' },
            { action: 'dismiss', title: 'Schließen' }
        ]
    };

    return actions[type] || [
        { action: 'open', title: 'Öffnen' },
        { action: 'dismiss', title: 'Schließen' }
    ];
}

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[FCM SW] Notification clicked:', event.action, event.notification.data);

    // Close the notification
    event.notification.close();

    // Handle dismiss action
    if (event.action === 'dismiss') {
        return;
    }

    // Determine target URL based on notification type
    let targetUrl = '/schadens-chat-app/';
    const data = event.notification.data || {};

    if (data.type === 'new_offer' && data.requestId) {
        targetUrl = `/schadens-chat-app/index.html#offers-${data.requestId}`;
    } else if (data.type === 'new_message' && data.requestId) {
        targetUrl = `/schadens-chat-app/index.html#chat-${data.requestId}`;
    } else if (data.type === 'new_request' && data.requestId) {
        targetUrl = `/schadens-chat-app/werkstatt.html#request-${data.requestId}`;
    } else if (data.type === 'offer_accepted' && data.requestId) {
        targetUrl = `/schadens-chat-app/werkstatt.html#request-${data.requestId}`;
    } else if (data.url) {
        targetUrl = data.url;
    }

    // Open or focus existing window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if app is already open
                for (const client of windowClients) {
                    if (client.url.includes('/schadens-chat-app/') && 'focus' in client) {
                        // Send message to existing client
                        client.postMessage({
                            type: 'FCM_NOTIFICATION_CLICK',
                            data: data
                        });
                        return client.focus();
                    }
                }

                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});

/**
 * Notification close handler (for analytics)
 */
self.addEventListener('notificationclose', (event) => {
    console.log('[FCM SW] Notification closed:', event.notification.tag);
});

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
    console.log('[FCM SW] Message from main thread:', event.data);

    if (event.data.type === 'GET_FCM_TOKEN') {
        // Response with current token status
        event.ports[0].postMessage({ success: true });
    }
});

console.log('[FCM SW] Service Worker ready');
