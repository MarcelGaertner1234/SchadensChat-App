/**
 * SchadensChat - Workshop Request Manager
 * Verwaltet Anfragen für Werkstätten aus Firestore
 */

const WorkshopRequests = {
    // Firestore references
    db: null,
    requestsCollection: 'requests',

    // Local cache
    cachedRequests: [],
    unsubscribe: null,

    /**
     * Initialize
     */
    async init() {
        console.log('[WorkshopRequests] Initializing...');

        // Wait for Firebase
        if (typeof FirebaseConfig !== 'undefined') {
            await FirebaseConfig.init();
            this.db = FirebaseConfig.db;
        }

        console.log('[WorkshopRequests] Initialized');
    },

    /**
     * Check if Firestore is available
     */
    isFirestoreAvailable() {
        return this.db !== null;
    },

    /**
     * Get current workshop ID
     */
    getWorkshopId() {
        if (typeof Auth !== 'undefined' && Auth.getUserId) {
            return Auth.getUserId();
        }
        // Fallback to localStorage
        const saved = localStorage.getItem('schadens-chat-workshop');
        if (saved) {
            const data = JSON.parse(saved);
            return data.id;
        }
        return null;
    },

    /**
     * Load all visible requests for workshops
     * Workshops can see new requests that are not yet accepted
     */
    async loadRequests() {
        if (this.isFirestoreAvailable()) {
            try {
                // Get requests that are new or have offers from this workshop
                const snapshot = await this.db.collection(this.requestsCollection)
                    .where('status', 'in', ['new', 'pending', 'offers_received'])
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();

                const requests = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    requests.push(this.transformRequest(doc.id, data));
                });

                console.log(`[WorkshopRequests] Loaded ${requests.length} requests from Firestore`);
                this.cachedRequests = requests;
                return requests;
            } catch (error) {
                console.error('[WorkshopRequests] Load error:', error);
            }
        }

        // Fallback: return demo/local data
        return this.getLocalRequests();
    },

    /**
     * Transform Firestore data to local format
     */
    transformRequest(id, data) {
        return {
            id: id,
            status: data.status || 'new',
            createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
            customer: data.contact || {},
            vehicle: data.vehicle || {},
            damage: data.damage || {},
            photos: data.photos || [],
            location: data.location || {},
            offer: null, // Will be loaded separately
            customerId: data.customerId
        };
    },

    /**
     * Get requests from localStorage (demo mode)
     */
    getLocalRequests() {
        const saved = localStorage.getItem('schadens-chat-workshop-requests');
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Subscribe to real-time updates for new requests
     */
    subscribeToRequests(callback) {
        if (!this.isFirestoreAvailable()) {
            callback(this.getLocalRequests());
            return () => {};
        }

        // Unsubscribe from previous listener
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Subscribe to new requests
        this.unsubscribe = this.db.collection(this.requestsCollection)
            .where('status', 'in', ['new', 'pending', 'offers_received'])
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(
                snapshot => {
                    const requests = [];
                    snapshot.forEach(doc => {
                        requests.push(this.transformRequest(doc.id, doc.data()));
                    });
                    this.cachedRequests = requests;
                    callback(requests);
                },
                error => {
                    console.error('[WorkshopRequests] Subscription error:', error);
                    callback(this.getLocalRequests());
                }
            );

        return this.unsubscribe;
    },

    /**
     * Get a single request by ID
     */
    async getRequest(requestId) {
        if (this.isFirestoreAvailable()) {
            try {
                const doc = await this.db.collection(this.requestsCollection).doc(requestId).get();
                if (doc.exists) {
                    return this.transformRequest(doc.id, doc.data());
                }
            } catch (error) {
                console.error('[WorkshopRequests] Get request error:', error);
            }
        }

        // Fallback
        const localRequests = this.getLocalRequests();
        return localRequests.find(r => r.id === requestId);
    },

    /**
     * Get offers for a request (that this workshop made)
     */
    async getMyOffer(requestId) {
        const workshopId = this.getWorkshopId();
        if (!workshopId || !this.isFirestoreAvailable()) return null;

        try {
            const snapshot = await this.db.collection(this.requestsCollection)
                .doc(requestId)
                .collection('offers')
                .where('workshopId', '==', workshopId)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { ...doc.data(), id: doc.id };
            }
        } catch (error) {
            console.error('[WorkshopRequests] Get offer error:', error);
        }

        return null;
    },

    /**
     * Send an offer for a request
     */
    async sendOffer(requestId, offerData) {
        const workshopId = this.getWorkshopId();

        if (!workshopId) {
            throw new Error('Nicht angemeldet');
        }

        const offer = {
            workshopId: workshopId,
            workshopName: Workshop?.workshopName || 'Werkstatt',
            price: offerData.price,
            duration: offerData.duration,
            note: offerData.note || '',
            status: 'pending',
            createdAt: this.isFirestoreAvailable()
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date().toISOString()
        };

        if (this.isFirestoreAvailable()) {
            try {
                // Add offer to subcollection
                await this.db.collection(this.requestsCollection)
                    .doc(requestId)
                    .collection('offers')
                    .add(offer);

                // Update request status
                await this.db.collection(this.requestsCollection)
                    .doc(requestId)
                    .update({
                        status: 'offers_received',
                        offersCount: firebase.firestore.FieldValue.increment(1),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                console.log('[WorkshopRequests] Offer sent successfully');
                return true;
            } catch (error) {
                console.error('[WorkshopRequests] Send offer error:', error);
                throw error;
            }
        }

        // Fallback: save to localStorage
        const requests = this.getLocalRequests();
        const request = requests.find(r => r.id === requestId);
        if (request) {
            request.offer = { ...offer, sentAt: new Date().toISOString() };
            request.status = 'offer_sent';
            localStorage.setItem('schadens-chat-workshop-requests', JSON.stringify(requests));
            return true;
        }

        return false;
    },

    /**
     * Get requests where this workshop has sent offers
     */
    async getMyOfferRequests() {
        const workshopId = this.getWorkshopId();
        if (!workshopId || !this.isFirestoreAvailable()) {
            // Fallback
            return this.getLocalRequests().filter(r => r.offer !== null);
        }

        try {
            // This requires a collection group query - simplified version
            // In production, you might want to track offers in a separate collection
            const snapshot = await this.db.collection(this.requestsCollection)
                .where('status', 'in', ['offers_received', 'accepted', 'in_progress'])
                .orderBy('updatedAt', 'desc')
                .limit(50)
                .get();

            const requests = [];
            for (const doc of snapshot.docs) {
                const request = this.transformRequest(doc.id, doc.data());
                const myOffer = await this.getMyOffer(doc.id);
                if (myOffer) {
                    request.offer = myOffer;
                    requests.push(request);
                }
            }

            return requests;
        } catch (error) {
            console.error('[WorkshopRequests] Get my offers error:', error);
            return [];
        }
    },

    /**
     * Get accepted requests (jobs in progress)
     */
    async getActiveJobs() {
        const workshopId = this.getWorkshopId();
        if (!workshopId || !this.isFirestoreAvailable()) {
            // Fallback
            return this.getLocalRequests().filter(r => r.status === 'accepted');
        }

        // Similar to getMyOfferRequests but for accepted status
        try {
            const snapshot = await this.db.collection(this.requestsCollection)
                .where('status', 'in', ['accepted', 'in_progress'])
                .orderBy('updatedAt', 'desc')
                .limit(50)
                .get();

            const jobs = [];
            for (const doc of snapshot.docs) {
                const request = this.transformRequest(doc.id, doc.data());
                const myOffer = await this.getMyOffer(doc.id);
                if (myOffer && myOffer.status === 'accepted') {
                    request.offer = myOffer;
                    jobs.push(request);
                }
            }

            return jobs;
        } catch (error) {
            console.error('[WorkshopRequests] Get active jobs error:', error);
            return [];
        }
    },

    /**
     * Send a message to customer
     */
    async sendMessage(requestId, text) {
        const workshopId = this.getWorkshopId();

        const message = {
            senderId: workshopId,
            senderType: 'workshop',
            text: text,
            createdAt: this.isFirestoreAvailable()
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date().toISOString(),
            read: false
        };

        if (this.isFirestoreAvailable()) {
            try {
                await this.db.collection(this.requestsCollection)
                    .doc(requestId)
                    .collection('messages')
                    .add(message);
                return true;
            } catch (error) {
                console.error('[WorkshopRequests] Send message error:', error);
            }
        }

        // Fallback
        const chatKey = `schadens-chat-ws-messages-${requestId}`;
        const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        messages.push({
            ...message,
            id: 'msg_' + Date.now(),
            type: 'sent',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(chatKey, JSON.stringify(messages));
        return true;
    },

    /**
     * Subscribe to messages
     */
    subscribeToMessages(requestId, callback) {
        if (!this.isFirestoreAvailable()) {
            const chatKey = `schadens-chat-ws-messages-${requestId}`;
            const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
            callback(messages);
            return () => {};
        }

        return this.db.collection(this.requestsCollection)
            .doc(requestId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .onSnapshot(
                snapshot => {
                    const messages = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        messages.push({
                            ...data,
                            id: doc.id,
                            type: data.senderType === 'workshop' ? 'sent' : 'received',
                            timestamp: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
                        });
                    });
                    callback(messages);
                },
                error => {
                    console.error('[WorkshopRequests] Messages error:', error);
                    callback([]);
                }
            );
    },

    /**
     * Cleanup
     */
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WorkshopRequests.init());
} else {
    WorkshopRequests.init();
}

// Export
window.WorkshopRequests = WorkshopRequests;
