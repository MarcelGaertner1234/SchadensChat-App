/**
 * SchadensChat - Workshop Portal
 * Mobile-First PWA für Werkstätten
 */

const Workshop = {
    // State
    currentPage: 'login',
    workshopId: null,
    workshopName: null,
    currentTab: 'new',
    currentRequestId: null,
    requests: [],
    chats: [],
    subscription: null,

    /**
     * Initialize the Workshop Portal
     */
    init() {
        console.log('[Workshop] Initializing...');

        // Check if already logged in
        const savedWorkshop = localStorage.getItem('schadens-chat-workshop');
        if (savedWorkshop) {
            const data = JSON.parse(savedWorkshop);
            this.workshopId = data.id;
            this.workshopName = data.name;
            this.showDashboard();
        }

        // Initialize SubscriptionManager
        if (typeof SubscriptionManager !== 'undefined') {
            SubscriptionManager.init();
        }

        // Initialize language selector
        this.initLanguageSelector();

        // Initialize chat input
        this.initChatInput();

        // Load demo data
        this.loadDemoData();

        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.initLanguageSelector();
            I18N.translatePage();
        });

        // Initialize network status listener
        this.initNetworkStatus();

        // Initialize cookie consent
        this.initCookieConsent();

        // Initialize modal system
        this.initModal();

        // Initialize form validation
        this.initFormValidation();

        console.log('[Workshop] Initialized');
    },

    /**
     * Initialize network status listener
     */
    initNetworkStatus() {
        const updateStatus = () => {
            const status = document.getElementById('network-status');
            if (!status) return;

            if (!navigator.onLine) {
                status.classList.remove('hidden', 'online');
                status.classList.add('offline');
                status.querySelector('.network-text').textContent = 'Offline - Änderungen werden gespeichert';
            } else {
                status.classList.add('hidden');
            }
        };

        window.addEventListener('online', () => {
            const status = document.getElementById('network-status');
            if (status) {
                status.classList.remove('hidden', 'offline');
                status.classList.add('online');
                status.querySelector('.network-text').textContent = 'Wieder online';
                setTimeout(() => status.classList.add('hidden'), 2000);
            }
        });

        window.addEventListener('offline', updateStatus);
        updateStatus();
    },

    /**
     * Initialize cookie consent
     */
    initCookieConsent() {
        const consent = localStorage.getItem('schadens-chat-cookie-consent');
        if (!consent) {
            setTimeout(() => {
                const banner = document.getElementById('cookie-banner');
                if (banner) banner.classList.remove('hidden');
            }, 1500);
        }
    },

    /**
     * Accept cookies
     */
    acceptCookies(level) {
        localStorage.setItem('schadens-chat-cookie-consent', level);
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.add('hidden');
        this.showToast(level === 'all' ? 'Alle Cookies akzeptiert' : 'Nur notwendige Cookies aktiv', 'success');
    },

    /**
     * Initialize modal system
     */
    initModal() {
        const overlay = document.getElementById('modal-overlay');
        const cancelBtn = document.getElementById('modal-cancel');

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hideModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }
    },

    /**
     * Show custom modal dialog
     */
    showModal(options = {}) {
        const {
            icon = '⚠️',
            title = 'Bestätigung',
            text = 'Möchten Sie fortfahren?',
            confirmText = 'Bestätigen',
            cancelText = 'Abbrechen',
            danger = false,
            onConfirm = () => {}
        } = options;

        const overlay = document.getElementById('modal-overlay');
        const card = document.getElementById('modal-card');
        const iconEl = document.getElementById('modal-icon');
        const titleEl = document.getElementById('modal-title');
        const textEl = document.getElementById('modal-text');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        if (!overlay) return;

        iconEl.textContent = icon;
        titleEl.textContent = title;
        textEl.textContent = text;
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        card.classList.toggle('danger', danger);

        // Set up confirm handler
        const handleConfirm = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            onConfirm();
            this.hideModal();
        };
        confirmBtn.addEventListener('click', handleConfirm);

        overlay.classList.remove('hidden');

        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(10);
    },

    /**
     * Hide modal
     */
    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    /**
     * Show loading overlay
     */
    showLoading(text = 'Lädt...', subtext = '') {
        const overlay = document.getElementById('loading-overlay');
        const textEl = document.getElementById('loading-text');
        const subtextEl = document.getElementById('loading-subtext');

        if (overlay) {
            if (textEl) textEl.textContent = text;
            if (subtextEl) subtextEl.textContent = subtext;
            overlay.classList.remove('hidden');
        }
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    /**
     * Show success animation
     */
    showSuccess(text = 'Erfolgreich!') {
        const overlay = document.getElementById('success-overlay');
        const textEl = document.getElementById('success-text');

        if (overlay) {
            if (textEl) textEl.textContent = text;
            overlay.classList.remove('hidden');

            // Auto hide after animation
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 1500);

            // Haptic feedback
            if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
        }
    },

    /**
     * Validate email
     */
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Validate input and show feedback
     */
    validateInput(inputId, validator, errorMessage) {
        const input = document.getElementById(inputId);
        if (!input) return false;

        const group = input.closest('.input-group');
        const value = input.value.trim();
        const isValid = validator(value);

        // Remove existing feedback
        const existingError = group?.querySelector('.input-error');
        const existingSuccess = group?.querySelector('.input-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        if (group) {
            group.classList.remove('has-error', 'has-success');

            if (value && !isValid) {
                group.classList.add('has-error');
                const error = document.createElement('div');
                error.className = 'input-error';
                error.innerHTML = `<span>✕</span> ${errorMessage}`;
                group.appendChild(error);
            } else if (value && isValid) {
                group.classList.add('has-success');
                const success = document.createElement('div');
                success.className = 'input-success';
                success.innerHTML = `<span>✓</span> Gültig`;
                group.appendChild(success);
            }
        }

        return isValid;
    },

    /**
     * Show skeleton loading for requests
     */
    showSkeletonLoading() {
        const container = document.getElementById('requests-container');
        if (!container) return;

        container.innerHTML = Array(3).fill(0).map(() => `
            <div class="skeleton-request-card">
                <div class="skeleton-header">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-meta"></div>
                </div>
                <div class="skeleton-photos">
                    <div class="skeleton skeleton-photo"></div>
                    <div class="skeleton skeleton-photo"></div>
                    <div class="skeleton skeleton-photo"></div>
                </div>
                <div class="skeleton-footer">
                    <div class="skeleton skeleton-meta"></div>
                    <div class="skeleton skeleton-badge"></div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Check and show trial banner
     */
    async checkTrialStatus() {
        if (typeof SubscriptionManager === 'undefined' || !this.workshopId) return;

        const subscription = await SubscriptionManager.getSubscription(this.workshopId);
        const banner = document.getElementById('trial-banner');

        if (subscription && subscription.status === 'trial' && banner) {
            const endDate = subscription.endDate?.toDate?.() || new Date(subscription.endDate);
            const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

            if (daysRemaining > 0 && daysRemaining <= 14) {
                document.getElementById('trial-days').textContent = daysRemaining;
                banner.classList.remove('hidden');
            }
        }
    },

    /**
     * Initialize language selector
     */
    initLanguageSelector() {
        const container = document.getElementById('ws-language-selector');
        if (!container) return;

        const languages = I18N.getAvailableLanguages();
        container.innerHTML = languages.map(lang => `
            <div class="language-option ${lang.code === I18N.currentLang ? 'active' : ''}"
                 onclick="Workshop.setLanguage('${lang.code}')">
                <span class="language-flag">${lang.flag}</span>
                <span class="language-name">${lang.name}</span>
            </div>
        `).join('');
    },

    /**
     * Set language
     */
    setLanguage(lang) {
        I18N.setLanguage(lang);
        this.initLanguageSelector();
    },

    /**
     * Login to workshop portal
     */
    async login() {
        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;

        // Demo mode if empty
        if (!email && !password) {
            this.loginDemo();
            return;
        }

        // Validate email
        if (!email || !this.validateEmail(email)) {
            this.validateInput('login-email', this.validateEmail, 'Bitte gültige E-Mail eingeben');
            return;
        }

        // Show loading overlay
        this.showLoading('Anmeldung...', 'Bitte warten');

        const btn = document.getElementById('login-btn');
        if (btn) btn.disabled = true;

        try {
            // Try Firebase Auth
            if (typeof Auth !== 'undefined' && Auth.loginWithEmail) {
                const user = await Auth.loginWithEmail(email, password);

                // Get workshop data from Firestore or localStorage
                this.workshopId = user.uid;
                this.workshopName = user.email?.split('@')[0] || 'Werkstatt';

                // Save to localStorage
                localStorage.setItem('schadens-chat-workshop', JSON.stringify({
                    id: this.workshopId,
                    name: this.workshopName,
                    email: user.email
                }));

                this.hideLoading();
                this.showSuccess('Willkommen zurück!');
                setTimeout(() => this.showDashboard(), 1200);
            } else {
                // Fallback to demo
                this.hideLoading();
                this.loginDemo(email);
            }
        } catch (error) {
            console.error('[Workshop] Login error:', error);
            this.hideLoading();
            this.showToast(error.message || 'Anmeldung fehlgeschlagen', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    },

    /**
     * Demo login fallback
     */
    loginDemo(email = null) {
        this.workshopId = 'demo_' + Date.now();
        this.workshopName = email ? email.split('@')[0] : 'Demo-Werkstatt';

        localStorage.setItem('schadens-chat-workshop', JSON.stringify({
            id: this.workshopId,
            name: this.workshopName,
            demo: true
        }));

        this.showToast('Demo-Modus aktiviert', 'info');
        this.showDashboard();
    },

    /**
     * Validate phone number
     */
    validatePhone(phone) {
        // Allow +49, 0, or any phone with at least 6 digits
        return /^[\+]?[0-9\s\-]{6,}$/.test(phone.replace(/\s/g, ''));
    },

    /**
     * Validate password strength
     */
    validatePassword(password) {
        return password && password.length >= 6;
    },

    /**
     * Get password strength (0-4)
     */
    getPasswordStrength(password) {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return Math.min(strength, 4);
    },

    /**
     * Update password strength meter
     */
    updatePasswordStrength(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const group = input.closest('.input-group');
        if (!group) return;

        // Remove existing strength meter
        let meter = group.querySelector('.password-strength');
        if (!meter) {
            meter = document.createElement('div');
            meter.className = 'password-strength';
            meter.innerHTML = `
                <div class="password-strength-bar">
                    <div class="password-strength-fill"></div>
                </div>
                <span class="password-strength-text"></span>
            `;
            group.appendChild(meter);
        }

        const password = input.value;
        const strength = this.getPasswordStrength(password);
        const fill = meter.querySelector('.password-strength-fill');
        const text = meter.querySelector('.password-strength-text');

        const levels = ['', 'Schwach', 'Mittel', 'Gut', 'Stark'];
        const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#059669'];

        fill.style.width = `${strength * 25}%`;
        fill.style.backgroundColor = colors[strength] || '';
        text.textContent = levels[strength] || '';
        text.style.color = colors[strength] || '';

        if (password) {
            meter.style.display = 'flex';
        } else {
            meter.style.display = 'none';
        }
    },

    /**
     * Initialize form validation for live feedback
     */
    initFormValidation() {
        // Email validation on register form
        const registerEmail = document.getElementById('register-email');
        if (registerEmail) {
            registerEmail.addEventListener('blur', () => {
                this.validateInput('register-email', this.validateEmail, 'Bitte gültige E-Mail eingeben');
            });
        }

        // Password strength on register form
        const registerPassword = document.getElementById('register-password');
        if (registerPassword) {
            registerPassword.addEventListener('input', () => {
                this.updatePasswordStrength('register-password');
            });
            registerPassword.addEventListener('blur', () => {
                this.validateInput('register-password', this.validatePassword, 'Mind. 6 Zeichen erforderlich');
            });
        }

        // Phone validation on register form
        const registerPhone = document.getElementById('register-phone');
        if (registerPhone) {
            registerPhone.addEventListener('blur', () => {
                if (registerPhone.value.trim()) {
                    this.validateInput('register-phone', this.validatePhone, 'Bitte gültige Telefonnummer eingeben');
                }
            });
        }

        // Login email validation
        const loginEmail = document.getElementById('login-email');
        if (loginEmail) {
            loginEmail.addEventListener('blur', () => {
                if (loginEmail.value.trim()) {
                    this.validateInput('login-email', this.validateEmail, 'Bitte gültige E-Mail eingeben');
                }
            });
        }

        // Offer form validation
        const offerPrice = document.getElementById('offer-price');
        if (offerPrice) {
            offerPrice.addEventListener('blur', () => {
                if (offerPrice.value) {
                    this.validateInput('offer-price', v => v && parseInt(v) > 0, 'Bitte gültigen Preis eingeben');
                }
            });
        }

        const offerDuration = document.getElementById('offer-duration');
        if (offerDuration) {
            offerDuration.addEventListener('blur', () => {
                if (offerDuration.value) {
                    this.validateInput('offer-duration', v => v && parseInt(v) > 0, 'Bitte gültige Dauer eingeben');
                }
            });
        }
    },

    /**
     * Register new workshop
     */
    async register() {
        const name = document.getElementById('register-name')?.value.trim();
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const phone = document.getElementById('register-phone')?.value.trim();
        const address = document.getElementById('register-address')?.value.trim();

        // Validate all fields with visual feedback
        let hasErrors = false;

        if (!name) {
            this.validateInput('register-name', v => v && v.length > 0, 'Name ist erforderlich');
            hasErrors = true;
        }

        if (!this.validateEmail(email)) {
            this.validateInput('register-email', this.validateEmail, 'Bitte gültige E-Mail eingeben');
            hasErrors = true;
        }

        if (!this.validatePassword(password)) {
            this.validateInput('register-password', this.validatePassword, 'Mind. 6 Zeichen erforderlich');
            hasErrors = true;
        }

        if (hasErrors) return;

        // Show loading overlay
        this.showLoading('Registrierung...', 'Ihr Konto wird erstellt');

        const btn = document.getElementById('register-btn');
        if (btn) btn.disabled = true;

        try {
            if (typeof Auth !== 'undefined' && Auth.registerWorkshop) {
                const user = await Auth.registerWorkshop(email, password, {
                    name,
                    phone,
                    address
                });

                this.workshopId = user.uid;
                this.workshopName = name;

                localStorage.setItem('schadens-chat-workshop', JSON.stringify({
                    id: this.workshopId,
                    name: this.workshopName,
                    email: user.email
                }));

                this.hideLoading();
                this.showSuccess('Registrierung erfolgreich!');
                setTimeout(() => this.showDashboard(), 1200);
            } else {
                // Fallback
                this.hideLoading();
                this.loginDemo(email);
            }
        } catch (error) {
            console.error('[Workshop] Register error:', error);
            this.hideLoading();
            this.showToast(error.message || 'Registrierung fehlgeschlagen', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    },

    /**
     * Send password reset email
     */
    async sendPasswordReset() {
        const email = document.getElementById('reset-email')?.value.trim();

        if (!email) {
            this.showToast('Bitte E-Mail eingeben', 'error');
            return;
        }

        try {
            if (typeof Auth !== 'undefined' && Auth.sendPasswordReset) {
                await Auth.sendPasswordReset(email);
            }
            this.showToast('E-Mail mit Reset-Link gesendet!', 'success');
            this.showLogin();
        } catch (error) {
            console.error('[Workshop] Password reset error:', error);
            this.showToast(error.message || 'Fehler beim Senden', 'error');
        }
    },

    /**
     * Show login form
     */
    showLogin() {
        document.querySelector('.login-card:not(#register-form):not(#reset-form)')?.classList.remove('hidden');
        document.getElementById('register-form')?.classList.add('hidden');
        document.getElementById('reset-form')?.classList.add('hidden');
    },

    /**
     * Show register form
     */
    showRegister() {
        document.querySelector('.login-card:not(#register-form):not(#reset-form)')?.classList.add('hidden');
        document.getElementById('register-form')?.classList.remove('hidden');
        document.getElementById('reset-form')?.classList.add('hidden');
    },

    /**
     * Show password reset form
     */
    showPasswordReset() {
        document.querySelector('.login-card:not(#register-form):not(#reset-form)')?.classList.add('hidden');
        document.getElementById('register-form')?.classList.add('hidden');
        document.getElementById('reset-form')?.classList.remove('hidden');
    },

    /**
     * Logout
     */
    async logout() {
        try {
            if (typeof Auth !== 'undefined' && Auth.signOut) {
                await Auth.signOut();
            }
        } catch (error) {
            console.error('[Workshop] Logout error:', error);
        }

        localStorage.removeItem('schadens-chat-workshop');
        this.workshopId = null;
        this.workshopName = null;

        // Show login page
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById('page-login').classList.remove('hidden');
        this.currentPage = 'login';

        this.showToast('Erfolgreich abgemeldet', 'success');
    },

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Apply new theme
        html.setAttribute('data-theme', newTheme);

        // Save preference
        localStorage.setItem('schadens-chat-theme', newTheme);

        // Update meta theme-color for status bar
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1a1a2e' : '#667eea');
        }

        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        console.log(`[Workshop] Theme switched to: ${newTheme}`);
    },

    /**
     * Show dashboard
     */
    async showDashboard() {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById('page-dashboard').classList.remove('hidden');
        this.currentPage = 'dashboard';

        // Update workshop name
        document.getElementById('workshop-name').textContent = this.workshopName;

        // Show skeleton loading while fetching data
        this.showSkeletonLoading();

        // Load requests and update UI
        await this.loadRequests();
        this.updateStats();
        this.renderRequests();

        // Check trial status and show banner
        this.checkTrialStatus();
    },

    /**
     * Navigate to page
     */
    async navigateTo(pageName) {
        // Update tab bar
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

        if (pageName === 'dashboard') {
            document.getElementById('page-dashboard').classList.remove('hidden');
            document.querySelector('.tab-item:nth-child(1)')?.classList.add('active');
            await this.loadRequests();
            this.updateStats();
            this.renderRequests();
        } else if (pageName === 'chats') {
            document.getElementById('page-chats').classList.remove('hidden');
            document.querySelector('.tab-item:nth-child(2)')?.classList.add('active');
            this.renderChatList();
        } else if (pageName === 'settings') {
            document.getElementById('page-settings').classList.remove('hidden');
            document.querySelector('.tab-item:nth-child(3)')?.classList.add('active');
            this.initLanguageSelector();
        } else if (pageName === 'request-detail') {
            document.getElementById('page-request-detail').classList.remove('hidden');
        } else if (pageName === 'workshop-chat') {
            document.getElementById('page-workshop-chat').classList.remove('hidden');
        } else if (pageName === 'agb') {
            document.getElementById('page-agb').classList.remove('hidden');
        } else if (pageName === 'datenschutz') {
            document.getElementById('page-datenschutz').classList.remove('hidden');
        } else if (pageName === 'impressum') {
            document.getElementById('page-impressum').classList.remove('hidden');
        } else if (pageName === 'subscription') {
            document.getElementById('page-subscription').classList.remove('hidden');
            this.loadSubscriptionPage();
        }

        this.currentPage = pageName;
    },

    /**
     * Load demo data
     */
    loadDemoData() {
        // Check if demo data exists
        const existing = localStorage.getItem('schadens-chat-workshop-requests');
        if (existing) return;

        // Create demo requests
        const demoRequests = [
            {
                id: 'ws_req_1',
                status: 'new',
                createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
                customer: { name: 'Max Mustermann', phone: '+49 170 1234567', email: 'max@example.de' },
                vehicle: { plate: 'MOS-MM 123', brand: 'BMW', model: 'X5', year: '2020', color: 'Schwarz Metallic' },
                damage: { type: 'dent', location: 'fenderFrontLeft', description: 'Parkplatz-Delle, ca. 5cm' },
                photos: ['https://placehold.co/400x300/333/fff?text=Delle+1', 'https://placehold.co/400x300/333/fff?text=Delle+2'],
                location: { lat: 49.35, lng: 9.14, zip: '74821', radius: 25 },
                offer: null
            },
            {
                id: 'ws_req_2',
                status: 'new',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
                customer: { name: 'Anna Schmidt', phone: '+49 171 9876543', email: 'anna@example.de' },
                vehicle: { plate: 'HD-AS 456', brand: 'Mercedes', model: 'C-Klasse', year: '2019', color: 'Silber' },
                damage: { type: 'scratch', location: 'doorRight', description: 'Langer Kratzer an der Beifahrertür' },
                photos: ['https://placehold.co/400x300/333/fff?text=Kratzer'],
                location: { lat: 49.40, lng: 8.69, zip: '69115', radius: 30 },
                offer: null
            },
            {
                id: 'ws_req_3',
                status: 'offer_sent',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                customer: { name: 'Peter Weber', phone: '+49 172 5555555', email: 'peter@example.de' },
                vehicle: { plate: 'MA-PW 789', brand: 'Audi', model: 'A4', year: '2021', color: 'Weiß' },
                damage: { type: 'paint', location: 'hoodBonnet', description: 'Steinschlag auf Motorhaube' },
                photos: ['https://placehold.co/400x300/333/fff?text=Steinschlag'],
                location: { lat: 49.49, lng: 8.47, zip: '68165', radius: 20 },
                offer: { price: 280, duration: 1, note: 'Spot-Repair möglich', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }
            },
            {
                id: 'ws_req_4',
                status: 'accepted',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
                customer: { name: 'Lisa Müller', phone: '+49 173 1111111', email: 'lisa@example.de' },
                vehicle: { plate: 'KA-LM 321', brand: 'VW', model: 'Golf', year: '2018', color: 'Blau' },
                damage: { type: 'dent', location: 'rearBumper', description: 'Auffahrschaden hinten' },
                photos: ['https://placehold.co/400x300/333/fff?text=Stoßstange'],
                location: { lat: 49.01, lng: 8.40, zip: '76131', radius: 35 },
                offer: { price: 450, duration: 3, note: 'Inkl. Lackierung', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString() }
            }
        ];

        localStorage.setItem('schadens-chat-workshop-requests', JSON.stringify(demoRequests));
    },

    /**
     * Load requests (from Firestore or localStorage)
     */
    async loadRequests() {
        if (typeof WorkshopRequests !== 'undefined') {
            try {
                await WorkshopRequests.init();
                this.requests = await WorkshopRequests.loadRequests();
                console.log(`[Workshop] Loaded ${this.requests.length} requests`);
            } catch (e) {
                console.error('[Workshop] Failed to load requests:', e);
                this.requests = [];
            }
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('schadens-chat-workshop-requests');
            this.requests = saved ? JSON.parse(saved) : [];
        }
    },

    /**
     * Save requests
     */
    saveRequests() {
        localStorage.setItem('schadens-chat-workshop-requests', JSON.stringify(this.requests));
    },

    /**
     * Update dashboard stats
     */
    updateStats() {
        const newCount = this.requests.filter(r => r.status === 'new').length;
        const offerCount = this.requests.filter(r => r.status === 'offer_sent').length;
        const activeCount = this.requests.filter(r => r.status === 'accepted' || r.status === 'in_progress').length;
        const completedCount = this.requests.filter(r => r.status === 'completed').length;

        document.getElementById('stat-new').textContent = newCount;
        document.getElementById('stat-offers').textContent = offerCount;
        document.getElementById('stat-active').textContent = activeCount;
        document.getElementById('stat-completed').textContent = completedCount;
        document.getElementById('badge-new').textContent = newCount;

        // Show/hide badge
        const badge = document.getElementById('badge-new');
        if (badge) {
            badge.style.display = newCount > 0 ? 'inline-flex' : 'none';
        }

        // Update trend indicators
        this.updateTrends(newCount, offerCount, activeCount, completedCount);
    },

    /**
     * Update trend indicators based on historical data
     */
    updateTrends(newCount, offerCount, activeCount, completedCount) {
        // Load previous stats from localStorage
        const prevStatsKey = 'schadens-chat-prev-stats';
        const prevStats = JSON.parse(localStorage.getItem(prevStatsKey) || '{}');

        // Calculate trends
        const trends = {
            new: this.calculateTrend(newCount, prevStats.new),
            offers: this.calculateTrend(offerCount, prevStats.offers),
            active: this.calculateTrend(activeCount, prevStats.active),
            completed: this.calculateTrend(completedCount, prevStats.completed)
        };

        // Update trend displays
        this.updateTrendDisplay('trend-new', trends.new);
        this.updateTrendDisplay('trend-offers', trends.offers);
        this.updateTrendDisplay('trend-active', trends.active);
        this.updateTrendDisplay('trend-completed', trends.completed, true);

        // Save current stats for next comparison (update daily)
        const lastUpdate = prevStats.lastUpdate || 0;
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - lastUpdate > oneDay) {
            localStorage.setItem(prevStatsKey, JSON.stringify({
                new: newCount,
                offers: offerCount,
                active: activeCount,
                completed: completedCount,
                lastUpdate: Date.now()
            }));
        }
    },

    /**
     * Calculate trend between current and previous value
     */
    calculateTrend(current, previous) {
        if (previous === undefined || previous === null) {
            return { direction: 'neutral', value: 0, percent: 0 };
        }

        const diff = current - previous;
        const percent = previous > 0 ? Math.round((diff / previous) * 100) : (diff > 0 ? 100 : 0);

        return {
            direction: diff > 0 ? 'up' : (diff < 0 ? 'down' : 'neutral'),
            value: diff,
            percent: percent
        };
    },

    /**
     * Update trend display element
     */
    updateTrendDisplay(elementId, trend, showPercent = false) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const icon = el.querySelector('.trend-icon');
        const value = el.querySelector('.trend-value');

        if (!icon || !value) return;

        // Update classes
        el.classList.remove('trend-up', 'trend-down', 'trend-neutral');
        el.classList.add(`trend-${trend.direction}`);

        // Update icon
        const icons = { up: '↑', down: '↓', neutral: '→' };
        icon.textContent = icons[trend.direction];

        // Update value text
        if (showPercent && trend.percent !== 0) {
            value.textContent = `${trend.value >= 0 ? '+' : ''}${trend.percent}%`;
        } else {
            value.textContent = `${trend.value >= 0 ? '+' : ''}${trend.value}`;
        }

        // Show if there's a change
        if (trend.value !== 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    },

    /**
     * Switch tab
     */
    switchTab(tab) {
        this.currentTab = tab;

        // Update tab nav
        document.querySelectorAll('.tab-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });

        this.renderRequests();
    },

    /**
     * Render requests based on current tab
     */
    renderRequests() {
        const container = document.getElementById('requests-container');
        const emptyState = document.getElementById('empty-state');

        if (!container) return;

        let filtered = [];

        if (this.currentTab === 'new') {
            filtered = this.requests.filter(r => r.status === 'new');
        } else if (this.currentTab === 'offers') {
            filtered = this.requests.filter(r => r.status === 'offer_sent');
        } else if (this.currentTab === 'active') {
            filtered = this.requests.filter(r => r.status === 'accepted' || r.status === 'in_progress');
        }

        if (filtered.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        container.innerHTML = filtered.map(req => {
            const timeAgo = this.getTimeAgo(req.createdAt);
            const damageLabel = t(`damageTypes.${req.damage.type}`) || req.damage.type;
            const locationLabel = t(`locations.${req.damage.location}`) || req.damage.location;
            const isNew = req.status === 'new';
            const hasOffer = req.offer !== null;

            return `
                <div class="request-card ${isNew ? 'new' : ''}" onclick="Workshop.viewRequest('${req.id}')">
                    <div class="flex justify-between items-center mb-sm">
                        <span class="font-bold">${req.vehicle.brand} ${req.vehicle.model}</span>
                        <span class="text-secondary" style="font-size: var(--font-size-xs);">${timeAgo}</span>
                    </div>

                    <div class="flex gap-sm text-secondary" style="font-size: var(--font-size-sm);">
                        <span>${req.vehicle.plate}</span>
                        <span>•</span>
                        <span>${damageLabel}</span>
                    </div>

                    <div class="request-photos">
                        ${req.photos.slice(0, 3).map(photo => `
                            <img src="${photo}" alt="Schadensfoto" class="request-photo">
                        `).join('')}
                        ${req.photos.length > 3 ? `<div class="request-photo" style="display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); color: var(--text-secondary);">+${req.photos.length - 3}</div>` : ''}
                    </div>

                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-secondary" style="font-size: var(--font-size-sm);">📍 ${req.location.zip}</span>
                        </div>
                        ${hasOffer ? `
                            <span class="badge badge-success">${req.offer.price}€ gesendet</span>
                        ` : `
                            <span class="badge badge-primary">Neu</span>
                        `}
                    </div>

                    ${!hasOffer ? `
                        <div class="quick-actions">
                            <button class="btn btn-primary btn-sm flex-1" onclick="event.stopPropagation(); Workshop.viewRequest('${req.id}');">
                                Angebot erstellen
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); Workshop.declineRequest('${req.id}');">
                                ✕
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },

    /**
     * View request details
     */
    viewRequest(requestId) {
        this.currentRequestId = requestId;
        const req = this.requests.find(r => r.id === requestId);

        if (!req) return;

        // Update customer info
        document.getElementById('customer-info').innerHTML = `
            <h3 class="mb-md">Kunde</h3>
            <div class="flex justify-between mb-sm">
                <span class="text-secondary">Name:</span>
                <span class="font-bold">${req.customer.name}</span>
            </div>
            <div class="flex justify-between mb-sm">
                <span class="text-secondary">Telefon:</span>
                <a href="tel:${req.customer.phone}" class="text-primary">${req.customer.phone}</a>
            </div>
            <div class="flex justify-between">
                <span class="text-secondary">E-Mail:</span>
                <a href="mailto:${req.customer.email}" class="text-primary">${req.customer.email || '-'}</a>
            </div>
        `;

        // Update vehicle info
        document.getElementById('vehicle-info').innerHTML = `
            <h3 class="mb-md">Fahrzeug</h3>
            <div class="flex justify-between mb-sm">
                <span class="text-secondary">Kennzeichen:</span>
                <span class="font-bold">${req.vehicle.plate}</span>
            </div>
            <div class="flex justify-between mb-sm">
                <span class="text-secondary">Fahrzeug:</span>
                <span>${req.vehicle.brand} ${req.vehicle.model}</span>
            </div>
            <div class="flex justify-between mb-sm">
                <span class="text-secondary">Baujahr:</span>
                <span>${req.vehicle.year || '-'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-secondary">Farbe:</span>
                <span>${req.vehicle.color || '-'}</span>
            </div>
        `;

        // Update photos
        document.getElementById('damage-photos').innerHTML = req.photos.map(photo => `
            <div class="photo-item">
                <img src="${photo}" alt="Schadensfoto" onclick="Workshop.showPhotoFullscreen('${photo}')">
            </div>
        `).join('');

        // Update damage info
        const damageLabel = t(`damageTypes.${req.damage.type}`) || req.damage.type;
        const locationLabel = t(`locations.${req.damage.location}`) || req.damage.location;

        document.getElementById('damage-info').innerHTML = `
            <h3 class="mb-md">Schaden</h3>
            <div class="flex justify-between mb-sm">
                <span class="text-secondary">Art:</span>
                <span class="font-bold">${damageLabel}</span>
            </div>
            <div class="flex justify-between mb-sm">
                <span class="text-secondary">Position:</span>
                <span>${locationLabel}</span>
            </div>
            ${req.damage.description ? `
                <div class="mt-md">
                    <span class="text-secondary">Beschreibung:</span>
                    <p class="mt-sm">${req.damage.description}</p>
                </div>
            ` : ''}
        `;

        // Show/hide offer form
        const offerForm = document.getElementById('offer-form');
        const offerSent = document.getElementById('offer-sent');

        if (req.offer) {
            offerForm.classList.add('hidden');
            offerSent.classList.remove('hidden');
            document.getElementById('offer-sent-details').textContent = `${req.offer.price}€ • ${req.offer.duration} Tag(e)`;
        } else {
            offerForm.classList.remove('hidden');
            offerSent.classList.add('hidden');

            // Clear form
            document.getElementById('offer-price').value = '';
            document.getElementById('offer-duration').value = '';
            document.getElementById('offer-note').value = '';
        }

        this.navigateTo('request-detail');
    },

    /**
     * Send offer
     */
    async sendOffer() {
        const price = parseInt(document.getElementById('offer-price').value);
        const duration = parseInt(document.getElementById('offer-duration').value);
        const note = document.getElementById('offer-note').value.trim();

        // Validate inputs with visual feedback
        let hasErrors = false;

        if (!price || price <= 0) {
            this.validateInput('offer-price', v => v && parseInt(v) > 0, 'Bitte gültigen Preis eingeben (mind. 1€)');
            hasErrors = true;
        }

        if (!duration || duration <= 0) {
            this.validateInput('offer-duration', v => v && parseInt(v) > 0, 'Bitte gültige Dauer eingeben (mind. 1 Tag)');
            hasErrors = true;
        }

        if (hasErrors) return;

        // Check subscription before sending offer
        if (typeof SubscriptionManager !== 'undefined') {
            const canMakeOffer = await SubscriptionManager.canMakeOffer(this.workshopId);
            if (!canMakeOffer) {
                // Show paywall
                SubscriptionManager.showPaywall('Workshop.showSubscription');
                return;
            }

            // Check remaining requests
            const remaining = await SubscriptionManager.getRemainingRequests(this.workshopId);
            if (remaining !== -1 && remaining <= 3) {
                this.showToast(`Nur noch ${remaining} Anfragen in diesem Monat übrig!`, 'warning');
            }
        }

        // Show loading
        this.showLoading('Angebot wird gesendet...', 'Bitte warten');

        // Send offer via WorkshopRequests (Firestore)
        if (typeof WorkshopRequests !== 'undefined') {
            try {
                await WorkshopRequests.sendOffer(this.currentRequestId, {
                    price,
                    duration,
                    note
                });
            } catch (error) {
                console.error('[Workshop] Send offer error:', error);
                this.hideLoading();
                this.showToast('Fehler beim Senden des Angebots', 'error');
                return;
            }
        }

        // Update local cache
        const req = this.requests.find(r => r.id === this.currentRequestId);
        if (req) {
            req.offer = {
                price,
                duration,
                note,
                sentAt: new Date().toISOString()
            };
            req.status = 'offer_sent';
            this.saveRequests();
        }

        // Increment request counter for subscription
        if (typeof SubscriptionManager !== 'undefined') {
            await SubscriptionManager.incrementRequestCount(this.workshopId);
        }

        // Hide loading and show success
        this.hideLoading();
        this.showSuccess('Angebot gesendet!');

        // Update UI after animation
        setTimeout(() => {
            document.getElementById('offer-form').classList.add('hidden');
            document.getElementById('offer-sent').classList.remove('hidden');
            document.getElementById('offer-sent-details').textContent = `${price}€ • ${duration} Tag(e)`;
        }, 1200);

        this.updateStats();
    },

    /**
     * Decline request
     */
    declineRequest(requestId) {
        this.showModal({
            icon: '🗑️',
            title: 'Anfrage ablehnen?',
            text: 'Diese Anfrage wird aus Ihrer Liste entfernt. Sie können kein Angebot mehr abgeben.',
            confirmText: 'Ablehnen',
            cancelText: 'Behalten',
            danger: true,
            onConfirm: () => {
                this.requests = this.requests.filter(r => r.id !== requestId);
                this.saveRequests();
                this.updateStats();
                this.renderRequests();
                this.showToast('Anfrage abgelehnt', 'info');
            }
        });
    },

    /**
     * Initialize chat input
     */
    initChatInput() {
        const input = document.getElementById('ws-chat-input');
        const sendBtn = document.getElementById('ws-chat-send-btn');

        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';

                if (sendBtn) {
                    sendBtn.disabled = input.value.trim() === '';
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.value.trim()) {
                        this.sendMessage();
                    }
                }
            });
        }
    },

    /**
     * Render chat list
     */
    renderChatList() {
        const container = document.getElementById('chats-list');
        const emptyState = document.getElementById('chats-empty');

        if (!container) return;

        // Get requests with offers (potential chats)
        const chats = this.requests.filter(r => r.offer !== null);

        if (chats.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        container.innerHTML = chats.map(req => {
            const lastMessage = this.getLastMessage(req.id);
            const timeAgo = lastMessage ? this.getTimeAgo(lastMessage.timestamp) : this.getTimeAgo(req.offer.sentAt);

            return `
                <div class="list-item" onclick="Workshop.openChatForRequest('${req.id}')">
                    <div class="list-item-icon" style="background: var(--primary-light);">
                        🚗
                    </div>
                    <div class="list-item-content">
                        <div class="list-item-title">${req.customer.name}</div>
                        <div class="list-item-subtitle">${req.vehicle.brand} ${req.vehicle.model} • ${lastMessage ? lastMessage.text.substring(0, 30) + '...' : 'Angebot gesendet'}</div>
                    </div>
                    <div class="list-item-right">
                        <span style="font-size: var(--font-size-xs);">${timeAgo}</span>
                        <span class="list-item-chevron">›</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Open chat for request
     */
    openChatForRequest(requestId) {
        this.currentRequestId = requestId;
        const req = this.requests.find(r => r.id === requestId);

        if (!req) return;

        document.getElementById('ws-chat-customer-name').textContent = req.customer.name;
        document.getElementById('ws-chat-vehicle').textContent = `${req.vehicle.brand} ${req.vehicle.model} • ${req.vehicle.plate}`;

        this.loadWorkshopChat();
        this.navigateTo('workshop-chat');
    },

    /**
     * Open chat from request detail
     */
    openChat() {
        const req = this.requests.find(r => r.id === this.currentRequestId);
        if (req) {
            this.openChatForRequest(req.id);
        }
    },

    /**
     * Load workshop chat messages
     */
    loadWorkshopChat() {
        const container = document.getElementById('ws-chat-messages');
        if (!container) return;

        // Use Firestore subscription if available
        if (typeof WorkshopRequests !== 'undefined' && WorkshopRequests.isFirestoreAvailable()) {
            // Unsubscribe from previous chat subscription
            if (this.chatUnsubscribe) {
                this.chatUnsubscribe();
            }

            this.chatUnsubscribe = WorkshopRequests.subscribeToMessages(this.currentRequestId, (messages) => {
                this.renderChatMessages(container, messages);
            });
        } else {
            // Fallback to localStorage
            const chatKey = `schadens-chat-ws-messages-${this.currentRequestId}`;
            let messages = JSON.parse(localStorage.getItem(chatKey) || '[]');

            // Add welcome message if empty
            if (messages.length === 0) {
                const req = this.requests.find(r => r.id === this.currentRequestId);
                if (req && req.offer) {
                    messages.push({
                        id: 'msg_offer',
                        type: 'sent',
                        text: `Angebot: ${req.offer.price}€, ${req.offer.duration} Tag(e)${req.offer.note ? '\n' + req.offer.note : ''}`,
                        timestamp: req.offer.sentAt
                    });
                    localStorage.setItem(chatKey, JSON.stringify(messages));
                }
            }

            this.renderChatMessages(container, messages);
        }
    },

    /**
     * Format date for chat separator
     */
    formatChatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return 'Heute';
        if (isYesterday) return 'Gestern';

        return date.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    },

    /**
     * Render chat messages to container with date separators
     */
    renderChatMessages(container, messages) {
        let lastDate = null;
        let html = '';

        messages.forEach(msg => {
            const msgDate = new Date(msg.timestamp).toDateString();
            const time = new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            // Add date separator if date changed
            if (msgDate !== lastDate) {
                html += `
                    <div class="chat-date-separator">
                        <span>${this.formatChatDate(msg.timestamp)}</span>
                    </div>
                `;
                lastDate = msgDate;
            }

            html += `
                <div class="chat-message ${msg.type}">
                    <div class="chat-message-content">${this.escapeHtml(msg.text)}</div>
                    <div class="chat-message-time">
                        ${time}
                        ${msg.type === 'sent' ? '<span class="chat-message-status">✓✓</span>' : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Smooth scroll to bottom
        this.scrollChatToBottom(container);
    },

    /**
     * Smooth scroll chat to bottom
     */
    scrollChatToBottom(container, smooth = true) {
        if (!container) container = document.getElementById('ws-chat-messages');
        if (!container) return;

        if (smooth) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            container.scrollTop = container.scrollHeight;
        }
    },

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const container = document.getElementById('ws-chat-messages');
        if (!container) return;

        // Remove existing indicator
        this.hideTypingIndicator();

        const indicator = document.createElement('div');
        indicator.className = 'chat-typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;

        container.appendChild(indicator);
        this.scrollChatToBottom(container);
    },

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    },

    /**
     * Send message in workshop chat
     */
    async sendMessage() {
        const input = document.getElementById('ws-chat-input');
        const text = input?.value.trim();

        if (!text) return;

        // Clear input immediately
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('ws-chat-send-btn').disabled = true;

        // Send via Firestore if available
        if (typeof WorkshopRequests !== 'undefined' && WorkshopRequests.isFirestoreAvailable()) {
            try {
                await WorkshopRequests.sendMessage(this.currentRequestId, text);
                // Messages will auto-update via subscription
            } catch (error) {
                console.error('[Workshop] Send message error:', error);
                this.showToast('Nachricht konnte nicht gesendet werden', 'error');
            }
        } else {
            // Fallback to localStorage
            const chatKey = `schadens-chat-ws-messages-${this.currentRequestId}`;
            const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');

            messages.push({
                id: 'msg_' + Date.now(),
                type: 'sent',
                text: text,
                timestamp: new Date().toISOString()
            });

            localStorage.setItem(chatKey, JSON.stringify(messages));
            this.loadWorkshopChat();
        }
    },

    /**
     * Get last message for a request
     */
    getLastMessage(requestId) {
        const chatKey = `schadens-chat-ws-messages-${requestId}`;
        const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        return messages.length > 0 ? messages[messages.length - 1] : null;
    },

    /**
     * Show request from chat
     */
    showRequestFromChat() {
        this.viewRequest(this.currentRequestId);
    },

    /**
     * Show photo in fullscreen
     */
    showPhotoFullscreen(photoUrl) {
        // Simple fullscreen view
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
        `;
        overlay.onclick = () => overlay.remove();

        const img = document.createElement('img');
        img.src = photoUrl;
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
        `;

        overlay.appendChild(img);
        document.body.appendChild(overlay);
    },

    /**
     * Show settings
     */
    showSettings() {
        this.navigateTo('settings');
        this.loadSubscriptionStatus();
    },

    /**
     * Show subscription page
     */
    showSubscription() {
        this.navigateTo('subscription');
    },

    /**
     * Load subscription status for settings page
     */
    async loadSubscriptionStatus() {
        if (typeof SubscriptionManager === 'undefined') return;

        const container = document.getElementById('subscription-status-container');
        if (!container) return;

        const subscription = await SubscriptionManager.getSubscription(this.workshopId);
        this.subscription = subscription;

        if (subscription) {
            SubscriptionManager.renderSubscriptionStatus('subscription-status-container', subscription);
        } else {
            // No subscription - show CTA
            container.innerHTML = `
                <div class="text-center">
                    <p class="text-secondary mb-md">Kein aktives Abonnement</p>
                    <button class="btn btn-primary" onclick="Workshop.showSubscription()">
                        Jetzt Abo abschließen
                    </button>
                </div>
            `;
        }
    },

    /**
     * Load subscription/pricing page
     */
    loadSubscriptionPage() {
        if (typeof SubscriptionManager === 'undefined') return;

        SubscriptionManager.renderPricingCards('pricing-cards-container', 'Workshop.selectPlan');
    },

    /**
     * Select a subscription plan
     */
    async selectPlan(planId) {
        const plan = SubscriptionManager.plans[planId];
        if (!plan) return;

        // Confirm selection
        const confirmed = confirm(
            `${plan.name} Plan für €${plan.price}/Monat auswählen?\n\n` +
            `Sie starten mit einer 14-tägigen kostenlosen Testphase.`
        );

        if (!confirmed) return;

        try {
            // Start trial first
            if (!this.subscription) {
                await SubscriptionManager.startTrial(this.workshopId, {
                    workshopName: this.workshopName,
                    selectedPlan: planId
                });
                this.showToast('14-Tage Trial gestartet!', 'success');
            } else {
                // Upgrade/Change plan
                await SubscriptionManager.activateSubscription(this.workshopId, planId);
                this.showToast(`${plan.name} Plan aktiviert!`, 'success');
            }

            // Reload subscription status
            this.subscription = await SubscriptionManager.getSubscription(this.workshopId);

            // Go back to settings
            this.navigateTo('settings');
            this.loadSubscriptionStatus();

        } catch (error) {
            console.error('[Workshop] Subscription error:', error);
            this.showToast('Fehler beim Abschließen des Abos', 'error');
        }
    },

    /**
     * Get time ago string
     */
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Jetzt';
        if (minutes < 60) return `${minutes} Min`;
        if (hours < 24) return `${hours} Std`;
        if (days < 7) return `${days} Tag${days > 1 ? 'e' : ''}`;

        return date.toLocaleDateString('de-DE');
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    /**
     * Escape HTML for XSS prevention
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Workshop.init());
} else {
    Workshop.init();
}

// Export for global access
window.Workshop = Workshop;
