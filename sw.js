/**
 * SchadensChat - Service Worker
 * Offline Support + Push Notifications + Caching
 */

const CACHE_NAME = 'schadens-chat-v1';
const OFFLINE_URL = '/schadens-chat-app/offline.html';

// Files to cache for offline use
const STATIC_ASSETS = [
    '/schadens-chat-app/',
    '/schadens-chat-app/index.html',
    '/schadens-chat-app/werkstatt.html',
    '/schadens-chat-app/offline.html',
    '/schadens-chat-app/css/mobile.css',
    '/schadens-chat-app/js/i18n.js',
    '/schadens-chat-app/js/app.js',
    '/schadens-chat-app/js/workshop.js',
    '/schadens-chat-app/js/firebase-config.js',
    '/schadens-chat-app/js/notifications.js',
    '/schadens-chat-app/img/icon-192.png',
    '/schadens-chat-app/img/icon-512.png',
    '/schadens-chat-app/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('[SW] Cache error:', err))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Try network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Clone and cache the response
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Offline fallback for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Push notification event
self.addEventListener('push', event => {
    console.log('[SW] Push received:', event);

    let data = {
        title: 'SchadensChat',
        body: 'Neue Benachrichtigung',
        icon: '/schadens-chat-app/img/icon-192.png',
        badge: '/schadens-chat-app/img/badge-72.png',
        tag: 'schadens-chat',
        data: {}
    };

    // Parse push data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: data.data,
        actions: data.actions || [
            { action: 'open', title: 'Öffnen' },
            { action: 'dismiss', title: 'Schließen' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Determine which URL to open
    let url = '/schadens-chat-app/';

    if (event.notification.data) {
        if (event.notification.data.type === 'new_offer') {
            url = `/schadens-chat-app/#offers-${event.notification.data.requestId}`;
        } else if (event.notification.data.type === 'new_message') {
            url = `/schadens-chat-app/#chat-${event.notification.data.requestId}`;
        } else if (event.notification.data.type === 'new_request') {
            url = `/schadens-chat-app/werkstatt.html#request-${event.notification.data.requestId}`;
        }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Check if app is already open
                for (const client of windowClients) {
                    if (client.url.includes('/schadens-chat-app/') && 'focus' in client) {
                        client.postMessage({
                            type: 'NOTIFICATION_CLICK',
                            data: event.notification.data
                        });
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Background sync event (for offline submissions)
self.addEventListener('sync', event => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'sync-requests') {
        event.waitUntil(syncPendingRequests());
    } else if (event.tag === 'sync-messages') {
        event.waitUntil(syncPendingMessages());
    }
});

// Sync pending requests when online
async function syncPendingRequests() {
    try {
        const pendingRequests = await getPendingFromIndexedDB('pending-requests');

        for (const request of pendingRequests) {
            try {
                // Send to server
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request)
                });

                if (response.ok) {
                    await removeFromIndexedDB('pending-requests', request.id);
                    console.log('[SW] Synced request:', request.id);
                }
            } catch (err) {
                console.error('[SW] Sync request failed:', err);
            }
        }
    } catch (err) {
        console.error('[SW] Sync requests error:', err);
    }
}

// Sync pending messages when online
async function syncPendingMessages() {
    try {
        const pendingMessages = await getPendingFromIndexedDB('pending-messages');

        for (const message of pendingMessages) {
            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                });

                if (response.ok) {
                    await removeFromIndexedDB('pending-messages', message.id);
                    console.log('[SW] Synced message:', message.id);
                }
            } catch (err) {
                console.error('[SW] Sync message failed:', err);
            }
        }
    } catch (err) {
        console.error('[SW] Sync messages error:', err);
    }
}

// IndexedDB helpers
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SchadensChatOffline', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending-requests')) {
                db.createObjectStore('pending-requests', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('pending-messages')) {
                db.createObjectStore('pending-messages', { keyPath: 'id' });
            }
        };
    });
}

async function getPendingFromIndexedDB(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function removeFromIndexedDB(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// Message from main thread
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker loaded');
