/**
 * SchadensChat - Request Manager
 * Verwaltet Anfragen in Firestore mit User-Verknüpfung
 */

const RequestManager = {
    // Firestore references
    db: null,
    storage: null,
    requestsCollection: 'requests',

    // Local cache
    cachedRequests: [],
    unsubscribe: null,

    /**
     * Initialize Request Manager
     */
    async init() {
        console.log('[RequestManager] Initializing...');

        // Wait for Firebase
        if (typeof FirebaseConfig !== 'undefined') {
            await FirebaseConfig.init();
            this.db = FirebaseConfig.db;
            this.storage = FirebaseConfig.storage;
        }

        console.log('[RequestManager] Initialized');
    },

    /**
     * Check if Firestore is available
     */
    isFirestoreAvailable() {
        return this.db !== null;
    },

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        if (typeof Auth !== 'undefined' && Auth.getUserId) {
            return Auth.getUserId();
        }
        return null;
    },

    /**
     * Upload photo to Firebase Storage
     */
    async uploadPhoto(photoData, requestId, index) {
        if (!this.storage) {
            console.warn('[RequestManager] Storage not available');
            return photoData; // Return base64 as fallback
        }

        try {
            // Convert base64 to blob
            const response = await fetch(photoData);
            const blob = await response.blob();

            // Create storage reference
            const filename = `requests/${requestId}/photo_${index}_${Date.now()}.jpg`;
            const storageRef = this.storage.ref(filename);

            // Upload
            const snapshot = await storageRef.put(blob, {
                contentType: 'image/jpeg',
                customMetadata: {
                    requestId: requestId,
                    uploadedAt: new Date().toISOString()
                }
            });

            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            console.log(`[RequestManager] Photo ${index} uploaded:`, downloadURL);

            return downloadURL;
        } catch (error) {
            console.error('[RequestManager] Photo upload error:', error);
            return photoData; // Return base64 as fallback
        }
    },

    /**
     * Create a new damage request
     */
    async createRequest(requestData, photos) {
        const userId = this.getCurrentUserId();

        // Generate request ID
        const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

        // Upload photos if Firestore available
        let photoUrls = photos.map(p => p.data);

        if (this.isFirestoreAvailable() && this.storage) {
            console.log('[RequestManager] Uploading photos to Storage...');
            // Upload photos individually with error handling (don't fail entire request if one upload fails)
            photoUrls = [];
            for (let index = 0; index < photos.length; index++) {
                try {
                    const url = await this.uploadPhoto(photos[index].data, requestId, index);
                    photoUrls.push(url);
                } catch (error) {
                    console.error(`[RequestManager] Photo ${index} upload failed:`, error);
                    // Use base64 as fallback for failed upload
                    photoUrls.push(photos[index].data);
                }
            }
        }

        // Create request object
        const newRequest = {
            id: requestId,
            customerId: userId, // Verknüpfung mit User!
            createdAt: this.isFirestoreAvailable()
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date().toISOString(),
            updatedAt: this.isFirestoreAvailable()
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date().toISOString(),
            status: 'new',
            photos: photoUrls,
            damage: {
                type: requestData.damageType,
                location: requestData.damageLocation,
                description: requestData.description || ''
            },
            vehicle: { ...requestData.vehicle },
            location: { ...requestData.location },
            contact: { ...requestData.contact },
            offersCount: 0
        };

        // Save to Firestore if available
        if (this.isFirestoreAvailable()) {
            try {
                await this.db.collection(this.requestsCollection).doc(requestId).set(newRequest);
                console.log('[RequestManager] Request saved to Firestore:', requestId);
            } catch (error) {
                console.error('[RequestManager] Firestore save error:', error);
                // Fallback to localStorage
                this.saveToLocalStorage(newRequest);
            }
        } else {
            // Fallback to localStorage
            this.saveToLocalStorage(newRequest);
        }

        return newRequest;
    },

    /**
     * Save request to localStorage (offline fallback)
     */
    saveToLocalStorage(request) {
        const requests = JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
        requests.unshift(request);
        localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
        console.log('[RequestManager] Request saved to localStorage');
    },

    /**
     * Get requests for current user
     */
    async getMyRequests() {
        const userId = this.getCurrentUserId();

        if (this.isFirestoreAvailable() && userId) {
            try {
                const snapshot = await this.db.collection(this.requestsCollection)
                    .where('customerId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();

                const requests = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    requests.push({
                        ...data,
                        id: doc.id,
                        createdAt: data.createdAt?.toDate?.() || data.createdAt
                    });
                });

                console.log(`[RequestManager] Loaded ${requests.length} requests from Firestore`);
                this.cachedRequests = requests;
                return requests;
            } catch (error) {
                console.error('[RequestManager] Firestore load error:', error);
            }
        }

        // Fallback to localStorage
        return this.getLocalRequests();
    },

    /**
     * Get requests from localStorage
     */
    getLocalRequests() {
        const saved = localStorage.getItem('schadens-chat-requests');
        const requests = saved ? JSON.parse(saved) : [];
        console.log(`[RequestManager] Loaded ${requests.length} requests from localStorage`);
        return requests;
    },

    /**
     * Listen for real-time updates on user's requests
     */
    subscribeToMyRequests(callback) {
        const userId = this.getCurrentUserId();

        if (!this.isFirestoreAvailable() || !userId) {
            // Return local data once
            callback(this.getLocalRequests());
            return () => {}; // Empty unsubscribe
        }

        // Unsubscribe from previous listener
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Subscribe to real-time updates
        this.unsubscribe = this.db.collection(this.requestsCollection)
            .where('customerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                snapshot => {
                    const requests = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        requests.push({
                            ...data,
                            id: doc.id,
                            createdAt: data.createdAt?.toDate?.() || data.createdAt
                        });
                    });
                    this.cachedRequests = requests;
                    callback(requests);
                },
                error => {
                    console.error('[RequestManager] Subscription error:', error);
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
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        createdAt: data.createdAt?.toDate?.() || data.createdAt
                    };
                }
            } catch (error) {
                console.error('[RequestManager] Get request error:', error);
            }
        }

        // Fallback: search in localStorage
        const localRequests = this.getLocalRequests();
        return localRequests.find(r => r.id === requestId);
    },

    /**
     * Update a request
     */
    async updateRequest(requestId, updates) {
        if (this.isFirestoreAvailable()) {
            try {
                await this.db.collection(this.requestsCollection).doc(requestId).update({
                    ...updates,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('[RequestManager] Request updated in Firestore');
                return true;
            } catch (error) {
                console.error('[RequestManager] Update error:', error);
            }
        }

        // Fallback: update in localStorage
        const requests = this.getLocalRequests();
        const index = requests.findIndex(r => r.id === requestId);
        if (index >= 0) {
            requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
            return true;
        }
        return false;
    },

    /**
     * Cancel a request
     */
    async cancelRequest(requestId) {
        return this.updateRequest(requestId, { status: 'cancelled' });
    },

    /**
     * Delete a request
     */
    async deleteRequest(requestId) {
        if (this.isFirestoreAvailable()) {
            try {
                await this.db.collection(this.requestsCollection).doc(requestId).delete();
                console.log('[RequestManager] Request deleted from Firestore');
                return true;
            } catch (error) {
                console.error('[RequestManager] Delete error:', error);
            }
        }

        // Fallback: delete from localStorage
        let requests = this.getLocalRequests();
        requests = requests.filter(r => r.id !== requestId);
        localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
        return true;
    },

    // ========== OFFERS ==========

    /**
     * Get offers for a request
     */
    async getOffers(requestId) {
        if (this.isFirestoreAvailable()) {
            try {
                const snapshot = await this.db.collection(this.requestsCollection)
                    .doc(requestId)
                    .collection('offers')
                    .orderBy('createdAt', 'desc')
                    .get();

                const offers = [];
                snapshot.forEach(doc => {
                    offers.push({ ...doc.data(), id: doc.id });
                });
                return offers;
            } catch (error) {
                console.error('[RequestManager] Get offers error:', error);
            }
        }

        // Fallback: get from local request
        const request = await this.getRequest(requestId);
        return request?.offers || [];
    },

    /**
     * Subscribe to offers for a request
     */
    subscribeToOffers(requestId, callback) {
        if (!this.isFirestoreAvailable()) {
            this.getOffers(requestId).then(callback);
            return () => {};
        }

        return this.db.collection(this.requestsCollection)
            .doc(requestId)
            .collection('offers')
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                snapshot => {
                    const offers = [];
                    snapshot.forEach(doc => {
                        offers.push({ ...doc.data(), id: doc.id });
                    });
                    callback(offers);
                },
                error => {
                    console.error('[RequestManager] Offers subscription error:', error);
                    callback([]);
                }
            );
    },

    /**
     * Accept an offer
     */
    async acceptOffer(requestId, offerId) {
        if (this.isFirestoreAvailable()) {
            try {
                const batch = this.db.batch();

                // Update offer status
                const offerRef = this.db.collection(this.requestsCollection)
                    .doc(requestId)
                    .collection('offers')
                    .doc(offerId);
                batch.update(offerRef, { status: 'accepted' });

                // Update request status
                const requestRef = this.db.collection(this.requestsCollection).doc(requestId);
                batch.update(requestRef, {
                    status: 'accepted',
                    acceptedOfferId: offerId,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                await batch.commit();
                console.log('[RequestManager] Offer accepted');
                return true;
            } catch (error) {
                console.error('[RequestManager] Accept offer error:', error);
                // Fallback to local update on error
            }
        }

        // Fallback
        return this.updateRequest(requestId, {
            status: 'accepted',
            acceptedOfferId: offerId
        });
    },

    // ========== MESSAGES ==========

    /**
     * Send a message
     */
    async sendMessage(requestId, text, senderType = 'customer') {
        const userId = this.getCurrentUserId();

        const message = {
            senderId: userId,
            senderType: senderType,
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
                console.log('[RequestManager] Message sent');
                return true;
            } catch (error) {
                console.error('[RequestManager] Send message error:', error);
            }
        }

        // Fallback: save to localStorage
        const chatKey = `schadens-chat-messages-${requestId}`;
        const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        messages.push({
            ...message,
            id: 'msg_' + Date.now(),
            type: senderType === 'customer' ? 'sent' : 'received',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(chatKey, JSON.stringify(messages));
        return true;
    },

    /**
     * Subscribe to messages for a request
     */
    subscribeToMessages(requestId, callback) {
        if (!this.isFirestoreAvailable()) {
            const chatKey = `schadens-chat-messages-${requestId}`;
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
                            type: data.senderType === 'customer' ? 'sent' : 'received',
                            timestamp: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
                        });
                    });
                    callback(messages);
                },
                error => {
                    console.error('[RequestManager] Messages subscription error:', error);
                    callback([]);
                }
            );
    },

    /**
     * Sync local requests to Firestore after login
     */
    async syncLocalRequestsToFirestore() {
        const userId = this.getCurrentUserId();
        if (!userId || !this.isFirestoreAvailable()) return;

        const localRequests = this.getLocalRequests();
        if (localRequests.length === 0) return;

        console.log(`[RequestManager] Syncing ${localRequests.length} local requests to Firestore...`);

        for (const request of localRequests) {
            // Skip if already has a customerId (already synced)
            if (request.customerId && request.customerId !== userId) continue;

            try {
                // Update with current user ID
                const updatedRequest = {
                    ...request,
                    customerId: userId,
                    syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                await this.db.collection(this.requestsCollection)
                    .doc(request.id)
                    .set(updatedRequest, { merge: true });

                console.log(`[RequestManager] Synced request ${request.id}`);
            } catch (error) {
                console.error(`[RequestManager] Failed to sync request ${request.id}:`, error);
            }
        }

        // Clear local storage after sync
        localStorage.removeItem('schadens-chat-requests');
        console.log('[RequestManager] Sync complete, local storage cleared');
    },

    /**
     * Cleanup subscriptions
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
    document.addEventListener('DOMContentLoaded', () => RequestManager.init());
} else {
    RequestManager.init();
}

// Export for global access
window.RequestManager = RequestManager;
