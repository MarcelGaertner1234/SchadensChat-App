/**
 * SchadensChat - Firebase Cloud Messaging (FCM) Notification Manager
 * Handles push notifications via FCM for web and mobile
 */

const NotificationManager = {
    // Firebase Messaging instance
    messaging: null,

    // Current FCM token
    currentToken: null,

    // Service Worker registration
    swRegistration: null,

    // VAPID public key (from Firebase Console)
    // Will be fetched from Cloud Function or fallback to this value
    vapidPublicKey: null,

    // Notification sound
    notificationSound: null,

    // Unread count
    unreadCount: 0,

    // Initialization state
    initialized: false,

    /**
     * Initialize FCM notification system
     */
    async init() {
        if (this.initialized) return true;

        console.log('[FCM] Initializing Firebase Cloud Messaging...');

        // Check browser support
        if (!('Notification' in window)) {
            console.warn('[FCM] Notifications not supported in this browser');
            return false;
        }

        if (!('serviceWorker' in navigator)) {
            console.warn('[FCM] Service Worker not supported');
            return false;
        }

        // Initialize notification sound
        this.initSound();

        // Wait for Firebase to be ready
        await this.waitForFirebase();

        if (!FirebaseConfig.isFirebaseAvailable) {
            console.warn('[FCM] Firebase not available - using fallback');
            await this.initFallbackServiceWorker();
            return false;
        }

        try {
            // Register FCM Service Worker
            this.swRegistration = await navigator.serviceWorker.register(
                '/schadens-chat-app/firebase-messaging-sw.js',
                { scope: '/schadens-chat-app/' }
            );
            console.log('[FCM] Service Worker registered');

            // Initialize Firebase Messaging
            if (typeof firebase !== 'undefined' && firebase.messaging) {
                this.messaging = firebase.messaging();

                // Set up foreground message handler
                this.messaging.onMessage((payload) => {
                    console.log('[FCM] Foreground message received:', payload);
                    this.handleForegroundMessage(payload);
                });

                console.log('[FCM] Firebase Messaging initialized');
            } else {
                console.warn('[FCM] Firebase Messaging SDK not loaded');
                return false;
            }

            // Listen for messages from Service Worker
            navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));

            // Check existing permission and get token
            if (Notification.permission === 'granted') {
                await this.getToken();
            }

            this.initialized = true;
            return true;

        } catch (error) {
            console.error('[FCM] Initialization failed:', error);
            return false;
        }
    },

    /**
     * Wait for Firebase to initialize
     */
    async waitForFirebase() {
        if (typeof FirebaseConfig !== 'undefined') {
            await FirebaseConfig.init();
        } else {
            // Wait up to 5 seconds for FirebaseConfig
            let attempts = 0;
            while (typeof FirebaseConfig === 'undefined' && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            if (typeof FirebaseConfig !== 'undefined') {
                await FirebaseConfig.init();
            }
        }
    },

    /**
     * Initialize fallback Service Worker (for when FCM is unavailable)
     */
    async initFallbackServiceWorker() {
        try {
            this.swRegistration = await navigator.serviceWorker.register(
                '/schadens-chat-app/sw.js',
                { scope: '/schadens-chat-app/' }
            );
            console.log('[FCM] Fallback Service Worker registered');
        } catch (error) {
            console.error('[FCM] Fallback SW registration failed:', error);
        }
    },

    /**
     * Initialize notification sound
     */
    initSound() {
        this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2fmo+Ff3p3e4OLjo+OjIeEgn+Ag4eJiomJh4WBf31+gYSHiImIhoSBfn19f4KFh4iIhoSBfn19f4KFh4iIhoSCf359f4KFh4iIhoSBfn19f4KFh4iIhoSBfn19f4KFh4iIhoSCf359f4KFh4iIhoSBfn19f4KFh4mIhoSBfn5+gIOGh4iHhYOAf35+gIKEhoeHhoSCgH5+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4B/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WGh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fX5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+');
    },

    /**
     * Request notification permission and get FCM token
     */
    async requestPermission() {
        console.log('[FCM] Requesting permission...');

        if (Notification.permission === 'granted') {
            console.log('[FCM] Permission already granted');
            return await this.getToken();
        }

        if (Notification.permission === 'denied') {
            console.warn('[FCM] Permission was denied');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        console.log('[FCM] Permission result:', permission);

        if (permission === 'granted') {
            return await this.getToken();
        }

        return null;
    },

    /**
     * Get FCM token
     */
    async getToken() {
        if (!this.messaging) {
            console.warn('[FCM] Messaging not initialized');
            return null;
        }

        try {
            // Fetch VAPID key
            const vapidKey = await this.fetchVapidKey();

            if (!vapidKey) {
                console.error('[FCM] No VAPID key available');
                return null;
            }

            // Get token from FCM
            this.currentToken = await this.messaging.getToken({
                vapidKey: vapidKey,
                serviceWorkerRegistration: this.swRegistration
            });

            if (this.currentToken) {
                console.log('[FCM] Token obtained successfully');
                // Store token locally
                localStorage.setItem('schadens-chat-fcm-token', this.currentToken);
                // Send to server
                await this.sendTokenToServer(this.currentToken);
            } else {
                console.warn('[FCM] No token received');
            }

            return this.currentToken;

        } catch (error) {
            console.error('[FCM] Get token error:', error);
            return null;
        }
    },

    /**
     * Fetch VAPID public key
     */
    async fetchVapidKey() {
        // If we already have the key, return it
        if (this.vapidPublicKey) {
            return this.vapidPublicKey;
        }

        // Try to fetch from Cloud Function
        try {
            if (FirebaseConfig.isFirebaseAvailable && FirebaseConfig.functions) {
                const result = await FirebaseConfig.callFunction('getVapidPublicKey');
                if (result && result.vapidPublicKey) {
                    this.vapidPublicKey = result.vapidPublicKey;
                    console.log('[FCM] VAPID key fetched from server');
                    return this.vapidPublicKey;
                }
            }
        } catch (error) {
            console.warn('[FCM] Failed to fetch VAPID key from server:', error);
        }

        // Fallback to hardcoded key (should be updated after Firebase Console setup)
        // TODO: Replace with key from Firebase Console
        this.vapidPublicKey = 'BCLo-97HqgByVqQZ2goN3ArZQ1g0qbNI_kGYZLKE1VyXYSPSSUvNjISbT-_Fd4XjPQmNIA4n2qE5z3IyvnIhAIA';
        console.log('[FCM] Using fallback VAPID key');
        return this.vapidPublicKey;
    },

    /**
     * Send FCM token to server
     */
    async sendTokenToServer(token) {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('[FCM] No user ID for token registration');
            // Store locally for later sync
            localStorage.setItem('schadens-chat-pending-fcm-token', JSON.stringify({
                token: token,
                timestamp: Date.now()
            }));
            return;
        }

        try {
            if (FirebaseConfig.isFirebaseAvailable && FirebaseConfig.functions) {
                await FirebaseConfig.callFunction('registerFCMToken', {
                    userId: userId,
                    token: token,
                    platform: this.getPlatform()
                });
                console.log('[FCM] Token registered on server');
                // Clear pending token
                localStorage.removeItem('schadens-chat-pending-fcm-token');
            } else {
                // Store locally if Firebase not available
                localStorage.setItem('schadens-chat-pending-fcm-token', JSON.stringify({
                    userId: userId,
                    token: token,
                    platform: this.getPlatform(),
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error('[FCM] Token registration failed:', error);
        }
    },

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        // Try Firebase Auth first
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user) return user.uid;
        }

        // Try localStorage for phone-based users
        const phone = localStorage.getItem('schadens-chat-phone');
        if (phone) return phone;

        // Try workshop ID
        const workshopData = localStorage.getItem('schadens-chat-workshop');
        if (workshopData) {
            try {
                const workshop = JSON.parse(workshopData);
                return workshop.id || workshop.workshopId;
            } catch (e) {
                // Ignore
            }
        }

        return null;
    },

    /**
     * Get platform identifier
     */
    getPlatform() {
        // Check for Capacitor
        if (typeof Capacitor !== 'undefined') {
            return Capacitor.getPlatform();
        }
        return 'web';
    },

    /**
     * Handle foreground messages
     */
    handleForegroundMessage(payload) {
        const { notification, data } = payload;

        // Play sound
        this.playSound();

        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Show in-app notification
        this.showInAppNotification(
            notification?.title || 'SchadensChat',
            notification?.body || 'Neue Benachrichtigung',
            data
        );

        // Update badge
        this.updateBadge(++this.unreadCount);
    },

    /**
     * Show in-app notification (toast)
     */
    showInAppNotification(title, body, data) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fcm-notification fcm-notification-enter';
        notification.innerHTML = `
            <div class="fcm-notification-icon">
                <svg class="icon icon-lg"><use href="#icon-message"></use></svg>
            </div>
            <div class="fcm-notification-content">
                <div class="fcm-notification-title">${this.escapeHtml(title)}</div>
                <div class="fcm-notification-body">${this.escapeHtml(body)}</div>
            </div>
            <button class="fcm-notification-close" aria-label="Schließen">
                <svg class="icon icon-sm"><use href="#icon-x"></use></svg>
            </button>
        `;

        // Add click handler
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.fcm-notification-close')) {
                this.handleNotificationClick(data);
            }
            notification.remove();
        });

        // Add close handler
        notification.querySelector('.fcm-notification-close')?.addEventListener('click', (e) => {
            e.stopPropagation();
            notification.classList.add('fcm-notification-exit');
            setTimeout(() => notification.remove(), 300);
        });

        // Add to DOM
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('fcm-notification-exit');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Handle notification click
     */
    handleNotificationClick(data) {
        if (!data) return;

        if (data.type === 'new_offer' && data.requestId) {
            if (typeof App !== 'undefined') {
                App.currentRequestId = data.requestId;
                App.navigateTo('offers');
            }
        } else if (data.type === 'new_message' && data.requestId) {
            if (typeof App !== 'undefined') {
                App.currentRequestId = data.requestId;
                App.navigateTo('chat');
            } else if (typeof Workshop !== 'undefined') {
                Workshop.currentRequestId = data.requestId;
                Workshop.showPage('workshop-chat');
            }
        } else if (data.type === 'new_request' && data.requestId) {
            if (typeof Workshop !== 'undefined') {
                Workshop.viewRequest(data.requestId);
            }
        } else if (data.type === 'offer_accepted' && data.requestId) {
            if (typeof Workshop !== 'undefined') {
                Workshop.viewRequest(data.requestId);
            }
        }
    },

    /**
     * Handle message from Service Worker
     */
    handleSWMessage(event) {
        console.log('[FCM] SW message:', event.data);

        if (event.data.type === 'FCM_NOTIFICATION_CLICK') {
            this.handleNotificationClick(event.data.data);
        }
    },

    /**
     * Show local notification (for in-app events)
     */
    async showLocalNotification(title, options = {}) {
        if (Notification.permission !== 'granted') {
            console.warn('[FCM] Permission not granted');
            return;
        }

        // Play sound
        this.playSound();

        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Show via Service Worker
        if (this.swRegistration) {
            await this.swRegistration.showNotification(title, {
                icon: '/schadens-chat-app/img/icon-192.png',
                badge: '/schadens-chat-app/img/badge-72.png',
                tag: 'schadens-chat-local-' + Date.now(),
                vibrate: [200, 100, 200],
                requireInteraction: false,
                ...options
            });
        }

        // Update badge
        this.updateBadge(++this.unreadCount);
    },

    /**
     * Show notification for new offer
     */
    showNewOfferNotification(workshopName, price) {
        const lang = typeof I18N !== 'undefined' ? I18N.currentLang : 'de';
        const titles = {
            de: 'Neues Angebot erhalten!',
            en: 'New offer received!',
            tr: 'Yeni teklif alındı!',
            ru: 'Новое предложение получено!'
        };

        this.showLocalNotification(titles[lang] || titles.de, {
            body: `${workshopName}: ${price}€`,
            tag: 'new-offer',
            data: { type: 'new_offer' }
        });
    },

    /**
     * Show notification for new message
     */
    showNewMessageNotification(senderName, messagePreview) {
        const lang = typeof I18N !== 'undefined' ? I18N.currentLang : 'de';
        const titles = {
            de: 'Neue Nachricht',
            en: 'New message',
            tr: 'Yeni mesaj',
            ru: 'Новое сообщение'
        };

        this.showLocalNotification(senderName || titles[lang] || titles.de, {
            body: messagePreview.substring(0, 100),
            tag: 'new-message',
            data: { type: 'new_message' },
            renotify: true
        });
    },

    /**
     * Show notification for new request (workshop)
     */
    showNewRequestNotification(vehicleInfo, damageType) {
        const lang = typeof I18N !== 'undefined' ? I18N.currentLang : 'de';
        const titles = {
            de: 'Neue Anfrage!',
            en: 'New request!',
            tr: 'Yeni talep!',
            ru: 'Новая заявка!'
        };

        this.showLocalNotification(titles[lang] || titles.de, {
            body: `${vehicleInfo} - ${damageType}`,
            tag: 'new-request',
            data: { type: 'new_request' },
            requireInteraction: true
        });
    },

    /**
     * Play notification sound
     */
    playSound() {
        if (this.notificationSound) {
            this.notificationSound.currentTime = 0;
            this.notificationSound.play().catch(() => {
                // Autoplay blocked - ignore
            });
        }
    },

    /**
     * Update app badge count
     */
    updateBadge(count) {
        this.unreadCount = count;

        // Update navigator badge (if supported)
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }

        // Update in-app badges
        const badges = document.querySelectorAll('[data-notification-badge]');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    },

    /**
     * Clear all notifications
     */
    async clearNotifications() {
        if (this.swRegistration) {
            const notifications = await this.swRegistration.getNotifications();
            notifications.forEach(notification => notification.close());
        }
        this.updateBadge(0);
    },

    /**
     * Delete FCM token (for logout)
     */
    async deleteToken() {
        if (this.messaging && this.currentToken) {
            try {
                await this.messaging.deleteToken();
                this.currentToken = null;
                localStorage.removeItem('schadens-chat-fcm-token');
                console.log('[FCM] Token deleted');
            } catch (error) {
                console.error('[FCM] Delete token error:', error);
            }
        }
    },

    /**
     * Check if notifications are enabled
     */
    isEnabled() {
        return Notification.permission === 'granted' && this.currentToken !== null;
    },

    /**
     * Get permission status
     */
    getPermissionStatus() {
        return Notification.permission;
    },

    /**
     * Sync pending token (call after user login)
     */
    async syncPendingToken() {
        const pending = localStorage.getItem('schadens-chat-pending-fcm-token');
        if (pending) {
            try {
                const data = JSON.parse(pending);
                await this.sendTokenToServer(data.token);
            } catch (error) {
                console.error('[FCM] Sync pending token error:', error);
            }
        }
    }
};

