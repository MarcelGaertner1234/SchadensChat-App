/**
 * SchadensChat - Main Application
 * Mobile-First PWA für Fahrzeugschaden-Anfragen
 */

const App = {
    // State
    currentPage: 'home',
    photos: [],
    request: {
        damageType: null,
        damageLocation: null,
        description: '',
        vehicle: {
            plate: '',
            brand: '',
            model: '',
            year: '',
            color: ''
        },
        location: {
            lat: null,
            lng: null,
            address: '',
            zip: '',
            radius: 25
        },
        contact: {
            name: '',
            phone: '',
            email: ''
        }
    },
    currentRequestId: null,
    currentOfferId: null,

    /**
     * Initialize the App
     */
    async init() {
        console.log('[App] Initializing SchadensChat...');

        // Initialize UI components
        this.initLanguageSelector();
        this.initDamageTypes();
        this.initLocationSelect();
        this.initPhotoHandlers();
        this.initRadiusSlider();
        this.initChatInput();
        this.initTheme();

        // Initialize Auth
        await this.initAuth();

        // Load saved requests from localStorage
        this.loadSavedRequests();

        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.initDamageTypes();
            this.initLocationSelect();
            I18N.translatePage();
        });

        console.log('[App] Initialized successfully');
    },

    /**
     * Initialize Authentication
     */
    async initAuth() {
        // Wait for Auth module
        if (typeof Auth !== 'undefined') {
            await Auth.init();

            // Listen for auth state changes
            Auth.onAuthStateChanged(async (user, userType) => {
                this.updateAuthUI(user, userType);

                // Sync local requests to Firestore after login
                if (user && typeof RequestManager !== 'undefined') {
                    await RequestManager.init();
                    await RequestManager.syncLocalRequestsToFirestore();
                }
            });
        }
    },

    /**
     * Update UI based on auth state
     */
    updateAuthUI(user, userType) {
        const loginBtn = document.getElementById('nav-login-btn');
        const profileBtn = document.getElementById('nav-profile-btn');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userPhone = document.getElementById('user-phone');

        if (user) {
            // User is logged in
            if (loginBtn) loginBtn.classList.add('hidden');
            if (profileBtn) profileBtn.classList.remove('hidden');

            // Update profile page
            if (userAvatar) {
                userAvatar.innerHTML = '<svg class="icon icon-lg"><use href="#icon-user"></use></svg>';
            }
            if (userName) {
                userName.textContent = user.displayName || 'Kunde';
            }
            if (userPhone) {
                userPhone.textContent = user.phoneNumber || user.email || '';
            }
        } else {
            // User is logged out
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (profileBtn) profileBtn.classList.add('hidden');
        }
    },

    // ========== AUTH METHODS ==========

    /**
     * Send SMS verification code
     */
    async sendVerificationCode() {
        const phoneInput = document.getElementById('login-phone');
        const phone = phoneInput?.value.trim();

        if (!phone) {
            this.showToast('Bitte Telefonnummer eingeben', 'warning');
            return;
        }

        const btn = document.getElementById('send-code-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;"></span>';
        }

        try {
            await Auth.sendVerificationCode(phone);

            // Show code input step
            document.getElementById('login-step-phone')?.classList.add('hidden');
            document.getElementById('login-step-code')?.classList.remove('hidden');

            this.showToast('SMS-Code wurde gesendet!', 'success');

        } catch (error) {
            console.error('[App] SMS error:', error);
            this.showToast(error.message || 'Fehler beim SMS-Versand', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<svg class="icon icon-md"><use href="#icon-smartphone"></use></svg> <span>Code senden</span>';
            }
        }
    },

    /**
     * Verify SMS code
     */
    async verifyCode() {
        const codeInput = document.getElementById('login-code');
        const code = codeInput?.value.trim();

        if (!code || code.length !== 6) {
            this.showToast('Bitte 6-stelligen Code eingeben', 'warning');
            return;
        }

        const btn = document.querySelector('#login-step-code button');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;"></span>';
        }

        try {
            await Auth.verifyCode(code);

            this.showToast('Erfolgreich angemeldet!', 'success');

            // Navigate to home
            this.navigateTo('home');

            // Reset login form
            this.resetLoginForm();

        } catch (error) {
            console.error('[App] Code verification error:', error);
            this.showToast(error.message || 'Ungültiger Code', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<svg class="icon icon-sm"><use href="#icon-check"></use></svg> <span>Bestätigen</span>';
            }
        }
    },

    /**
     * Reset login form
     */
    resetLoginForm() {
        const phoneInput = document.getElementById('login-phone');
        const codeInput = document.getElementById('login-code');
        if (phoneInput) phoneInput.value = '';
        if (codeInput) codeInput.value = '';
        document.getElementById('login-step-phone')?.classList.remove('hidden');
        document.getElementById('login-step-code')?.classList.add('hidden');
    },

    /**
     * Logout
     */
    async logout() {
        try {
            await Auth.signOut();
            this.showToast('Erfolgreich abgemeldet', 'success');
            this.navigateTo('home');
        } catch (error) {
            console.error('[App] Logout error:', error);
            this.showToast('Fehler beim Abmelden', 'error');
        }
    },

    /**
     * Initialize language selector
     */
    initLanguageSelector() {
        const container = document.getElementById('language-selector');
        if (!container) return;

        const languages = I18N.getAvailableLanguages();
        container.innerHTML = languages.map(lang => `
            <div class="language-option ${lang.code === I18N.currentLang ? 'active' : ''}"
                 onclick="App.setLanguage('${lang.code}')">
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
     * Initialize damage type buttons
     */
    initDamageTypes() {
        const container = document.getElementById('damage-types');
        if (!container) return;

        const types = [
            { id: 'dent', icon: '' },
            { id: 'scratch', icon: '' },
            { id: 'paint', icon: '' },
            { id: 'crack', icon: '' },
            { id: 'rust', icon: '' },
            { id: 'other', icon: '' }
        ];

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm);">
                ${types.map(type => `
                    <button class="btn btn-secondary damage-type-btn ${this.request.damageType === type.id ? 'active' : ''}"
                            data-type="${type.id}"
                            onclick="App.selectDamageType('${type.id}')"
                            style="flex-direction: column; padding: var(--space-md);">
                        <span style="font-size: 24px;">${type.icon}</span>
                        <span style="font-size: var(--font-size-xs);">${t('damageTypes.' + type.id)}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Add active style
        const style = document.getElementById('damage-type-style') || document.createElement('style');
        style.id = 'damage-type-style';
        style.textContent = `
            .damage-type-btn.active {
                background: var(--primary) !important;
                color: white !important;
                border-color: var(--primary) !important;
            }
        `;
        if (!document.getElementById('damage-type-style')) {
            document.head.appendChild(style);
        }
    },

    /**
     * Select damage type
     */
    selectDamageType(type) {
        this.request.damageType = type;
        document.querySelectorAll('.damage-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
    },

    /**
     * Initialize location select
     */
    initLocationSelect() {
        const select = document.getElementById('damage-location');
        if (!select) return;

        const locations = [
            'frontBumper', 'rearBumper', 'hoodBonnet', 'roof',
            'doorLeft', 'doorRight', 'fenderFrontLeft', 'fenderFrontRight',
            'fenderRearLeft', 'fenderRearRight', 'trunk', 'mirror', 'other'
        ];

        select.innerHTML = `
            <option value="">-- ${t('damageLocation')} --</option>
            ${locations.map(loc => `
                <option value="${loc}">${t('locations.' + loc)}</option>
            `).join('')}
        `;
    },

    /**
     * Initialize photo handlers
     */
    initPhotoHandlers() {
        const photoInput = document.getElementById('photo-input');
        const galleryInput = document.getElementById('gallery-input');

        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handlePhotos(e.target.files));
        }
        if (galleryInput) {
            galleryInput.addEventListener('change', (e) => this.handlePhotos(e.target.files));
        }
    },

    /**
     * Capture photo from camera
     */
    capturePhoto() {
        const input = document.getElementById('photo-input');
        if (input) input.click();
    },

    /**
     * Open gallery
     */
    openGallery() {
        const input = document.getElementById('gallery-input');
        if (input) input.click();
    },

    /**
     * Handle selected photos
     */
    handlePhotos(files) {
        if (!files || files.length === 0) return;

        const maxPhotos = 5;
        const remainingSlots = maxPhotos - this.photos.length;

        if (remainingSlots <= 0) {
            this.showToast(t('maxPhotos'), 'warning');
            return;
        }

        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.photos.push({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    data: e.target.result,
                    file: file
                });
                this.updatePhotoGrid();
            };
            reader.readAsDataURL(file);
        });
    },

    /**
     * Update photo grid display
     */
    updatePhotoGrid() {
        const grid = document.getElementById('photo-grid');
        const counter = document.getElementById('photo-counter');
        const nextBtn = document.getElementById('photo-next-btn');

        if (!grid) return;

        // Build grid HTML
        let html = this.photos.map(photo => `
            <div class="photo-item" data-id="${photo.id}">
                <img src="${photo.data}" alt="Schadensfoto">
                <button class="photo-item-remove" onclick="App.removePhoto('${photo.id}')">×</button>
            </div>
        `).join('');

        // Add "add photo" button if under limit
        if (this.photos.length < 5) {
            html += `
                <div class="photo-item photo-add" onclick="App.capturePhoto()">
                    <svg class="icon icon-xl photo-add-icon"><use href="#icon-camera"></use></svg>
                    <span class="photo-add-text">+</span>
                </div>
            `;
        }

        grid.innerHTML = html;

        // Update counter
        if (counter) {
            if (this.photos.length > 0) {
                counter.style.display = 'block';
                counter.innerHTML = t('photosSelected', { count: this.photos.length });
            } else {
                counter.style.display = 'none';
            }
        }

        // Enable/disable next button
        if (nextBtn) {
            nextBtn.disabled = this.photos.length === 0;
        }
    },

    /**
     * Remove photo
     */
    removePhoto(id) {
        this.photos = this.photos.filter(p => p.id !== id);
        this.updatePhotoGrid();
    },

    /**
     * Initialize radius slider
     */
    initRadiusSlider() {
        const slider = document.getElementById('search-radius');
        const display = document.getElementById('radius-value');

        if (slider && display) {
            slider.addEventListener('input', () => {
                const value = slider.value;
                display.textContent = `${value} km`;
                this.request.location.radius = parseInt(value);
            });
        }
    },

    /**
     * Request user location
     */
    requestLocation() {
        const btn = document.getElementById('gps-btn');
        const display = document.getElementById('location-display');
        const nextBtn = document.getElementById('location-next-btn');

        if (!navigator.geolocation) {
            this.showToast(t('errorLocation'), 'error');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="width: 20px; height: 20px;"></span> <span>${t('loading')}</span>`;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                this.request.location.lat = position.coords.latitude;
                this.request.location.lng = position.coords.longitude;

                // Try to get address (reverse geocoding - simplified for demo)
                this.request.location.address = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;

                // Update display
                if (display) {
                    display.classList.remove('hidden');
                    const addressEl = document.getElementById('location-address');
                    const coordsEl = document.getElementById('location-coords');
                    if (addressEl) addressEl.textContent = 'Standort ermittelt';
                    if (coordsEl) coordsEl.textContent = this.request.location.address;
                }

                btn.disabled = false;
                btn.innerHTML = `<svg class="icon icon-sm"><use href="#icon-check-circle"></use></svg> <span>Standort gespeichert</span>`;

                if (nextBtn) nextBtn.disabled = false;
            },
            (error) => {
                console.error('[App] Geolocation error:', error);
                this.showToast(t('errorLocation'), 'error');
                btn.disabled = false;
                btn.innerHTML = `<span>📍</span> <span>${t('useGPS')}</span>`;
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    },

    /**
     * Initialize chat input auto-resize
     */
    initChatInput() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');

        if (input) {
            input.addEventListener('input', () => {
                // Auto-resize
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';

                // Enable/disable send button
                if (sendBtn) {
                    sendBtn.disabled = input.value.trim() === '';
                }
            });

            // Send on Enter (without Shift)
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
     * Initialize theme
     */
    initTheme() {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('schadens-chat-theme');

        if (!savedTheme) {
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }

        // Listen for system changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('schadens-chat-theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
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

        console.log(`[App] Theme switched to: ${newTheme}`);
    },

    /**
     * Page history for back navigation
     */
    pageHistory: ['home'],

    /**
     * Navigate to page with smooth transitions
     */
    navigateTo(pageName, options = {}) {
        const { isBack = false, skipAnimation = false } = options;

        // Save form data before navigation
        this.saveFormData();

        const currentPageEl = document.getElementById(`page-${this.currentPage}`);
        const targetPage = document.getElementById(`page-${pageName}`);

        if (!targetPage) return;

        // Determine animation direction
        const exitClass = isBack ? 'page-back-exit' : 'page-exit';
        const enterClass = isBack ? 'page-back-enter' : 'page-enter';

        if (skipAnimation || !currentPageEl) {
            // Instant navigation
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
                page.classList.remove('page-enter', 'page-exit', 'page-back-enter', 'page-back-exit');
            });
            targetPage.classList.remove('hidden');
        } else {
            // Animated navigation
            currentPageEl.classList.add(exitClass);

            setTimeout(() => {
                document.querySelectorAll('.page').forEach(page => {
                    page.classList.add('hidden');
                    page.classList.remove('page-enter', 'page-exit', 'page-back-enter', 'page-back-exit');
                });

                targetPage.classList.remove('hidden');
                targetPage.classList.add(enterClass);

                // Remove animation class after completion
                setTimeout(() => {
                    targetPage.classList.remove(enterClass);
                }, 400);
            }, 250);
        }

        // Update history
        if (!isBack) {
            this.pageHistory.push(pageName);
        }
        this.currentPage = pageName;

        // Page-specific initialization
        if (pageName === 'contact') {
            this.updateSummary();
        } else if (pageName === 'requests') {
            this.renderRequests();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Haptic feedback (if supported)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    },

    /**
     * Go back in navigation history
     */
    goBack() {
        if (this.pageHistory.length > 1) {
            this.pageHistory.pop(); // Remove current page
            const previousPage = this.pageHistory[this.pageHistory.length - 1];
            this.navigateTo(previousPage, { isBack: true });
        }
    },

    /**
     * Save form data from current page
     */
    saveFormData() {
        // Damage description page
        const damageLocation = document.getElementById('damage-location');
        const damageDescription = document.getElementById('damage-description');
        const vehiclePlate = document.getElementById('vehicle-plate');
        const vehicleBrand = document.getElementById('vehicle-brand');
        const vehicleModel = document.getElementById('vehicle-model');
        const vehicleYear = document.getElementById('vehicle-year');
        const vehicleColor = document.getElementById('vehicle-color');

        if (damageLocation) this.request.damageLocation = damageLocation.value;
        if (damageDescription) this.request.description = damageDescription.value;
        if (vehiclePlate) this.request.vehicle.plate = vehiclePlate.value.toUpperCase();
        if (vehicleBrand) this.request.vehicle.brand = vehicleBrand.value;
        if (vehicleModel) this.request.vehicle.model = vehicleModel.value;
        if (vehicleYear) this.request.vehicle.year = vehicleYear.value;
        if (vehicleColor) this.request.vehicle.color = vehicleColor.value;

        // Location page
        const zipCode = document.getElementById('zip-code');
        if (zipCode) this.request.location.zip = zipCode.value;

        // Contact page
        const contactName = document.getElementById('contact-name');
        const contactPhone = document.getElementById('contact-phone');
        const contactEmail = document.getElementById('contact-email');

        if (contactName) this.request.contact.name = contactName.value;
        if (contactPhone) this.request.contact.phone = contactPhone.value;
        if (contactEmail) this.request.contact.email = contactEmail.value;
    },

    /**
     * Update summary on contact page
     */
    updateSummary() {
        const container = document.getElementById('summary-content');
        if (!container) return;

        container.innerHTML = `
            <div class="flex justify-between mb-md">
                <span class="text-secondary">Fotos:</span>
                <span>${this.photos.length}</span>
            </div>
            <div class="flex justify-between mb-md">
                <span class="text-secondary">Schadensart:</span>
                <span>${this.request.damageType ? t('damageTypes.' + this.request.damageType) : '-'}</span>
            </div>
            <div class="flex justify-between mb-md">
                <span class="text-secondary">Position:</span>
                <span>${this.request.damageLocation ? t('locations.' + this.request.damageLocation) : '-'}</span>
            </div>
            <div class="flex justify-between mb-md">
                <span class="text-secondary">Fahrzeug:</span>
                <span>${this.request.vehicle.brand || '-'} ${this.request.vehicle.model || ''}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-secondary">Kennzeichen:</span>
                <span>${this.request.vehicle.plate || '-'}</span>
            </div>
        `;
    },

    /**
     * Submit request
     */
    async submitRequest() {
        // Save form data first
        this.saveFormData();

        // Validate
        if (this.photos.length === 0) {
            this.showToast(t('minPhotos'), 'error');
            return;
        }

        if (!this.request.contact.name || !this.request.contact.phone) {
            this.showToast(t('required'), 'error');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');

        // Double-click protection: disable immediately BEFORE any async work
        if (submitBtn) submitBtn.disabled = true;

        // Show loading
        this.showLoading(true);

        try {
            // Use RequestManager to create request with Firestore
            if (typeof RequestManager !== 'undefined') {
                await RequestManager.init();
                const newRequest = await RequestManager.createRequest(this.request, this.photos);
                console.log('[App] Request created:', newRequest.id);
            } else {
                // Fallback: Save to localStorage with error handling
                const newRequest = {
                    id: 'req_' + Date.now(),
                    createdAt: new Date().toISOString(),
                    status: 'new',
                    photos: this.photos.map(p => p.data),
                    damageType: this.request.damageType,
                    damageLocation: this.request.damageLocation,
                    description: this.request.description,
                    vehicle: { ...this.request.vehicle },
                    location: { ...this.request.location },
                    contact: { ...this.request.contact },
                    offers: []
                };

                try {
                    const requests = JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
                    requests.unshift(newRequest);
                    localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
                } catch (e) {
                    console.error('[App] Failed to save request to localStorage:', e);
                    throw e;
                }
            }

            // Reset form
            this.resetForm();

            // Navigate to success (keep button disabled - user is leaving page)
            this.showLoading(false);
            this.navigateTo('success');

        } catch (error) {
            console.error('[App] Submit error:', error);
            this.showToast(t('errorGeneric'), 'error');
            this.showLoading(false);
            // Only re-enable button on error
            if (submitBtn) submitBtn.disabled = false;
        }
    },

    /**
     * Reset form
     */
    resetForm() {
        this.photos = [];
        this.request = {
            damageType: null,
            damageLocation: null,
            description: '',
            vehicle: { plate: '', brand: '', model: '', year: '', color: '' },
            location: { lat: null, lng: null, address: '', zip: '', radius: 25 },
            contact: { name: '', phone: '', email: '' }
        };

        // Reset form fields
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type !== 'range') {
                el.value = '';
            }
        });

        // Reset damage type buttons
        document.querySelectorAll('.damage-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Reset photo grid
        this.updatePhotoGrid();
    },

    /**
     * Load saved requests (from Firestore or localStorage)
     */
    async loadSavedRequests() {
        if (typeof RequestManager !== 'undefined') {
            try {
                await RequestManager.init();
                this.savedRequests = await RequestManager.getMyRequests();
            } catch (e) {
                console.error('[App] Failed to load requests:', e);
                this.savedRequests = [];
            }
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('schadens-chat-requests');
            if (saved) {
                try {
                    this.savedRequests = JSON.parse(saved);
                } catch (e) {
                    this.savedRequests = [];
                }
            } else {
                this.savedRequests = [];
            }
        }
    },

    /**
     * Render requests list
     */
    async renderRequests() {
        await this.loadSavedRequests();

        const container = document.getElementById('requests-list');
        const emptyState = document.getElementById('requests-empty');

        if (!container) return;

        if (this.savedRequests.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        container.innerHTML = this.savedRequests.map(req => {
            const statusBadge = this.getStatusBadge(req.status);
            const createdAt = req.createdAt instanceof Date ? req.createdAt : new Date(req.createdAt);
            const date = createdAt.toLocaleDateString('de-DE');

            return `
                <div class="card mb-md" onclick="App.viewRequest('${req.id}')" style="cursor: pointer;">
                    <div class="flex gap-md">
                        <div style="width: 60px; height: 60px; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;">
                            <img src="${req.photos && req.photos[0] ? req.photos[0] : 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%231e3a5f%22 width=%2260%22 height=%2260%22/><path d=%22M27 20h6l3 4h6v16H18V24h6l3-4z%22 stroke=%22white%22 fill=%22none%22 stroke-width=%222%22/><circle cx=%2230%22 cy=%2232%22 r=%224%22 stroke=%22white%22 fill=%22none%22 stroke-width=%222%22/></svg>'}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-sm">
                                <span class="font-bold">${req.vehicle.brand || 'Fahrzeug'} ${req.vehicle.model || ''}</span>
                                ${statusBadge}
                            </div>
                            <p class="text-secondary" style="font-size: var(--font-size-sm);">
                                ${req.damageType ? t('damageTypes.' + req.damageType) : '-'} • ${date}
                            </p>
                            <p class="text-secondary" style="font-size: var(--font-size-sm);">
                                ${req.offers.length > 0 ? t('offerReceived', { count: req.offers.length }) : t('waitingForOffers')}
                            </p>
                        </div>
                        <span style="color: var(--text-tertiary);">›</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            new: { class: 'badge', text: 'status.new' },
            pending: { class: 'badge badge-warning', text: 'status.pending' },
            offers: { class: 'badge badge-primary', text: 'status.offers' },
            accepted: { class: 'badge badge-success', text: 'status.accepted' },
            inProgress: { class: 'badge badge-primary', text: 'status.inProgress' },
            completed: { class: 'badge badge-success', text: 'status.completed' },
            cancelled: { class: 'badge badge-danger', text: 'status.cancelled' }
        };

        const badge = badges[status] || badges.pending;
        return `<span class="${badge.class}">${t(badge.text)}</span>`;
    },

    /**
     * View request details
     */
    viewRequest(requestId) {
        this.currentRequestId = requestId;
        const request = this.savedRequests.find(r => r.id === requestId);

        if (!request) return;

        // Update offers page
        const infoContainer = document.getElementById('offer-request-info');
        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="flex gap-md">
                    <div style="width: 80px; height: 80px; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;">
                        <img src="${request.photos && request.photos[0] ? request.photos[0] : 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><rect fill=%22%231e3a5f%22 width=%2280%22 height=%2280%22/><path d=%22M35 25h10l4 5h10v22H21V30h10l4-5z%22 stroke=%22white%22 fill=%22none%22 stroke-width=%222%22/><circle cx=%2240%22 cy=%2242%22 r=%226%22 stroke=%22white%22 fill=%22none%22 stroke-width=%222%22/></svg>'}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div>
                        <h3>${request.vehicle.brand || 'Fahrzeug'} ${request.vehicle.model || ''}</h3>
                        <p class="text-secondary">${request.vehicle.plate || ''}</p>
                        <p class="text-secondary">${request.damageType ? t('damageTypes.' + request.damageType) : ''}</p>
                    </div>
                </div>
            `;
        }

        // Render offers
        this.renderOffers(request);

        this.navigateTo('offers');
    },

    /**
     * Render offers for a request
     */
    renderOffers(request) {
        const container = document.getElementById('offers-list');
        const waiting = document.getElementById('offers-waiting');

        if (!container) return;

        // For demo: generate some fake offers
        if (request.offers.length === 0 && Math.random() > 0.5) {
            request.offers = this.generateDemoOffers();
            // Update localStorage with error handling
            try {
                const requests = JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
                const idx = requests.findIndex(r => r.id === request.id);
                if (idx >= 0) {
                    requests[idx] = request;
                    localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
                }
            } catch (e) {
                console.error('[App] Failed to update offers in localStorage:', e);
            }
        }

        if (request.offers.length === 0) {
            container.innerHTML = '';
            if (waiting) waiting.classList.remove('hidden');
            return;
        }

        if (waiting) waiting.classList.add('hidden');

        container.innerHTML = request.offers.map(offer => `
            <div class="offer-card">
                <div class="offer-header">
                    <div class="offer-logo"><svg class="icon icon-lg"><use href="#icon-wrench"></use></svg></div>
                    <div class="offer-info">
                        <div class="offer-name">${offer.workshopName}</div>
                        <div class="offer-rating">
                            ${'★'.repeat(Math.floor(offer.rating))}${'☆'.repeat(5 - Math.floor(offer.rating))}
                            <span>${offer.rating}</span>
                        </div>
                    </div>
                </div>
                <div class="offer-details">
                    <div>
                        <div class="offer-detail-label">${t('price')}</div>
                        <div class="offer-detail-value offer-price">${offer.price}€</div>
                    </div>
                    <div>
                        <div class="offer-detail-label">${t('duration')}</div>
                        <div class="offer-detail-value">${offer.duration} ${offer.duration === 1 ? 'Tag' : 'Tage'}</div>
                    </div>
                    <div>
                        <div class="offer-detail-label">${t('distance')}</div>
                        <div class="offer-detail-value">${offer.distance} km</div>
                    </div>
                </div>
                <div class="flex gap-sm">
                    <button class="btn btn-secondary flex-1" onclick="App.openChat('${offer.id}')">
                        <svg class="icon icon-md"><use href="#icon-message"></use></svg> Chat
                    </button>
                    <button class="btn btn-primary flex-1" onclick="App.acceptOffer('${offer.id}')">
                        ${t('acceptOffer')}
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Generate demo offers
     */
    generateDemoOffers() {
        const workshops = [
            { name: 'Auto-Lackierzentrum Mosbach', rating: 4.8 },
            { name: 'Karosserie Schmidt', rating: 4.5 },
            { name: 'Meisterbetrieb Wagner', rating: 4.9 }
        ];

        return workshops.slice(0, Math.floor(Math.random() * 3) + 1).map((ws, i) => ({
            id: 'offer_' + Date.now() + '_' + i,
            workshopId: 'ws_' + i,
            workshopName: ws.name,
            rating: ws.rating,
            price: Math.floor(Math.random() * 400) + 200,
            duration: Math.floor(Math.random() * 4) + 1,
            distance: Math.floor(Math.random() * 20) + 2,
            note: '',
            createdAt: new Date().toISOString()
        }));
    },

    /**
     * Accept offer
     */
    acceptOffer(offerId) {
        this.showToast('Angebot angenommen! Die Werkstatt wurde benachrichtigt.', 'success');

        // Update request status with error handling
        try {
            const requests = JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
            const request = requests.find(r => r.id === this.currentRequestId);
            if (request) {
                request.status = 'accepted';
                request.acceptedOfferId = offerId;
                localStorage.setItem('schadens-chat-requests', JSON.stringify(requests));
            }
        } catch (e) {
            console.error('[App] Failed to accept offer:', e);
        }

        // Open chat
        this.openChat(offerId);
    },

    /**
     * Open chat with workshop
     */
    openChat(offerId) {
        this.currentOfferId = offerId;

        // Find offer with error handling
        try {
            const requests = JSON.parse(localStorage.getItem('schadens-chat-requests') || '[]');
            const request = requests.find(r => r.id === this.currentRequestId);
            const offer = request?.offers?.find(o => o.id === offerId);

            if (offer) {
                const workshopNameEl = document.getElementById('chat-workshop-name');
                if (workshopNameEl) workshopNameEl.textContent = offer.workshopName;
            }
        } catch (e) {
            console.error('[App] Failed to open chat:', e);
        }

        // Load or create chat messages
        this.loadChatMessages();

        this.navigateTo('chat');
    },

    /**
     * Load chat messages
     */
    loadChatMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        // Get messages from localStorage with error handling
        const chatKey = `schadens-chat-messages-${this.currentRequestId}-${this.currentOfferId}`;
        let messages = [];
        try {
            messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        } catch (e) {
            console.error('[App] Failed to parse chat messages:', e);
            messages = [];
        }

        // Add welcome message if empty
        if (messages.length === 0) {
            messages.push({
                id: 'msg_welcome',
                type: 'received',
                text: 'Hallo! Vielen Dank für Ihre Anfrage. Wie kann ich Ihnen helfen?',
                timestamp: new Date().toISOString()
            });
            try {
                localStorage.setItem(chatKey, JSON.stringify(messages));
            } catch (e) {
                console.error('[App] Failed to save welcome message:', e);
            }
        }

        container.innerHTML = messages.map(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="chat-message ${msg.type}">
                    <div>${this.escapeHtml(msg.text)}</div>
                    <div class="chat-message-time">
                        ${time}
                        ${msg.type === 'sent' ? '<span class="chat-message-status">✓</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Send chat message
     */
    sendMessage() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');
        const text = input?.value.trim();

        if (!text) return;

        // Double-click protection: disable immediately
        if (input) input.value = '';
        if (input) input.style.height = 'auto';
        if (sendBtn) sendBtn.disabled = true;

        // Get messages with error handling
        const chatKey = `schadens-chat-messages-${this.currentRequestId}-${this.currentOfferId}`;
        let messages = [];
        try {
            messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        } catch (e) {
            console.error('[App] Failed to parse chat messages:', e);
            messages = [];
        }

        // Add new message
        messages.push({
            id: 'msg_' + Date.now(),
            type: 'sent',
            text: text,
            timestamp: new Date().toISOString()
        });

        try {
            localStorage.setItem(chatKey, JSON.stringify(messages));
        } catch (e) {
            console.error('[App] Failed to save chat messages:', e);
            this.showToast('Nachricht konnte nicht gespeichert werden', 'error');
            return;
        }

        // Reload messages
        this.loadChatMessages();

        // Simulate reply after delay
        setTimeout(() => {
            const replies = [
                'Vielen Dank für Ihre Nachricht!',
                'Wir melden uns in Kürze bei Ihnen.',
                'Das können wir gerne so machen.',
                'Haben Sie noch weitere Fragen?'
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];

            try {
                const currentMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
                currentMessages.push({
                    id: 'msg_' + Date.now(),
                    type: 'received',
                    text: reply,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem(chatKey, JSON.stringify(currentMessages));
                this.loadChatMessages();
            } catch (e) {
                console.error('[App] Failed to save reply:', e);
            }
        }, 1500);
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
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'i'}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto-remove after 4s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    /**
     * Show/hide loading overlay
     */
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    },

    /**
     * Escape HTML for XSS prevention
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Initialize Pull-to-Refresh
     */
    initPullToRefresh() {
        let startY = 0;
        let pulling = false;
        const threshold = 80;

        // Create pull indicator
        const indicator = document.createElement('div');
        indicator.className = 'pull-indicator';
        indicator.innerHTML = `
            <div class="pull-spinner"></div>
            <span class="pull-text">Aktualisieren...</span>
        `;
        document.body.appendChild(indicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!pulling) return;

            const currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff > 0 && window.scrollY === 0) {
                const progress = Math.min(diff / threshold, 1);
                indicator.style.opacity = progress;
                indicator.style.transform = `translateX(-50%) translateY(${Math.min(diff * 0.5, 60)}px)`;

                if (progress >= 1) {
                    indicator.classList.add('visible');
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', async () => {
            if (indicator.classList.contains('visible')) {
                indicator.classList.add('refreshing');

                // Refresh data
                await this.refreshData();

                indicator.classList.remove('refreshing');
            }

            // Reset
            pulling = false;
            indicator.classList.remove('visible');
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateX(-50%) translateY(-100%)';
        });
    },

    /**
     * Refresh data (Pull-to-Refresh callback)
     */
    async refreshData() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Reload requests
        await this.loadSavedRequests();
        this.renderRequests();

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }

        this.showToast('Daten aktualisiert', 'success');
    },

    /**
     * Show skeleton loading state
     */
    showSkeleton(containerId, count = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = Array(count).fill(0).map(() => `
            <div class="skeleton skeleton-card">
                <div class="flex items-center gap-md mb-md">
                    <div class="skeleton skeleton-avatar"></div>
                    <div class="flex-1">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text"></div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Create confetti effect
     */
    showConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti';
        document.body.appendChild(container);

        const colors = ['#667eea', '#764ba2', '#f093fb', '#38ef7d', '#fee140'];

        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 0.5 + 's';
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(piece);
        }

        setTimeout(() => container.remove(), 4000);
    },

    /**
     * Show bottom sheet
     */
    showBottomSheet(content, title = '') {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'bottom-sheet-overlay';
        overlay.onclick = () => this.hideBottomSheet();

        // Create sheet
        const sheet = document.createElement('div');
        sheet.className = 'bottom-sheet';
        sheet.innerHTML = `
            <div class="bottom-sheet-handle"></div>
            ${title ? `<h3 class="mb-lg">${title}</h3>` : ''}
            <div class="bottom-sheet-content">${content}</div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(sheet);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            sheet.classList.add('visible');
        });

        // Store references
        this._bottomSheetOverlay = overlay;
        this._bottomSheet = sheet;
    },

    /**
     * Hide bottom sheet
     */
    hideBottomSheet() {
        if (this._bottomSheetOverlay) {
            this._bottomSheetOverlay.classList.remove('visible');
        }
        if (this._bottomSheet) {
            this._bottomSheet.classList.remove('visible');
        }

        setTimeout(() => {
            this._bottomSheetOverlay?.remove();
            this._bottomSheet?.remove();
        }, 300);
    },

    /**
     * Add ripple effect to element
     */
    addRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
};

// Add ripple animation keyframes
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
        App.initPullToRefresh();
    });
} else {
    App.init();
    App.initPullToRefresh();
}

// Export for global access
window.App = App;
