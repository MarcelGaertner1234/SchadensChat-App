/**
 * SchadensChat - Firebase Configuration
 * Firestore + Storage + Cloud Functions + Auth
 *
 * WICHTIG: Vor dem Deployen die Config-Werte ersetzen!
 */

const FirebaseConfig = {
    // Firebase configuration - SchadensChat App
    config: {
        apiKey: "AIzaSyCmyy9Z3qj2vQdMJyqZfSslrqugw86vlRc",
        authDomain: "schadens-chat-app.firebaseapp.com",
        projectId: "schadens-chat-app",
        storageBucket: "schadens-chat-app.firebasestorage.app",
        messagingSenderId: "1096578277772",
        appId: "1:1096578277772:web:484a04733bbd8a8d9eb6a9"
    },

    // Cloud Functions Region
    functionsRegion: 'europe-west1',

    // Instances
    db: null,
    storage: null,
    functions: null,
    auth: null,

    // State
    initialized: null,
    isFirebaseAvailable: false,

    /**
     * Initialize Firebase
     */
    async init() {
        if (this.initialized) return this.initialized;

        this.initialized = new Promise((resolve) => {
            try {
                // Check if Firebase SDK is loaded
                if (typeof firebase === 'undefined') {
                    console.warn('[Firebase] SDK not loaded - using localStorage fallback');
                    this.isFirebaseAvailable = false;
                    resolve(false);
                    return;
                }

                // Initialize Firebase App
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.config);
                }

                // Get service instances
                this.db = firebase.firestore();
                this.storage = firebase.storage();
                this.auth = firebase.auth();

                // Functions mit Region
                if (firebase.functions) {
                    this.functions = firebase.app().functions(this.functionsRegion);
                }

                // Firestore Settings
                this.db.settings({
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                });

                // Enable offline persistence
                this.db.enablePersistence({ synchronizeTabs: true })
                    .then(() => {
                        console.log('[Firebase] Offline persistence enabled');
                        this.offlinePersistenceEnabled = true;
                    })
                    .catch(err => {
                        this.offlinePersistenceEnabled = false;
                        if (err.code === 'failed-precondition') {
                            // Multiple tabs open - this is expected, not a critical error
                            console.warn('[Firebase] Multiple tabs open, persistence disabled in this tab');
                        } else if (err.code === 'unimplemented') {
                            // Browser doesn't support persistence
                            console.warn('[Firebase] Browser does not support offline persistence');
                        } else {
                            // Unexpected error
                            console.error('[Firebase] Persistence error:', err);
                        }
                    });

                this.isFirebaseAvailable = true;
                console.log('[Firebase] Initialized successfully');
                resolve(true);

            } catch (error) {
                console.error('[Firebase] Initialization error:', error);
                this.isFirebaseAvailable = false;
                resolve(false);
            }
        });

        return this.initialized;
    },

    /**
     * Get Firestore collection reference
     */
    collection(name) {
        if (!this.db) {
            console.warn('[Firebase] DB not initialized');
            return null;
        }
        return this.db.collection(name);
    },

    /**
     * Call a Cloud Function
     */
    async callFunction(name, data = {}) {
        if (!this.functions) {
            console.warn('[Firebase] Functions not available');
            return null;
        }

        try {
            const fn = this.functions.httpsCallable(name);
            const result = await fn(data);
            return result.data;
        } catch (error) {
            console.error(`[Firebase] Function ${name} error:`, error);
            throw error;
        }
    },

    // ========== AUTH METHODS ==========

    /**
     * Phone Auth - Send verification code
     */
    async sendPhoneVerification(phoneNumber, recaptchaVerifier) {
        if (!this.auth) {
            throw new Error('Auth not initialized');
        }

        try {
            const confirmationResult = await this.auth.signInWithPhoneNumber(
                phoneNumber,
                recaptchaVerifier
            );
            return confirmationResult;
        } catch (error) {
            console.error('[Firebase] Phone verification error:', error);
            throw error;
        }
    },

    /**
     * Verify phone code
     */
    async verifyPhoneCode(confirmationResult, code) {
        try {
            const result = await confirmationResult.confirm(code);
            return result.user;
        } catch (error) {
            console.error('[Firebase] Code verification error:', error);
            throw error;
        }
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.auth?.currentUser || null;
    },

    /**
     * Sign out
     */
    async signOut() {
        if (this.auth) {
            await this.auth.signOut();
        }
    },

    /**
     * Auth state listener
     */
    onAuthStateChanged(callback) {
        if (!this.auth) return () => {};
        return this.auth.onAuthStateChanged(callback);
    },

    // ========== REQUEST METHODS ==========

    /**
     * Create a new damage request
     */
    async createRequest(requestData) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            return this.createRequestLocal(requestData);
        }

        try {
            // Generate request ID
            const requestId = this.db.collection('requests').doc().id;

            // Upload photos first
            const photoUrls = await this.uploadPhotos(requestData.photos, requestId);

            // Create request document
            await this.db.collection('requests').doc(requestId).set({
                ...requestData,
                photos: photoUrls,
                status: 'new',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('[Firebase] Request created:', requestId);
            return requestId;

        } catch (error) {
            console.error('[Firebase] Create request error:', error);
            // Fallback to localStorage
            return this.createRequestLocal(requestData);
        }
    },

    /**
     * Create request in localStorage (fallback)
     */
    createRequestLocal(requestData) {
        const requests = JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
        const newRequest = {
            ...requestData,
            id: 'req_' + Date.now(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            offers: []
        };
        requests.unshift(newRequest);
        localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
        return newRequest.id;
    },

    /**
     * Upload photos to Firebase Storage
     */
    async uploadPhotos(photos, requestId) {
        if (!this.storage || !photos || photos.length === 0) {
            return photos.map(p => p.data);
        }

        const uploadPromises = photos.map(async (photo, index) => {
            try {
                const path = `requests/${requestId}/${Date.now()}_${index}.jpg`;
                const ref = this.storage.ref(path);

                // Convert data URL to blob
                const response = await fetch(photo.data);
                const blob = await response.blob();

                // Upload with metadata
                const metadata = {
                    contentType: 'image/jpeg',
                    customMetadata: {
                        requestId: requestId,
                        uploadedAt: new Date().toISOString()
                    }
                };

                const snapshot = await ref.put(blob, metadata);
                return await snapshot.ref.getDownloadURL();

            } catch (error) {
                console.error('[Firebase] Photo upload error:', error);
                return photo.data; // Fallback to data URL
            }
        });

        return Promise.all(uploadPromises);
    },

    /**
     * Get requests by phone number
     */
    async getRequestsByPhone(phone) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            return JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
        }

        try {
            const snapshot = await this.db.collection('requests')
                .where('contact.phone', '==', phone)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
            }));

        } catch (error) {
            console.error('[Firebase] Get requests error:', error);
            return [];
        }
    },

    /**
     * Get requests for workshop
     */
    async getRequestsForWorkshop(workshopId, zipPrefix = null) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            return JSON.parse(localStorage.getItem('schadens-chat-workshop-requests') || '[]');
        }

        try {
            let query = this.db.collection('requests')
                .where('status', 'in', ['new', 'offers_received', 'accepted'])
                .orderBy('createdAt', 'desc')
                .limit(50);

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
            }));

        } catch (error) {
            console.error('[Firebase] Get workshop requests error:', error);
            return [];
        }
    },

    // ========== OFFER METHODS ==========

    /**
     * Send offer from workshop
     */
    async sendOffer(requestId, workshopId, offer) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            return this.sendOfferLocal(requestId, workshopId, offer);
        }

        try {
            const requestRef = this.db.collection('requests').doc(requestId);

            // Add offer to subcollection
            await requestRef.collection('offers').add({
                workshopId,
                ...offer,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update request status
            await requestRef.update({
                status: 'offers_received',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('[Firebase] Offer sent for request:', requestId);
            return true;

        } catch (error) {
            console.error('[Firebase] Send offer error:', error);
            throw error;
        }
    },

    /**
     * Send offer via localStorage (fallback)
     */
    sendOfferLocal(requestId, workshopId, offer) {
        const requests = JSON.parse(localStorage.getItem('schadens-chat-workshop-requests') || '[]');
        const request = requests.find(r => r.id === requestId);

        if (request) {
            request.offer = {
                ...offer,
                workshopId,
                sentAt: new Date().toISOString()
            };
            request.status = 'offer_sent';
            localStorage.setItem('schadens-chat-workshop-requests', JSON.stringify(requests));
        }

        return true;
    },

    /**
     * Get offers for a request
     */
    async getOffersForRequest(requestId) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            return [];
        }

        try {
            const snapshot = await this.db.collection('requests')
                .doc(requestId)
                .collection('offers')
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('[Firebase] Get offers error:', error);
            return [];
        }
    },

    /**
     * Accept offer
     */
    async acceptOffer(requestId, offerId) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            const requests = JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
            const request = requests.find(r => r.id === requestId);
            if (request) {
                request.status = 'accepted';
                request.acceptedOfferId = offerId;
                localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
            }
            return true;
        }

        try {
            const batch = this.db.batch();

            // Update request
            const requestRef = this.db.collection('requests').doc(requestId);
            batch.update(requestRef, {
                status: 'accepted',
                acceptedOfferId: offerId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update offer
            const offerRef = requestRef.collection('offers').doc(offerId);
            batch.update(offerRef, {
                status: 'accepted',
                acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await batch.commit();
            console.log('[Firebase] Offer accepted:', offerId);
            return true;

        } catch (error) {
            console.error('[Firebase] Accept offer error:', error);
            throw error;
        }
    },

    // ========== CHAT METHODS ==========

    /**
     * Send chat message
     */
    async sendMessage(requestId, senderId, senderType, text) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            const chatKey = `schadens-chat-messages-${requestId}`;
            const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
            messages.push({
                id: 'msg_' + Date.now(),
                senderId,
                senderType,
                text,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(chatKey, JSON.stringify(messages));
            return true;
        }

        try {
            await this.db.collection('requests')
                .doc(requestId)
                .collection('messages')
                .add({
                    senderId,
                    senderType,
                    text,
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            return true;

        } catch (error) {
            console.error('[Firebase] Send message error:', error);
            throw error;
        }
    },

    /**
     * Subscribe to messages (real-time)
     */
    subscribeToMessages(requestId, callback) {
        if (!this.db) {
            return () => {};
        }

        return this.db.collection('requests')
            .doc(requestId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .onSnapshot(snapshot => {
                const messages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
                }));
                callback(messages);
            }, error => {
                console.error('[Firebase] Messages subscription error:', error);
            });
    },

    /**
     * Subscribe to request updates
     */
    subscribeToRequest(requestId, callback) {
        if (!this.db) {
            return () => {};
        }

        return this.db.collection('requests')
            .doc(requestId)
            .onSnapshot(doc => {
                if (doc.exists) {
                    callback({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
                    });
                }
            }, error => {
                console.error('[Firebase] Request subscription error:', error);
            });
    },

    /**
     * Subscribe to new requests (for workshops)
     */
    subscribeToNewRequests(callback) {
        if (!this.db) {
            return () => {};
        }

        return this.db.collection('requests')
            .where('status', 'in', ['new', 'offers_received'])
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const requests = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
                }));
                callback(requests);
            }, error => {
                console.error('[Firebase] Requests subscription error:', error);
            });
    },

    // ========== WORKSHOP METHODS ==========

    /**
     * Register workshop
     */
    async registerWorkshop(workshopData) {
        try {
            const result = await this.callFunction('registerWorkshop', workshopData);
            return result;
        } catch (error) {
            console.error('[Firebase] Register workshop error:', error);
            throw error;
        }
    },

    /**
     * Get workshop profile
     */
    async getWorkshop(workshopId) {
        await this.init();

        if (!this.isFirebaseAvailable) {
            return JSON.parse(localStorage.getItem('schadens-chat-workshop-profile') || 'null');
        }

        try {
            const doc = await this.db.collection('workshops').doc(workshopId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('[Firebase] Get workshop error:', error);
            return null;
        }
    },

    // ========== PUSH SUBSCRIPTION ==========

    /**
     * Register push subscription
     */
    async registerPushSubscription(userId, subscription) {
        try {
            const result = await this.callFunction('registerPushSubscription', {
                userId,
                subscription
            });
            return result;
        } catch (error) {
            console.error('[Firebase] Register push subscription error:', error);
            // Store locally as fallback
            localStorage.setItem('schadens-chat-push-subscription', JSON.stringify({
                userId,
                subscription
            }));
            return { success: false };
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FirebaseConfig.init());
} else {
    FirebaseConfig.init();
}

// Export for global access
window.FirebaseConfig = FirebaseConfig;