// Add CSS for in-app notifications
const fcmStyle = document.createElement('style');
fcmStyle.textContent = `
    .fcm-notification {
        position: fixed;
        top: 16px;
        right: 16px;
        left: 16px;
        max-width: 400px;
        margin: 0 auto;
        background: var(--card-bg, #fff);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        z-index: 10000;
        cursor: pointer;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .fcm-notification-enter {
        animation: fcmSlideIn 0.3s ease forwards;
    }

    .fcm-notification-exit {
        animation: fcmSlideOut 0.3s ease forwards;
    }

    @keyframes fcmSlideIn {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @keyframes fcmSlideOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-100%); opacity: 0; }
    }

    .fcm-notification-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: var(--primary, #1e3a5f);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .fcm-notification-content {
        flex: 1;
        min-width: 0;
    }

    .fcm-notification-title {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        margin-bottom: 4px;
    }

    .fcm-notification-body {
        font-size: 14px;
        color: var(--text-secondary, #666);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .fcm-notification-close {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary, #666);
        transition: background 0.2s ease;
    }

    .fcm-notification-close:hover {
        background: var(--border-color, #e5e5e5);
    }

    [data-theme="dark"] .fcm-notification {
        background: var(--card-bg, #2d2d2d);
    }
`;
document.head.appendChild(fcmStyle);

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationManager.init());
} else {
    NotificationManager.init();
}

// Export for global access
window.NotificationManager = NotificationManager;
