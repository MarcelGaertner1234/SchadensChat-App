/**
 * SchadensChat - Subscription Manager
 * Abo-System für Werkstätten
 */

const SubscriptionManager = {
    // Abo-Pläne
    plans: {
        starter: {
            id: 'starter',
            name: 'Starter',
            icon: '🚀',
            price: 49,
            period: 'monat',
            features: [
                { text: 'Bis zu 20 Anfragen/Monat', enabled: true },
                { text: 'Standard Support', enabled: true },
                { text: 'Basis-Statistiken', enabled: true },
                { text: 'Unlimited Angebote', enabled: false },
                { text: 'Priority Platzierung', enabled: false },
                { text: 'Premium Support', enabled: false }
            ],
            requestLimit: 20
        },
        professional: {
            id: 'professional',
            name: 'Professional',
            icon: '⭐',
            price: 99,
            period: 'monat',
            popular: true,
            features: [
                { text: 'Bis zu 100 Anfragen/Monat', enabled: true },
                { text: 'Priority Support', enabled: true },
                { text: 'Erweiterte Statistiken', enabled: true },
                { text: 'Unlimited Angebote', enabled: true },
                { text: 'Priority Platzierung', enabled: false },
                { text: 'Premium Support', enabled: false }
            ],
            requestLimit: 100
        },
        enterprise: {
            id: 'enterprise',
            name: 'Enterprise',
            icon: '👑',
            price: 199,
            period: 'monat',
            features: [
                { text: 'Unlimited Anfragen', enabled: true },
                { text: 'Premium Support 24/7', enabled: true },
                { text: 'Vollständige Analytics', enabled: true },
                { text: 'Unlimited Angebote', enabled: true },
                { text: 'Priority Platzierung', enabled: true },
                { text: 'Dedizierter Account Manager', enabled: true }
            ],
            requestLimit: -1 // Unlimited
        }
    },

    // Trial-Zeitraum in Tagen
    trialDays: 14,

    // Firestore Referenz
    db: null,

    /**
     * Initialize
     */
    async init() {
        if (typeof FirebaseConfig !== 'undefined' && FirebaseConfig.isFirebaseAvailable) {
            await FirebaseConfig.init();
            this.db = FirebaseConfig.db;
        }
        console.log('[Subscription] Initialized');
    },

    /**
     * Prüft ob Werkstatt ein aktives Abo hat
     */
    async hasActiveSubscription(workshopId) {
        if (!this.db) {
            // Fallback: localStorage für Demo
            const sub = localStorage.getItem(`schadens-chat-subscription-${workshopId}`);
            if (sub) {
                const subscription = JSON.parse(sub);
                return this.isSubscriptionActive(subscription);
            }
            return false;
        }

        try {
            const doc = await this.db.collection('subscriptions').doc(workshopId).get();
            if (doc.exists) {
                return this.isSubscriptionActive(doc.data());
            }
            return false;
        } catch (error) {
            console.error('[Subscription] Check error:', error);
            return false;
        }
    },

    /**
     * Prüft ob Subscription aktiv ist
     */
    isSubscriptionActive(subscription) {
        if (!subscription) return false;

        const now = new Date();
        const endDate = subscription.endDate?.toDate?.() || new Date(subscription.endDate);

        // Aktiv wenn nicht gekündigt und Enddatum noch nicht erreicht
        return subscription.status === 'active' && endDate > now;
    },

    /**
     * Prüft ob Werkstatt in der Trial-Phase ist
     */
    async isInTrial(workshopId) {
        if (!this.db) {
            const sub = localStorage.getItem(`schadens-chat-subscription-${workshopId}`);
            if (sub) {
                const subscription = JSON.parse(sub);
                return subscription.status === 'trial' && this.isSubscriptionActive(subscription);
            }
            return false;
        }

        try {
            const doc = await this.db.collection('subscriptions').doc(workshopId).get();
            if (doc.exists) {
                const data = doc.data();
                return data.status === 'trial' && this.isSubscriptionActive(data);
            }
            return false;
        } catch (error) {
            console.error('[Subscription] Trial check error:', error);
            return false;
        }
    },

    /**
     * Holt aktuelle Subscription
     */
    async getSubscription(workshopId) {
        if (!this.db) {
            const sub = localStorage.getItem(`schadens-chat-subscription-${workshopId}`);
            return sub ? JSON.parse(sub) : null;
        }

        try {
            const doc = await this.db.collection('subscriptions').doc(workshopId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('[Subscription] Get error:', error);
            return null;
        }
    },

    /**
     * Startet Trial für neue Werkstatt
     */
    async startTrial(workshopId, workshopData = {}) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + this.trialDays);

        const subscription = {
            workshopId,
            plan: 'professional', // Trial hat Professional Features
            status: 'trial',
            startDate: new Date().toISOString(),
            endDate: trialEnd.toISOString(),
            trialEnd: trialEnd.toISOString(),
            requestsUsed: 0,
            requestLimit: this.plans.professional.requestLimit,
            createdAt: new Date().toISOString(),
            ...workshopData
        };

        if (!this.db) {
            localStorage.setItem(`schadens-chat-subscription-${workshopId}`, JSON.stringify(subscription));
            return subscription;
        }

        try {
            await this.db.collection('subscriptions').doc(workshopId).set({
                ...subscription,
                startDate: firebase.firestore.Timestamp.now(),
                endDate: firebase.firestore.Timestamp.fromDate(trialEnd),
                trialEnd: firebase.firestore.Timestamp.fromDate(trialEnd),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return subscription;
        } catch (error) {
            console.error('[Subscription] Start trial error:', error);
            throw error;
        }
    },

    /**
     * Aktiviert ein Abo
     */
    async activateSubscription(workshopId, planId, paymentMethod = 'manual') {
        const plan = this.plans[planId];
        if (!plan) {
            throw new Error('Invalid plan');
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 Monat

        const subscription = {
            workshopId,
            plan: planId,
            planName: plan.name,
            price: plan.price,
            status: 'active',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            requestsUsed: 0,
            requestLimit: plan.requestLimit,
            paymentMethod,
            autoRenew: true,
            updatedAt: new Date().toISOString()
        };

        if (!this.db) {
            localStorage.setItem(`schadens-chat-subscription-${workshopId}`, JSON.stringify(subscription));
            return subscription;
        }

        try {
            await this.db.collection('subscriptions').doc(workshopId).set({
                ...subscription,
                startDate: firebase.firestore.Timestamp.fromDate(startDate),
                endDate: firebase.firestore.Timestamp.fromDate(endDate),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Log the subscription event
            await this.logSubscriptionEvent(workshopId, 'activated', { planId, price: plan.price });

            return subscription;
        } catch (error) {
            console.error('[Subscription] Activate error:', error);
            throw error;
        }
    },

    /**
     * Kündigt ein Abo
     */
    async cancelSubscription(workshopId, reason = '') {
        if (!this.db) {
            const sub = localStorage.getItem(`schadens-chat-subscription-${workshopId}`);
            if (sub) {
                const subscription = JSON.parse(sub);
                subscription.status = 'cancelled';
                subscription.cancelledAt = new Date().toISOString();
                subscription.cancelReason = reason;
                subscription.autoRenew = false;
                localStorage.setItem(`schadens-chat-subscription-${workshopId}`, JSON.stringify(subscription));
                return subscription;
            }
            return null;
        }

        try {
            await this.db.collection('subscriptions').doc(workshopId).update({
                status: 'cancelled',
                cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
                cancelReason: reason,
                autoRenew: false
            });

            await this.logSubscriptionEvent(workshopId, 'cancelled', { reason });

            return await this.getSubscription(workshopId);
        } catch (error) {
            console.error('[Subscription] Cancel error:', error);
            throw error;
        }
    },

    /**
     * Erhöht den Request-Zähler
     */
    async incrementRequestCount(workshopId) {
        if (!this.db) {
            const sub = localStorage.getItem(`schadens-chat-subscription-${workshopId}`);
            if (sub) {
                const subscription = JSON.parse(sub);
                subscription.requestsUsed = (subscription.requestsUsed || 0) + 1;
                localStorage.setItem(`schadens-chat-subscription-${workshopId}`, JSON.stringify(subscription));
                return subscription.requestsUsed;
            }
            return 0;
        }

        try {
            await this.db.collection('subscriptions').doc(workshopId).update({
                requestsUsed: firebase.firestore.FieldValue.increment(1)
            });
            const sub = await this.getSubscription(workshopId);
            return sub?.requestsUsed || 0;
        } catch (error) {
            console.error('[Subscription] Increment error:', error);
            return 0;
        }
    },

    /**
     * Prüft ob Werkstatt noch Anfragen übrig hat
     */
    async canMakeOffer(workshopId) {
        const subscription = await this.getSubscription(workshopId);

        if (!subscription) return false;
        if (!this.isSubscriptionActive(subscription)) return false;

        // Unlimited
        if (subscription.requestLimit === -1) return true;

        return subscription.requestsUsed < subscription.requestLimit;
    },

    /**
     * Gibt verbleibende Anfragen zurück
     */
    async getRemainingRequests(workshopId) {
        const subscription = await this.getSubscription(workshopId);

        if (!subscription) return 0;
        if (subscription.requestLimit === -1) return -1; // Unlimited

        return Math.max(0, subscription.requestLimit - (subscription.requestsUsed || 0));
    },

    /**
     * Loggt Subscription-Events
     */
    async logSubscriptionEvent(workshopId, eventType, data = {}) {
        if (!this.db) return;

        try {
            await this.db.collection('subscriptionLogs').add({
                workshopId,
                eventType,
                data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Subscription] Log error:', error);
        }
    },

    /**
     * Rendert Pricing-Karten
     */
    renderPricingCards(containerId, onSelectPlan) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = Object.values(this.plans).map(plan => `
            <div class="pricing-card ${plan.popular ? 'popular' : ''}">
                <div class="pricing-card-header">
                    <div class="pricing-plan-icon">${plan.icon}</div>
                    <div class="pricing-plan-name">${plan.name}</div>
                    <div class="pricing-price">
                        <span class="pricing-currency">€</span>
                        <span class="pricing-amount">${plan.price}</span>
                        <span class="pricing-period">/${plan.period}</span>
                    </div>
                </div>
                <ul class="pricing-features">
                    ${plan.features.map(f => `
                        <li class="pricing-feature ${f.enabled ? '' : 'disabled'}">
                            <span class="pricing-feature-icon">${f.enabled ? '✓' : '✕'}</span>
                            <span>${f.text}</span>
                        </li>
                    `).join('')}
                </ul>
                <button class="btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} pricing-cta"
                        onclick="${onSelectPlan}('${plan.id}')">
                    ${plan.popular ? 'Jetzt starten' : 'Auswählen'}
                </button>
            </div>
        `).join('');
    },

    /**
     * Zeigt Paywall
     */
    showPaywall(onSubscribe) {
        const overlay = document.createElement('div');
        overlay.className = 'paywall-overlay';
        overlay.id = 'paywall-overlay';

        overlay.innerHTML = `
            <div class="paywall-card">
                <div class="paywall-icon"><svg class="icon icon-xl"><use href="#icon-shield"></use></svg></div>
                <h2 class="paywall-title">Abo erforderlich</h2>
                <p class="paywall-text">
                    Um Angebote abgeben zu können, benötigen Sie ein aktives Abonnement.
                </p>
                <div class="paywall-features">
                    <div class="paywall-feature">
                        <span class="paywall-feature-icon">✓</span>
                        <span>14 Tage kostenlos testen</span>
                    </div>
                    <div class="paywall-feature">
                        <span class="paywall-feature-icon">✓</span>
                        <span>Jederzeit kündbar</span>
                    </div>
                    <div class="paywall-feature">
                        <span class="paywall-feature-icon">✓</span>
                        <span>Keine versteckten Kosten</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-block btn-lg mb-md" onclick="SubscriptionManager.hidePaywall(); ${onSubscribe}()">
                    Jetzt Abo abschließen
                </button>
                <button class="btn btn-ghost btn-block" onclick="SubscriptionManager.hidePaywall()">
                    Später
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    /**
     * Versteckt Paywall
     */
    hidePaywall() {
        const overlay = document.getElementById('paywall-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    /**
     * Rendert Trial-Banner
     */
    renderTrialBanner(containerId, daysRemaining) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="trial-banner">
                <div class="trial-banner-icon">🎁</div>
                <div class="trial-banner-content">
                    <div class="trial-banner-title">Trial aktiv</div>
                    <div class="trial-banner-text">Noch ${daysRemaining} Tage kostenlos testen</div>
                </div>
                <button class="btn btn-sm" style="background: white; color: var(--primary);"
                        onclick="Workshop.showSubscription()">
                    Upgraden
                </button>
            </div>
        `;
    },

    /**
     * Rendert Subscription-Status
     */
    renderSubscriptionStatus(containerId, subscription) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const plan = this.plans[subscription.plan] || {};
        const endDate = subscription.endDate?.toDate?.() || new Date(subscription.endDate);
        const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        const isExpired = daysRemaining <= 0;

        container.innerHTML = `
            <div class="subscription-status">
                <div class="subscription-status-header">
                    <div>
                        <h3 style="font-weight: 700; margin-bottom: 4px;">${plan.name || 'Kein Plan'}</h3>
                        <span class="subscription-badge ${isExpired ? 'expired' : ''}">
                            ${subscription.status === 'trial' ? 'Trial' :
                              isExpired ? 'Abgelaufen' : '✓ Aktiv'}
                        </span>
                    </div>
                    <div class="pricing-plan-icon" style="font-size: 24px;">${plan.icon || ''}</div>
                </div>
                <div class="subscription-status-info">
                    <div class="subscription-info-item">
                        <div class="subscription-info-label">Gültig bis</div>
                        <div class="subscription-info-value">
                            ${endDate.toLocaleDateString('de-DE')}
                        </div>
                    </div>
                    <div class="subscription-info-item">
                        <div class="subscription-info-label">Anfragen</div>
                        <div class="subscription-info-value">
                            ${subscription.requestLimit === -1 ? '∞' :
                              `${subscription.requestsUsed || 0}/${subscription.requestLimit}`}
                        </div>
                    </div>
                </div>
                ${subscription.status !== 'cancelled' ? `
                    <button class="btn btn-outline btn-block mt-lg" onclick="Workshop.showSubscription()">
                        ${subscription.status === 'trial' ? 'Jetzt upgraden' : 'Plan ändern'}
                    </button>
                ` : ''}
            </div>
        `;
    }
};

// Export
window.SubscriptionManager = SubscriptionManager;
