/**
 * SchadensChat - Authentication Manager
 * Telefon-Auth für Kunden, Email/Passwort für Werkstätten
 */

const Auth = {
    // State
    currentUser: null,
    userType: null, // 'customer' | 'workshop'
    confirmationResult: null,
    recaptchaVerifier: null,
    authListeners: [],

    /**
     * Initialize Auth
     */
    async init() {
        console.log('[Auth] Initializing...');

        // Wait for Firebase
        await FirebaseConfig.init();

        // Listen for auth state changes
        if (FirebaseConfig.auth) {
            FirebaseConfig.auth.onAuthStateChanged(user => {
                this.handleAuthStateChange(user);
            });

            // Set language to German
            FirebaseConfig.auth.languageCode = 'de';
        }

        // Check for stored session
        this.loadStoredSession();

        console.log('[Auth] Initialized');
    },

    /**
     * Handle auth state changes
     */
    handleAuthStateChange(user) {
        this.currentUser = user;

        if (user) {
            console.log('[Auth] User signed in:', user.uid);
            // Get user type from localStorage or Firestore
            this.userType = localStorage.getItem('schadens-chat-user-type') || 'customer';
        } else {
            console.log('[Auth] User signed out');
            this.userType = null;
        }

        // Notify listeners
        this.authListeners.forEach(listener => listener(user, this.userType));
    },

    /**
     * Add auth state listener
     */
    onAuthStateChanged(callback) {
        this.authListeners.push(callback);
        // Immediately call with current state
        callback(this.currentUser, this.userType);
        // Return unsubscribe function
        return () => {
            this.authListeners = this.authListeners.filter(l => l !== callback);
        };
    },

    /**
     * Load stored session
     */
    loadStoredSession() {
        const storedUser = localStorage.getItem('schadens-chat-user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                this.userType = userData.type;
                // For offline mode
                if (!this.currentUser && userData.phone) {
                    this.currentUser = { phone: userData.phone, uid: userData.uid };
                }
            } catch (e) {
                console.warn('[Auth] Failed to parse stored user');
            }
        }
    },

    /**
     * Save session
     */
    saveSession(user, type) {
        localStorage.setItem('schadens-chat-user', JSON.stringify({
            uid: user.uid,
            phone: user.phoneNumber || null,
            email: user.email || null,
            type: type
        }));
        localStorage.setItem('schadens-chat-user-type', type);
    },

    // ========== PHONE AUTH (CUSTOMERS) ==========

    /**
     * Setup reCAPTCHA verifier
     */
    setupRecaptcha(buttonId) {
        if (!FirebaseConfig.auth) {
            console.warn('[Auth] Auth not available');
            return null;
        }

        // Clear existing verifier
        if (this.recaptchaVerifier) {
            this.recaptchaVerifier.clear();
        }

        this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(buttonId, {
            size: 'invisible',
            callback: () => {
                console.log('[Auth] reCAPTCHA solved');
            },
            'expired-callback': () => {
                console.log('[Auth] reCAPTCHA expired');
                this.showToast('reCAPTCHA abgelaufen. Bitte erneut versuchen.', 'warning');
            }
        });

        return this.recaptchaVerifier;
    },

    /**
     * Send SMS verification code
     */
    async sendVerificationCode(phoneNumber) {
        if (!FirebaseConfig.auth) {
            throw new Error('Auth not available');
        }

        // Format phone number (add +49 for German numbers)
        const formattedPhone = this.formatPhoneNumber(phoneNumber);

        try {
            // Setup reCAPTCHA if not already done
            if (!this.recaptchaVerifier) {
                this.setupRecaptcha('send-code-btn');
            }

            this.confirmationResult = await FirebaseConfig.auth.signInWithPhoneNumber(
                formattedPhone,
                this.recaptchaVerifier
            );

            console.log('[Auth] SMS sent to:', formattedPhone);
            return true;

        } catch (error) {
            console.error('[Auth] SMS send error:', error);

            // Reset reCAPTCHA on error
            if (this.recaptchaVerifier) {
                this.recaptchaVerifier.clear();
                this.recaptchaVerifier = null;
            }

            throw this.handleAuthError(error);
        }
    },

    /**
     * Verify SMS code
     */
    async verifyCode(code) {
        if (!this.confirmationResult) {
            throw new Error('Kein Verifizierungscode angefordert');
        }

        try {
            const result = await this.confirmationResult.confirm(code);
            const user = result.user;

            // Save session
            this.saveSession(user, 'customer');
            this.userType = 'customer';

            console.log('[Auth] Phone verified, user:', user.uid);
            return user;

        } catch (error) {
            console.error('[Auth] Code verification error:', error);
            throw this.handleAuthError(error);
        }
    },

    /**
     * Format phone number
     */
    formatPhoneNumber(phone) {
        // Remove all non-digits
        let cleaned = phone.replace(/\D/g, '');

        // German number formatting
        if (cleaned.startsWith('0')) {
            // Remove leading 0 and add +49
            cleaned = '49' + cleaned.substring(1);
        }

        // Add + if not present
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }

        return cleaned;
    },

    // ========== EMAIL AUTH (WORKSHOPS) ==========

    /**
     * Login with email/password (Workshops)
     */
    async loginWithEmail(email, password) {
        if (!FirebaseConfig.auth) {
            // Fallback for demo/offline mode
            return this.loginDemo(email);
        }

        try {
            const result = await FirebaseConfig.auth.signInWithEmailAndPassword(email, password);
            const user = result.user;

            // Save session as workshop
            this.saveSession(user, 'workshop');
            this.userType = 'workshop';

            console.log('[Auth] Workshop logged in:', user.email);
            return user;

        } catch (error) {
            console.error('[Auth] Email login error:', error);
            throw this.handleAuthError(error);
        }
    },

    /**
     * Register workshop with email/password
     */
    async registerWorkshop(email, password, workshopData) {
        if (!FirebaseConfig.auth) {
            throw new Error('Auth not available');
        }

        try {
            // Create user account
            const result = await FirebaseConfig.auth.createUserWithEmailAndPassword(email, password);
            const user = result.user;

            // Create workshop profile in Firestore
            if (FirebaseConfig.db) {
                await FirebaseConfig.db.collection('workshops').doc(user.uid).set({
                    ...workshopData,
                    email: email,
                    userId: user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'active'
                });
            }

            // Save session
            this.saveSession(user, 'workshop');
            this.userType = 'workshop';

            console.log('[Auth] Workshop registered:', user.email);
            return user;

        } catch (error) {
            console.error('[Auth] Workshop registration error:', error);
            throw this.handleAuthError(error);
        }
    },

    /**
     * Send password reset email
     */
    async sendPasswordReset(email) {
        if (!FirebaseConfig.auth) {
            throw new Error('Auth not available');
        }

        try {
            await FirebaseConfig.auth.sendPasswordResetEmail(email);
            console.log('[Auth] Password reset email sent to:', email);
            return true;

        } catch (error) {
            console.error('[Auth] Password reset error:', error);
            throw this.handleAuthError(error);
        }
    },

    /**
     * Demo login (fallback)
     */
    loginDemo(identifier) {
        const demoUser = {
            uid: 'demo_' + Date.now(),
            email: identifier.includes('@') ? identifier : null,
            phoneNumber: !identifier.includes('@') ? identifier : null
        };

        this.currentUser = demoUser;
        this.userType = identifier.includes('@') ? 'workshop' : 'customer';
        this.saveSession(demoUser, this.userType);

        // Notify listeners
        this.authListeners.forEach(listener => listener(demoUser, this.userType));

        return demoUser;
    },

    // ========== LOGOUT ==========

    /**
     * Sign out
     */
    async signOut() {
        try {
            if (FirebaseConfig.auth) {
                await FirebaseConfig.auth.signOut();
            }

            // Clear local storage
            localStorage.removeItem('schadens-chat-user');
            localStorage.removeItem('schadens-chat-user-type');
            localStorage.removeItem('schadens-chat-workshop');

            this.currentUser = null;
            this.userType = null;
            this.confirmationResult = null;

            console.log('[Auth] Signed out');

        } catch (error) {
            console.error('[Auth] Sign out error:', error);
        }
    },

    // ========== HELPERS ==========

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.currentUser;
    },

    /**
     * Check if user is workshop
     */
    isWorkshop() {
        return this.userType === 'workshop';
    },

    /**
     * Check if user is customer
     */
    isCustomer() {
        return this.userType === 'customer';
    },

    /**
     * Get current user ID
     */
    getUserId() {
        return this.currentUser?.uid || null;
    },

    /**
     * Get user phone
     */
    getUserPhone() {
        return this.currentUser?.phoneNumber || null;
    },

    /**
     * Get user email
     */
    getUserEmail() {
        return this.currentUser?.email || null;
    },

    /**
     * Handle Firebase auth errors
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/invalid-phone-number': 'Ungültige Telefonnummer',
            'auth/missing-phone-number': 'Bitte Telefonnummer eingeben',
            'auth/quota-exceeded': 'SMS-Limit erreicht. Bitte später erneut versuchen.',
            'auth/user-disabled': 'Account deaktiviert',
            'auth/operation-not-allowed': 'Telefon-Authentifizierung nicht aktiviert',
            'auth/invalid-verification-code': 'Ungültiger Code',
            'auth/invalid-verification-id': 'Verifizierung abgelaufen. Bitte erneut versuchen.',
            'auth/code-expired': 'Code abgelaufen. Bitte neuen Code anfordern.',
            'auth/wrong-password': 'Falsches Passwort',
            'auth/user-not-found': 'Kein Account mit dieser E-Mail gefunden',
            'auth/email-already-in-use': 'E-Mail bereits registriert',
            'auth/weak-password': 'Passwort zu schwach (mind. 6 Zeichen)',
            'auth/invalid-email': 'Ungültige E-Mail-Adresse',
            'auth/network-request-failed': 'Netzwerkfehler. Bitte Verbindung prüfen.',
            'auth/too-many-requests': 'Zu viele Versuche. Bitte später erneut versuchen.',
            'auth/popup-closed-by-user': 'Anmeldung abgebrochen'
        };

        const message = errorMessages[error.code] || error.message || 'Unbekannter Fehler';
        return new Error(message);
    },

    /**
     * Show toast (helper)
     */
    showToast(message, type = 'info') {
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(message, type);
        } else if (typeof Workshop !== 'undefined' && Workshop.showToast) {
            Workshop.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}

// Export for global access
window.Auth = Auth;
