/**
 * SchadensChat - Push Notifications Manager
 * Web Push API + Service Worker Integration
 */

const NotificationManager = {
    // Service Worker registration
    swRegistration: null,

    // Push subscription
    pushSubscription: null,

    // VAPID public key (generiert mit web-push generate-vapid-keys)
    vapidPublicKey: 'BCLo-97HqgByVqQZ2goN3ArZQ1g0qbNI_kGYZLKE1VyXYSPSSUvNjISbT-_Fd4XjPQmNIA4n2qE5z3IyvnIhAIA',

    // Notification sound
    notificationSound: null,

    // Unread count
    unreadCount: 0,

    /**
     * Initialize notification system
     */
    async init() {
        console.log('[Notifications] Initializing...');

        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('[Notifications] Not supported in this browser');
            return false;
        }

        // Check if Service Worker is supported
        if (!('serviceWorker' in navigator)) {
            console.warn('[Notifications] Service Worker not supported');
            return false;
        }

        // Initialize notification sound
        this.initSound();

        // Register Service Worker
        try {
            this.swRegistration = await navigator.serviceWorker.register('/schadens-chat-app/sw.js');
            console.log('[Notifications] Service Worker registered');

            // Listen for messages from Service Worker
            navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));

            // Check existing permission
            if (Notification.permission === 'granted') {
                await this.subscribeToPush();
            }

            return true;
        } catch (error) {
            console.error('[Notifications] Registration failed:', error);
            return false;
        }
    },

    /**
     * Initialize notification sound
     */
    initSound() {
        // Create audio context on user interaction
        this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2fmo+Ff3p3e4OLjo+OjIeEgn+Ag4eJiomJh4WBf31+gYSHiImIhoSBfn19f4KFh4iIhoSBfn19f4KFh4iIhoSCf359f4KFh4iIhoSBfn19f4KFh4iIhoSBfn19f4KFh4iIhoSCf359f4KFh4iIhoSBfn19f4KFh4mIhoSBfn5+gIOGh4iHhYOAf35+gIKEhoeHhoSCgH5+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4B/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WGh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fX5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+f4GDhYeHhoWDgX9+fn+Bg4WHh4aFg4F/fn5/gYOFh4eGhYOBf35+');
    },

    /**
     * Request notification permission
     */
    async requestPermission() {
        console.log('[Notifications] Requesting permission...');

        if (Notification.permission === 'granted') {
            console.log('[Notifications] Already granted');
            await this.subscribeToPush();
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('[Notifications] Permission denied');
            return false;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        console.log('[Notifications] Permission:', permission);

        if (permission === 'granted') {
            await this.subscribeToPush();
            return true;
        }

        return false;
    },

    /**
     * Subscribe to push notifications
     */
    async subscribeToPush() {
        if (!this.swRegistration) {
            console.warn('[Notifications] No Service Worker registration');
            return null;
        }

        try {
            // Check existing subscription
            this.pushSubscription = await this.swRegistration.pushManager.getSubscription();

            if (this.pushSubscription) {
                console.log('[Notifications] Existing subscription found');
                return this.pushSubscription;
            }

            // Create new subscription
            this.pushSubscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
            });

            console.log('[Notifications] New subscription created');

            // Send subscription to server
            await this.sendSubscriptionToServer(this.pushSubscription);

            return this.pushSubscription;

        } catch (error) {
            console.error('[Notifications] Subscribe error:', error);
            return null;
        }
    },

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe() {
        if (!this.pushSubscription) {
            return true;
        }

        try {
            await this.pushSubscription.unsubscribe();
            this.pushSubscription = null;
            console.log('[Notifications] Unsubscribed');
            return true;
        } catch (error) {
            console.error('[Notifications] Unsubscribe error:', error);
            return false;
        }
    },

    /**
     * Send subscription to server
     */
    async sendSubscriptionToServer(subscription) {
        // In production, send to your backend
        console.log('[Notifications] Subscription:', JSON.stringify(subscription));

        // Store locally for now
        localStorage.setItem('schadens-chat-push-subscription', JSON.stringify(subscription));
    },

    /**
     * Show local notification (without push)
     */
    async showLocalNotification(title, options = {}) {
        if (Notification.permission !== 'granted') {
            console.warn('[Notifications] Permission not granted');
            return;
        }

        // Play sound
        this.playSound();

        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Show notification via Service Worker (for better control)
        if (this.swRegistration) {
            await this.swRegistration.showNotification(title, {
                icon: '/schadens-chat-app/img/icon-192.png',
                badge: '/schadens-chat-app/img/badge-72.png',
                tag: 'schadens-chat-local',
                vibrate: [200, 100, 200],
                requireInteraction: false,
                ...options
            });
        } else {
            // Fallback to Notification API
            new Notification(title, {
                icon: '/schadens-chat-app/img/icon-192.png',
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
        const lang = I18N?.currentLang || 'de';
        const titles = {
            de: 'Neues Angebot erhalten!',
            en: 'New offer received!',
            tr: 'Yeni teklif alındı!',
            ru: 'Новое предложение получено!',
            pl: 'Nowa oferta otrzymana!',
            ar: 'تم استلام عرض جديد!'
        };

        this.showLocalNotification(titles[lang] || titles.de, {
            body: `${workshopName}: ${price}€`,
            tag: 'new-offer',
            data: { type: 'new_offer' },
            actions: [
                { action: 'view', title: lang === 'de' ? 'Ansehen' : 'View' },
                { action: 'dismiss', title: lang === 'de' ? 'Später' : 'Later' }
            ]
        });
    },

    /**
     * Show notification for new message
     */
    showNewMessageNotification(senderName, messagePreview) {
        const lang = I18N?.currentLang || 'de';
        const titles = {
            de: 'Neue Nachricht',
            en: 'New message',
            tr: 'Yeni mesaj',
            ru: 'Новое сообщение',
            pl: 'Nowa wiadomość',
            ar: 'رسالة جديدة'
        };

        this.showLocalNotification(senderName, {
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
        const lang = I18N?.currentLang || 'de';
        const titles = {
            de: 'Neue Anfrage!',
            en: 'New request!',
            tr: 'Yeni talep!',
            ru: 'Новая заявка!',
            pl: 'Nowe zgłoszenie!',
            ar: 'طلب جديد!'
        };

        this.showLocalNotification(titles[lang] || titles.de, {
            body: `${vehicleInfo} - ${damageType}`,
            tag: 'new-request',
            data: { type: 'new_request' },
            requireInteraction: true,
            actions: [
                { action: 'view', title: lang === 'de' ? 'Angebot erstellen' : 'Make offer' },
                { action: 'dismiss', title: lang === 'de' ? 'Später' : 'Later' }
            ]
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
     * Handle message from Service Worker
     */
    handleSWMessage(event) {
        console.log('[Notifications] SW message:', event.data);

        if (event.data.type === 'NOTIFICATION_CLICK') {
            // Handle notification click navigation
            const data = event.data.data;

            if (data.type === 'new_offer' && data.requestId) {
                // Navigate to offers page
                if (typeof App !== 'undefined') {
                    App.currentRequestId = data.requestId;
                    App.navigateTo('offers');
                }
            } else if (data.type === 'new_message' && data.requestId) {
                // Navigate to chat
                if (typeof App !== 'undefined') {
                    App.currentRequestId = data.requestId;
                    App.navigateTo('chat');
                }
            } else if (data.type === 'new_request' && data.requestId) {
                // Navigate to request detail (workshop)
                if (typeof Workshop !== 'undefined') {
                    Workshop.viewRequest(data.requestId);
                }
            }
        }
    },

    /**
     * Check if notifications are enabled
     */
    isEnabled() {
        return Notification.permission === 'granted';
    },

    /**
     * Get permission status
     */
    getPermissionStatus() {
        return Notification.permission;
    },

    /**
     * Convert VAPID key to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationManager.init());
} else {
    NotificationManager.init();
}

// Export for global access
window.NotificationManager = NotificationManager;
