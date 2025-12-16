/**
 * SchadensChat - Internationalization (i18n) System
 * Unterstützte Sprachen: DE, EN, TR, RU, AR, PL, IT, ES
 */

const I18N = {
    currentLang: 'de',
    fallbackLang: 'de',

    translations: {
        // ========== DEUTSCH ==========
        de: {
            // App-Name & Navigation
            appName: 'SchadensChat',
            appSlogan: 'Schnell. Einfach. Günstig.',
            back: 'Zurück',
            next: 'Weiter',
            send: 'Senden',
            cancel: 'Abbrechen',
            save: 'Speichern',
            delete: 'Löschen',
            close: 'Schließen',
            loading: 'Lädt...',

            // Startseite
            welcomeTitle: 'Fahrzeugschaden?',
            welcomeSubtitle: 'Foto machen, Angebote erhalten!',
            startButton: 'Schaden melden',
            myRequests: 'Meine Anfragen',

            // Foto-Upload
            photoTitle: 'Schaden fotografieren',
            photoSubtitle: 'Mach 1-5 Fotos vom Schaden',
            takePhoto: 'Foto aufnehmen',
            choosePhoto: 'Aus Galerie wählen',
            photoTip: 'Tipp: Fotografiere aus verschiedenen Winkeln',
            photosSelected: '{count} Foto(s) ausgewählt',
            maxPhotos: 'Maximal 5 Fotos',

            // Schadensbeschreibung
            describeTitle: 'Schaden beschreiben',
            damageType: 'Art des Schadens',
            damageTypes: {
                dent: 'Delle',
                scratch: 'Kratzer',
                paint: 'Lackschaden',
                crack: 'Riss/Bruch',
                rust: 'Rost',
                other: 'Sonstiges'
            },
            damageLocation: 'Wo ist der Schaden?',
            locations: {
                frontBumper: 'Stoßstange vorne',
                rearBumper: 'Stoßstange hinten',
                hoodBonnet: 'Motorhaube',
                roof: 'Dach',
                doorLeft: 'Tür links',
                doorRight: 'Tür rechts',
                fenderFrontLeft: 'Kotflügel vorne links',
                fenderFrontRight: 'Kotflügel vorne rechts',
                fenderRearLeft: 'Kotflügel hinten links',
                fenderRearRight: 'Kotflügel hinten rechts',
                trunk: 'Kofferraum/Heckklappe',
                mirror: 'Spiegel',
                other: 'Sonstiges'
            },
            additionalInfo: 'Zusätzliche Infos (optional)',
            additionalPlaceholder: 'z.B. Unfallschaden, Hagelschaden...',

            // Fahrzeugdaten
            vehicleTitle: 'Fahrzeugdaten',
            licensePlate: 'Kennzeichen',
            licensePlaceholder: 'z.B. MOS-AB 123',
            vehicleBrand: 'Marke',
            vehicleModel: 'Modell',
            vehicleYear: 'Baujahr',
            vehicleColor: 'Farbe',

            // Standort
            locationTitle: 'Dein Standort',
            locationSubtitle: 'Werkstätten in deiner Nähe finden',
            useGPS: 'Meinen Standort verwenden',
            enterZip: 'Oder PLZ eingeben',
            zipPlaceholder: 'z.B. 74821',
            searchRadius: 'Suchradius',
            radiusKm: '{km} km',

            // Anfrage senden
            submitTitle: 'Anfrage absenden',
            submitSubtitle: 'Deine Anfrage wird an Werkstätten gesendet',
            contactInfo: 'Kontaktdaten',
            yourName: 'Dein Name',
            yourPhone: 'Telefonnummer',
            yourEmail: 'E-Mail (optional)',
            privacyNote: 'Deine Daten werden nur an ausgewählte Werkstätten weitergegeben.',
            submitRequest: 'Anfrage senden',

            // Angebote
            offersTitle: 'Angebote',
            offersSubtitle: 'Warte auf Angebote von Werkstätten',
            noOffersYet: 'Noch keine Angebote',
            waitingForOffers: 'Werkstätten prüfen deine Anfrage...',
            offerReceived: '{count} Angebot(e) erhalten',
            price: 'Preis',
            duration: 'Dauer',
            distance: 'Entfernung',
            rating: 'Bewertung',
            viewOffer: 'Angebot ansehen',
            acceptOffer: 'Angebot annehmen',

            // Chat
            chatTitle: 'Chat',
            typeMessage: 'Nachricht schreiben...',
            sendMessage: 'Senden',
            online: 'Online',
            offline: 'Offline',
            typing: 'schreibt...',
            messageSent: 'Gesendet',
            messageRead: 'Gelesen',

            // Status
            statusTitle: 'Status',
            status: {
                new: 'Neu',
                pending: 'Wartet auf Angebote',
                offers: 'Angebote erhalten',
                accepted: 'Angenommen',
                inProgress: 'In Bearbeitung',
                completed: 'Abgeschlossen',
                cancelled: 'Storniert'
            },

            // Werkstatt-Seite
            workshopDashboard: 'Dashboard',
            newRequests: 'Neue Anfragen',
            activeJobs: 'Aktive Aufträge',
            makeOffer: 'Angebot erstellen',
            offerPrice: 'Preis (€)',
            offerDuration: 'Dauer (Tage)',
            offerNote: 'Anmerkung',
            sendOffer: 'Angebot senden',

            // Einstellungen
            settings: 'Einstellungen',
            language: 'Sprache',
            notifications: 'Benachrichtigungen',
            darkMode: 'Dunkelmodus',
            logout: 'Abmelden',

            // Fehler & Erfolg
            error: 'Fehler',
            success: 'Erfolg',
            errorGeneric: 'Ein Fehler ist aufgetreten',
            errorNetwork: 'Keine Internetverbindung',
            errorPhoto: 'Foto konnte nicht geladen werden',
            errorLocation: 'Standort konnte nicht ermittelt werden',
            successSent: 'Anfrage erfolgreich gesendet!',
            successOffer: 'Angebot erfolgreich gesendet!',

            // Validierung
            required: 'Pflichtfeld',
            invalidPhone: 'Ungültige Telefonnummer',
            invalidEmail: 'Ungültige E-Mail-Adresse',
            invalidZip: 'Ungültige Postleitzahl',
            minPhotos: 'Mindestens 1 Foto erforderlich'
        },

        // ========== ENGLISH ==========
        en: {
            appName: 'DamageChat',
            appSlogan: 'Fast. Simple. Affordable.',
            back: 'Back',
            next: 'Next',
            send: 'Send',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            close: 'Close',
            loading: 'Loading...',

            welcomeTitle: 'Vehicle Damage?',
            welcomeSubtitle: 'Take a photo, get quotes!',
            startButton: 'Report Damage',
            myRequests: 'My Requests',

            photoTitle: 'Photograph Damage',
            photoSubtitle: 'Take 1-5 photos of the damage',
            takePhoto: 'Take Photo',
            choosePhoto: 'Choose from Gallery',
            photoTip: 'Tip: Photograph from different angles',
            photosSelected: '{count} photo(s) selected',
            maxPhotos: 'Maximum 5 photos',

            describeTitle: 'Describe Damage',
            damageType: 'Type of Damage',
            damageTypes: {
                dent: 'Dent',
                scratch: 'Scratch',
                paint: 'Paint Damage',
                crack: 'Crack/Break',
                rust: 'Rust',
                other: 'Other'
            },
            damageLocation: 'Where is the damage?',
            locations: {
                frontBumper: 'Front Bumper',
                rearBumper: 'Rear Bumper',
                hoodBonnet: 'Hood/Bonnet',
                roof: 'Roof',
                doorLeft: 'Left Door',
                doorRight: 'Right Door',
                fenderFrontLeft: 'Front Left Fender',
                fenderFrontRight: 'Front Right Fender',
                fenderRearLeft: 'Rear Left Fender',
                fenderRearRight: 'Rear Right Fender',
                trunk: 'Trunk/Tailgate',
                mirror: 'Mirror',
                other: 'Other'
            },
            additionalInfo: 'Additional Info (optional)',
            additionalPlaceholder: 'e.g. accident damage, hail damage...',

            vehicleTitle: 'Vehicle Details',
            licensePlate: 'License Plate',
            licensePlaceholder: 'e.g. ABC-123',
            vehicleBrand: 'Brand',
            vehicleModel: 'Model',
            vehicleYear: 'Year',
            vehicleColor: 'Color',

            locationTitle: 'Your Location',
            locationSubtitle: 'Find workshops near you',
            useGPS: 'Use my location',
            enterZip: 'Or enter ZIP code',
            zipPlaceholder: 'e.g. 12345',
            searchRadius: 'Search radius',
            radiusKm: '{km} km',

            submitTitle: 'Submit Request',
            submitSubtitle: 'Your request will be sent to workshops',
            contactInfo: 'Contact Information',
            yourName: 'Your Name',
            yourPhone: 'Phone Number',
            yourEmail: 'Email (optional)',
            privacyNote: 'Your data will only be shared with selected workshops.',
            submitRequest: 'Send Request',

            offersTitle: 'Offers',
            offersSubtitle: 'Waiting for offers from workshops',
            noOffersYet: 'No offers yet',
            waitingForOffers: 'Workshops are reviewing your request...',
            offerReceived: '{count} offer(s) received',
            price: 'Price',
            duration: 'Duration',
            distance: 'Distance',
            rating: 'Rating',
            viewOffer: 'View Offer',
            acceptOffer: 'Accept Offer',

            chatTitle: 'Chat',
            typeMessage: 'Type a message...',
            sendMessage: 'Send',
            online: 'Online',
            offline: 'Offline',
            typing: 'typing...',
            messageSent: 'Sent',
            messageRead: 'Read',

            statusTitle: 'Status',
            status: {
                new: 'New',
                pending: 'Waiting for Offers',
                offers: 'Offers Received',
                accepted: 'Accepted',
                inProgress: 'In Progress',
                completed: 'Completed',
                cancelled: 'Cancelled'
            },

            workshopDashboard: 'Dashboard',
            newRequests: 'New Requests',
            activeJobs: 'Active Jobs',
            makeOffer: 'Make Offer',
            offerPrice: 'Price (€)',
            offerDuration: 'Duration (Days)',
            offerNote: 'Note',
            sendOffer: 'Send Offer',

            settings: 'Settings',
            language: 'Language',
            notifications: 'Notifications',
            darkMode: 'Dark Mode',
            logout: 'Logout',

            error: 'Error',
            success: 'Success',
            errorGeneric: 'An error occurred',
            errorNetwork: 'No internet connection',
            errorPhoto: 'Could not load photo',
            errorLocation: 'Could not determine location',
            successSent: 'Request sent successfully!',
            successOffer: 'Offer sent successfully!',

            required: 'Required',
            invalidPhone: 'Invalid phone number',
            invalidEmail: 'Invalid email address',
            invalidZip: 'Invalid ZIP code',
            minPhotos: 'At least 1 photo required'
        },

        // ========== TÜRKÇE ==========
        tr: {
            appName: 'HasarChat',
            appSlogan: 'Hızlı. Basit. Uygun.',
            back: 'Geri',
            next: 'İleri',
            send: 'Gönder',
            cancel: 'İptal',
            save: 'Kaydet',
            delete: 'Sil',
            close: 'Kapat',
            loading: 'Yükleniyor...',

            welcomeTitle: 'Araç Hasarı?',
            welcomeSubtitle: 'Fotoğraf çek, teklif al!',
            startButton: 'Hasar Bildir',
            myRequests: 'Taleplerim',

            photoTitle: 'Hasarı Fotoğrafla',
            photoSubtitle: 'Hasarın 1-5 fotoğrafını çek',
            takePhoto: 'Fotoğraf Çek',
            choosePhoto: 'Galeriden Seç',
            photoTip: 'İpucu: Farklı açılardan fotoğrafla',
            photosSelected: '{count} fotoğraf seçildi',
            maxPhotos: 'Maksimum 5 fotoğraf',

            describeTitle: 'Hasarı Tanımla',
            damageType: 'Hasar Türü',
            damageTypes: {
                dent: 'Göçük',
                scratch: 'Çizik',
                paint: 'Boya Hasarı',
                crack: 'Çatlak/Kırık',
                rust: 'Pas',
                other: 'Diğer'
            },
            damageLocation: 'Hasar nerede?',
            locations: {
                frontBumper: 'Ön Tampon',
                rearBumper: 'Arka Tampon',
                hoodBonnet: 'Motor Kapağı',
                roof: 'Tavan',
                doorLeft: 'Sol Kapı',
                doorRight: 'Sağ Kapı',
                fenderFrontLeft: 'Sol Ön Çamurluk',
                fenderFrontRight: 'Sağ Ön Çamurluk',
                fenderRearLeft: 'Sol Arka Çamurluk',
                fenderRearRight: 'Sağ Arka Çamurluk',
                trunk: 'Bagaj',
                mirror: 'Ayna',
                other: 'Diğer'
            },
            additionalInfo: 'Ek Bilgi (isteğe bağlı)',
            additionalPlaceholder: 'örn. kaza hasarı, dolu hasarı...',

            vehicleTitle: 'Araç Bilgileri',
            licensePlate: 'Plaka',
            licensePlaceholder: 'örn. 34 ABC 123',
            vehicleBrand: 'Marka',
            vehicleModel: 'Model',
            vehicleYear: 'Yıl',
            vehicleColor: 'Renk',

            locationTitle: 'Konumun',
            locationSubtitle: 'Yakınındaki atölyeleri bul',
            useGPS: 'Konumumu kullan',
            enterZip: 'Veya posta kodu gir',
            zipPlaceholder: 'örn. 34000',
            searchRadius: 'Arama yarıçapı',
            radiusKm: '{km} km',

            submitTitle: 'Talep Gönder',
            submitSubtitle: 'Talebin atölyelere gönderilecek',
            contactInfo: 'İletişim Bilgileri',
            yourName: 'Adın',
            yourPhone: 'Telefon Numarası',
            yourEmail: 'E-posta (isteğe bağlı)',
            privacyNote: 'Bilgilerin sadece seçilen atölyelerle paylaşılacak.',
            submitRequest: 'Talep Gönder',

            offersTitle: 'Teklifler',
            offersSubtitle: 'Atölyelerden teklif bekleniyor',
            noOffersYet: 'Henüz teklif yok',
            waitingForOffers: 'Atölyeler talebini inceliyor...',
            offerReceived: '{count} teklif alındı',
            price: 'Fiyat',
            duration: 'Süre',
            distance: 'Mesafe',
            rating: 'Değerlendirme',
            viewOffer: 'Teklifi Gör',
            acceptOffer: 'Teklifi Kabul Et',

            chatTitle: 'Sohbet',
            typeMessage: 'Mesaj yaz...',
            sendMessage: 'Gönder',
            online: 'Çevrimiçi',
            offline: 'Çevrimdışı',
            typing: 'yazıyor...',
            messageSent: 'Gönderildi',
            messageRead: 'Okundu',

            statusTitle: 'Durum',
            status: {
                new: 'Yeni',
                pending: 'Teklif Bekleniyor',
                offers: 'Teklifler Alındı',
                accepted: 'Kabul Edildi',
                inProgress: 'İşlemde',
                completed: 'Tamamlandı',
                cancelled: 'İptal Edildi'
            },

            workshopDashboard: 'Panel',
            newRequests: 'Yeni Talepler',
            activeJobs: 'Aktif İşler',
            makeOffer: 'Teklif Ver',
            offerPrice: 'Fiyat (€)',
            offerDuration: 'Süre (Gün)',
            offerNote: 'Not',
            sendOffer: 'Teklif Gönder',

            settings: 'Ayarlar',
            language: 'Dil',
            notifications: 'Bildirimler',
            darkMode: 'Karanlık Mod',
            logout: 'Çıkış Yap',

            error: 'Hata',
            success: 'Başarılı',
            errorGeneric: 'Bir hata oluştu',
            errorNetwork: 'İnternet bağlantısı yok',
            errorPhoto: 'Fotoğraf yüklenemedi',
            errorLocation: 'Konum belirlenemedi',
            successSent: 'Talep başarıyla gönderildi!',
            successOffer: 'Teklif başarıyla gönderildi!',

            required: 'Zorunlu alan',
            invalidPhone: 'Geçersiz telefon numarası',
            invalidEmail: 'Geçersiz e-posta adresi',
            invalidZip: 'Geçersiz posta kodu',
            minPhotos: 'En az 1 fotoğraf gerekli'
        },

        // ========== РУССКИЙ ==========
        ru: {
            appName: 'ПовреждениеЧат',
            appSlogan: 'Быстро. Просто. Выгодно.',
            back: 'Назад',
            next: 'Далее',
            send: 'Отправить',
            cancel: 'Отмена',
            save: 'Сохранить',
            delete: 'Удалить',
            close: 'Закрыть',
            loading: 'Загрузка...',

            welcomeTitle: 'Повреждение авто?',
            welcomeSubtitle: 'Сфотографируй, получи предложения!',
            startButton: 'Сообщить о повреждении',
            myRequests: 'Мои заявки',

            photoTitle: 'Сфотографировать повреждение',
            photoSubtitle: 'Сделай 1-5 фото повреждения',
            takePhoto: 'Сделать фото',
            choosePhoto: 'Выбрать из галереи',
            photoTip: 'Совет: Фотографируй с разных углов',
            photosSelected: '{count} фото выбрано',
            maxPhotos: 'Максимум 5 фото',

            describeTitle: 'Описать повреждение',
            damageType: 'Тип повреждения',
            damageTypes: {
                dent: 'Вмятина',
                scratch: 'Царапина',
                paint: 'Повреждение краски',
                crack: 'Трещина/Скол',
                rust: 'Ржавчина',
                other: 'Другое'
            },
            damageLocation: 'Где повреждение?',
            locations: {
                frontBumper: 'Передний бампер',
                rearBumper: 'Задний бампер',
                hoodBonnet: 'Капот',
                roof: 'Крыша',
                doorLeft: 'Левая дверь',
                doorRight: 'Правая дверь',
                fenderFrontLeft: 'Левое переднее крыло',
                fenderFrontRight: 'Правое переднее крыло',
                fenderRearLeft: 'Левое заднее крыло',
                fenderRearRight: 'Правое заднее крыло',
                trunk: 'Багажник',
                mirror: 'Зеркало',
                other: 'Другое'
            },
            additionalInfo: 'Дополнительная информация (необязательно)',
            additionalPlaceholder: 'напр. ДТП, град...',

            vehicleTitle: 'Данные автомобиля',
            licensePlate: 'Номер',
            licensePlaceholder: 'напр. А123БВ77',
            vehicleBrand: 'Марка',
            vehicleModel: 'Модель',
            vehicleYear: 'Год выпуска',
            vehicleColor: 'Цвет',

            locationTitle: 'Ваше местоположение',
            locationSubtitle: 'Найти мастерские рядом',
            useGPS: 'Использовать мою геолокацию',
            enterZip: 'Или введите индекс',
            zipPlaceholder: 'напр. 101000',
            searchRadius: 'Радиус поиска',
            radiusKm: '{km} км',

            submitTitle: 'Отправить заявку',
            submitSubtitle: 'Ваша заявка будет отправлена мастерским',
            contactInfo: 'Контактные данные',
            yourName: 'Ваше имя',
            yourPhone: 'Номер телефона',
            yourEmail: 'Email (необязательно)',
            privacyNote: 'Ваши данные будут переданы только выбранным мастерским.',
            submitRequest: 'Отправить заявку',

            offersTitle: 'Предложения',
            offersSubtitle: 'Ожидание предложений от мастерских',
            noOffersYet: 'Пока нет предложений',
            waitingForOffers: 'Мастерские рассматривают вашу заявку...',
            offerReceived: '{count} предложение(й) получено',
            price: 'Цена',
            duration: 'Срок',
            distance: 'Расстояние',
            rating: 'Рейтинг',
            viewOffer: 'Посмотреть',
            acceptOffer: 'Принять предложение',

            chatTitle: 'Чат',
            typeMessage: 'Написать сообщение...',
            sendMessage: 'Отправить',
            online: 'Онлайн',
            offline: 'Офлайн',
            typing: 'печатает...',
            messageSent: 'Отправлено',
            messageRead: 'Прочитано',

            statusTitle: 'Статус',
            status: {
                new: 'Новая',
                pending: 'Ожидает предложений',
                offers: 'Получены предложения',
                accepted: 'Принято',
                inProgress: 'В работе',
                completed: 'Завершено',
                cancelled: 'Отменено'
            },

            workshopDashboard: 'Панель управления',
            newRequests: 'Новые заявки',
            activeJobs: 'Активные заказы',
            makeOffer: 'Сделать предложение',
            offerPrice: 'Цена (€)',
            offerDuration: 'Срок (дней)',
            offerNote: 'Примечание',
            sendOffer: 'Отправить предложение',

            settings: 'Настройки',
            language: 'Язык',
            notifications: 'Уведомления',
            darkMode: 'Тёмная тема',
            logout: 'Выйти',

            error: 'Ошибка',
            success: 'Успешно',
            errorGeneric: 'Произошла ошибка',
            errorNetwork: 'Нет подключения к интернету',
            errorPhoto: 'Не удалось загрузить фото',
            errorLocation: 'Не удалось определить местоположение',
            successSent: 'Заявка успешно отправлена!',
            successOffer: 'Предложение успешно отправлено!',

            required: 'Обязательное поле',
            invalidPhone: 'Неверный номер телефона',
            invalidEmail: 'Неверный email',
            invalidZip: 'Неверный индекс',
            minPhotos: 'Требуется минимум 1 фото'
        },

        // ========== POLSKI ==========
        pl: {
            appName: 'SzkodaChat',
            appSlogan: 'Szybko. Prosto. Tanio.',
            back: 'Wstecz',
            next: 'Dalej',
            send: 'Wyślij',
            cancel: 'Anuluj',
            save: 'Zapisz',
            delete: 'Usuń',
            close: 'Zamknij',
            loading: 'Ładowanie...',

            welcomeTitle: 'Uszkodzenie pojazdu?',
            welcomeSubtitle: 'Zrób zdjęcie, otrzymaj oferty!',
            startButton: 'Zgłoś szkodę',
            myRequests: 'Moje zgłoszenia',

            photoTitle: 'Sfotografuj uszkodzenie',
            photoSubtitle: 'Zrób 1-5 zdjęć uszkodzenia',
            takePhoto: 'Zrób zdjęcie',
            choosePhoto: 'Wybierz z galerii',
            photoTip: 'Wskazówka: Fotografuj z różnych kątów',
            photosSelected: '{count} zdjęcie(a) wybrane',
            maxPhotos: 'Maksymalnie 5 zdjęć',

            describeTitle: 'Opisz uszkodzenie',
            damageType: 'Rodzaj uszkodzenia',
            damageTypes: {
                dent: 'Wgniecenie',
                scratch: 'Rysa',
                paint: 'Uszkodzenie lakieru',
                crack: 'Pęknięcie/Złamanie',
                rust: 'Rdza',
                other: 'Inne'
            },
            damageLocation: 'Gdzie jest uszkodzenie?',
            locations: {
                frontBumper: 'Zderzak przedni',
                rearBumper: 'Zderzak tylny',
                hoodBonnet: 'Maska',
                roof: 'Dach',
                doorLeft: 'Drzwi lewe',
                doorRight: 'Drzwi prawe',
                fenderFrontLeft: 'Błotnik przedni lewy',
                fenderFrontRight: 'Błotnik przedni prawy',
                fenderRearLeft: 'Błotnik tylny lewy',
                fenderRearRight: 'Błotnik tylny prawy',
                trunk: 'Bagażnik',
                mirror: 'Lusterko',
                other: 'Inne'
            },
            additionalInfo: 'Dodatkowe informacje (opcjonalnie)',
            additionalPlaceholder: 'np. szkoda powypadkowa, grad...',

            vehicleTitle: 'Dane pojazdu',
            licensePlate: 'Numer rejestracyjny',
            licensePlaceholder: 'np. WA 12345',
            vehicleBrand: 'Marka',
            vehicleModel: 'Model',
            vehicleYear: 'Rok',
            vehicleColor: 'Kolor',

            locationTitle: 'Twoja lokalizacja',
            locationSubtitle: 'Znajdź warsztaty w pobliżu',
            useGPS: 'Użyj mojej lokalizacji',
            enterZip: 'Lub wpisz kod pocztowy',
            zipPlaceholder: 'np. 00-001',
            searchRadius: 'Promień wyszukiwania',
            radiusKm: '{km} km',

            submitTitle: 'Wyślij zgłoszenie',
            submitSubtitle: 'Twoje zgłoszenie zostanie wysłane do warsztatów',
            contactInfo: 'Dane kontaktowe',
            yourName: 'Twoje imię',
            yourPhone: 'Numer telefonu',
            yourEmail: 'Email (opcjonalnie)',
            privacyNote: 'Twoje dane zostaną udostępnione tylko wybranym warsztatom.',
            submitRequest: 'Wyślij zgłoszenie',

            offersTitle: 'Oferty',
            offersSubtitle: 'Oczekiwanie na oferty z warsztatów',
            noOffersYet: 'Brak ofert',
            waitingForOffers: 'Warsztaty przeglądają Twoje zgłoszenie...',
            offerReceived: '{count} oferta(y) otrzymane',
            price: 'Cena',
            duration: 'Czas realizacji',
            distance: 'Odległość',
            rating: 'Ocena',
            viewOffer: 'Zobacz ofertę',
            acceptOffer: 'Akceptuj ofertę',

            chatTitle: 'Czat',
            typeMessage: 'Napisz wiadomość...',
            sendMessage: 'Wyślij',
            online: 'Online',
            offline: 'Offline',
            typing: 'pisze...',
            messageSent: 'Wysłano',
            messageRead: 'Przeczytano',

            statusTitle: 'Status',
            status: {
                new: 'Nowe',
                pending: 'Oczekuje na oferty',
                offers: 'Otrzymano oferty',
                accepted: 'Zaakceptowane',
                inProgress: 'W realizacji',
                completed: 'Zakończone',
                cancelled: 'Anulowane'
            },

            workshopDashboard: 'Panel',
            newRequests: 'Nowe zgłoszenia',
            activeJobs: 'Aktywne zlecenia',
            makeOffer: 'Złóż ofertę',
            offerPrice: 'Cena (€)',
            offerDuration: 'Czas (dni)',
            offerNote: 'Uwaga',
            sendOffer: 'Wyślij ofertę',

            settings: 'Ustawienia',
            language: 'Język',
            notifications: 'Powiadomienia',
            darkMode: 'Tryb ciemny',
            logout: 'Wyloguj',

            error: 'Błąd',
            success: 'Sukces',
            errorGeneric: 'Wystąpił błąd',
            errorNetwork: 'Brak połączenia z internetem',
            errorPhoto: 'Nie można załadować zdjęcia',
            errorLocation: 'Nie można określić lokalizacji',
            successSent: 'Zgłoszenie wysłane pomyślnie!',
            successOffer: 'Oferta wysłana pomyślnie!',

            required: 'Pole wymagane',
            invalidPhone: 'Nieprawidłowy numer telefonu',
            invalidEmail: 'Nieprawidłowy adres email',
            invalidZip: 'Nieprawidłowy kod pocztowy',
            minPhotos: 'Wymagane minimum 1 zdjęcie'
        },

        // ========== العربية (Arabic) ==========
        ar: {
            appName: 'شات الأضرار',
            appSlogan: 'سريع. بسيط. اقتصادي.',
            back: 'رجوع',
            next: 'التالي',
            send: 'إرسال',
            cancel: 'إلغاء',
            save: 'حفظ',
            delete: 'حذف',
            close: 'إغلاق',
            loading: 'جاري التحميل...',

            welcomeTitle: 'ضرر في السيارة؟',
            welcomeSubtitle: 'التقط صورة، احصل على عروض!',
            startButton: 'الإبلاغ عن ضرر',
            myRequests: 'طلباتي',

            photoTitle: 'تصوير الضرر',
            photoSubtitle: 'التقط 1-5 صور للضرر',
            takePhoto: 'التقاط صورة',
            choosePhoto: 'اختر من المعرض',
            photoTip: 'نصيحة: صور من زوايا مختلفة',
            photosSelected: '{count} صورة مختارة',
            maxPhotos: 'الحد الأقصى 5 صور',

            describeTitle: 'وصف الضرر',
            damageType: 'نوع الضرر',
            damageTypes: {
                dent: 'انبعاج',
                scratch: 'خدش',
                paint: 'ضرر في الطلاء',
                crack: 'شرخ/كسر',
                rust: 'صدأ',
                other: 'أخرى'
            },
            damageLocation: 'أين الضرر؟',
            locations: {
                frontBumper: 'المصد الأمامي',
                rearBumper: 'المصد الخلفي',
                hoodBonnet: 'غطاء المحرك',
                roof: 'السقف',
                doorLeft: 'الباب الأيسر',
                doorRight: 'الباب الأيمن',
                fenderFrontLeft: 'الرفرف الأمامي الأيسر',
                fenderFrontRight: 'الرفرف الأمامي الأيمن',
                fenderRearLeft: 'الرفرف الخلفي الأيسر',
                fenderRearRight: 'الرفرف الخلفي الأيمن',
                trunk: 'صندوق السيارة',
                mirror: 'المرآة',
                other: 'أخرى'
            },
            additionalInfo: 'معلومات إضافية (اختياري)',
            additionalPlaceholder: 'مثال: ضرر حادث، ضرر برد...',

            vehicleTitle: 'بيانات السيارة',
            licensePlate: 'رقم اللوحة',
            licensePlaceholder: 'مثال: أ ب ج 123',
            vehicleBrand: 'الماركة',
            vehicleModel: 'الموديل',
            vehicleYear: 'سنة الصنع',
            vehicleColor: 'اللون',

            locationTitle: 'موقعك',
            locationSubtitle: 'البحث عن ورش قريبة',
            useGPS: 'استخدم موقعي',
            enterZip: 'أو أدخل الرمز البريدي',
            zipPlaceholder: 'مثال: 12345',
            searchRadius: 'نطاق البحث',
            radiusKm: '{km} كم',

            submitTitle: 'إرسال الطلب',
            submitSubtitle: 'سيتم إرسال طلبك إلى الورش',
            contactInfo: 'معلومات الاتصال',
            yourName: 'اسمك',
            yourPhone: 'رقم الهاتف',
            yourEmail: 'البريد الإلكتروني (اختياري)',
            privacyNote: 'سيتم مشاركة بياناتك فقط مع الورش المختارة.',
            submitRequest: 'إرسال الطلب',

            offersTitle: 'العروض',
            offersSubtitle: 'في انتظار عروض من الورش',
            noOffersYet: 'لا توجد عروض بعد',
            waitingForOffers: 'الورش تراجع طلبك...',
            offerReceived: 'تم استلام {count} عرض',
            price: 'السعر',
            duration: 'المدة',
            distance: 'المسافة',
            rating: 'التقييم',
            viewOffer: 'عرض العرض',
            acceptOffer: 'قبول العرض',

            chatTitle: 'المحادثة',
            typeMessage: 'اكتب رسالة...',
            sendMessage: 'إرسال',
            online: 'متصل',
            offline: 'غير متصل',
            typing: 'يكتب...',
            messageSent: 'تم الإرسال',
            messageRead: 'تمت القراءة',

            statusTitle: 'الحالة',
            status: {
                new: 'جديد',
                pending: 'في انتظار العروض',
                offers: 'تم استلام العروض',
                accepted: 'مقبول',
                inProgress: 'قيد التنفيذ',
                completed: 'مكتمل',
                cancelled: 'ملغي'
            },

            workshopDashboard: 'لوحة التحكم',
            newRequests: 'طلبات جديدة',
            activeJobs: 'أعمال نشطة',
            makeOffer: 'تقديم عرض',
            offerPrice: 'السعر (€)',
            offerDuration: 'المدة (أيام)',
            offerNote: 'ملاحظة',
            sendOffer: 'إرسال العرض',

            settings: 'الإعدادات',
            language: 'اللغة',
            notifications: 'الإشعارات',
            darkMode: 'الوضع الداكن',
            logout: 'تسجيل الخروج',

            error: 'خطأ',
            success: 'نجاح',
            errorGeneric: 'حدث خطأ',
            errorNetwork: 'لا يوجد اتصال بالإنترنت',
            errorPhoto: 'تعذر تحميل الصورة',
            errorLocation: 'تعذر تحديد الموقع',
            successSent: 'تم إرسال الطلب بنجاح!',
            successOffer: 'تم إرسال العرض بنجاح!',

            required: 'حقل مطلوب',
            invalidPhone: 'رقم هاتف غير صالح',
            invalidEmail: 'بريد إلكتروني غير صالح',
            invalidZip: 'رمز بريدي غير صالح',
            minPhotos: 'مطلوب صورة واحدة على الأقل'
        },

        // ========== ESPAÑOL ==========
        es: {
            appName: 'DañoChat',
            appSlogan: 'Rápido. Simple. Económico.',
            back: 'Atrás',
            next: 'Siguiente',
            send: 'Enviar',
            cancel: 'Cancelar',
            save: 'Guardar',
            delete: 'Eliminar',
            close: 'Cerrar',
            loading: 'Cargando...',

            welcomeTitle: '¿Daño en el vehículo?',
            welcomeSubtitle: '¡Haz una foto, recibe ofertas!',
            startButton: 'Reportar daño',
            myRequests: 'Mis solicitudes',

            photoTitle: 'Fotografiar daño',
            photoSubtitle: 'Toma 1-5 fotos del daño',
            takePhoto: 'Tomar foto',
            choosePhoto: 'Elegir de galería',
            photoTip: 'Consejo: Fotografía desde diferentes ángulos',
            photosSelected: '{count} foto(s) seleccionada(s)',
            maxPhotos: 'Máximo 5 fotos',

            describeTitle: 'Describir daño',
            damageType: 'Tipo de daño',
            damageTypes: {
                dent: 'Abolladura',
                scratch: 'Rayón',
                paint: 'Daño de pintura',
                crack: 'Grieta/Rotura',
                rust: 'Óxido',
                other: 'Otro'
            },
            damageLocation: '¿Dónde está el daño?',
            locations: {
                frontBumper: 'Parachoques delantero',
                rearBumper: 'Parachoques trasero',
                hoodBonnet: 'Capó',
                roof: 'Techo',
                doorLeft: 'Puerta izquierda',
                doorRight: 'Puerta derecha',
                fenderFrontLeft: 'Guardabarros delantero izq.',
                fenderFrontRight: 'Guardabarros delantero der.',
                fenderRearLeft: 'Guardabarros trasero izq.',
                fenderRearRight: 'Guardabarros trasero der.',
                trunk: 'Maletero',
                mirror: 'Espejo',
                other: 'Otro'
            },
            additionalInfo: 'Info adicional (opcional)',
            additionalPlaceholder: 'ej. daño por accidente, granizo...',

            vehicleTitle: 'Datos del vehículo',
            licensePlate: 'Matrícula',
            licensePlaceholder: 'ej. 1234 ABC',
            vehicleBrand: 'Marca',
            vehicleModel: 'Modelo',
            vehicleYear: 'Año',
            vehicleColor: 'Color',

            locationTitle: 'Tu ubicación',
            locationSubtitle: 'Encontrar talleres cercanos',
            useGPS: 'Usar mi ubicación',
            enterZip: 'O introduce código postal',
            zipPlaceholder: 'ej. 28001',
            searchRadius: 'Radio de búsqueda',
            radiusKm: '{km} km',

            submitTitle: 'Enviar solicitud',
            submitSubtitle: 'Tu solicitud será enviada a talleres',
            contactInfo: 'Datos de contacto',
            yourName: 'Tu nombre',
            yourPhone: 'Teléfono',
            yourEmail: 'Email (opcional)',
            privacyNote: 'Tus datos solo se compartirán con talleres seleccionados.',
            submitRequest: 'Enviar solicitud',

            offersTitle: 'Ofertas',
            offersSubtitle: 'Esperando ofertas de talleres',
            noOffersYet: 'Sin ofertas aún',
            waitingForOffers: 'Los talleres revisan tu solicitud...',
            offerReceived: '{count} oferta(s) recibida(s)',
            price: 'Precio',
            duration: 'Duración',
            distance: 'Distancia',
            rating: 'Valoración',
            viewOffer: 'Ver oferta',
            acceptOffer: 'Aceptar oferta',

            chatTitle: 'Chat',
            typeMessage: 'Escribe un mensaje...',
            sendMessage: 'Enviar',
            online: 'En línea',
            offline: 'Desconectado',
            typing: 'escribiendo...',
            messageSent: 'Enviado',
            messageRead: 'Leído',

            statusTitle: 'Estado',
            status: {
                new: 'Nuevo',
                pending: 'Esperando ofertas',
                offers: 'Ofertas recibidas',
                accepted: 'Aceptado',
                inProgress: 'En progreso',
                completed: 'Completado',
                cancelled: 'Cancelado'
            },

            workshopDashboard: 'Panel',
            newRequests: 'Nuevas solicitudes',
            activeJobs: 'Trabajos activos',
            makeOffer: 'Hacer oferta',
            offerPrice: 'Precio (€)',
            offerDuration: 'Duración (días)',
            offerNote: 'Nota',
            sendOffer: 'Enviar oferta',

            settings: 'Ajustes',
            language: 'Idioma',
            notifications: 'Notificaciones',
            darkMode: 'Modo oscuro',
            logout: 'Cerrar sesión',

            error: 'Error',
            success: 'Éxito',
            errorGeneric: 'Ha ocurrido un error',
            errorNetwork: 'Sin conexión a internet',
            errorPhoto: 'No se pudo cargar la foto',
            errorLocation: 'No se pudo determinar la ubicación',
            successSent: '¡Solicitud enviada con éxito!',
            successOffer: '¡Oferta enviada con éxito!',

            required: 'Campo obligatorio',
            invalidPhone: 'Teléfono inválido',
            invalidEmail: 'Email inválido',
            invalidZip: 'Código postal inválido',
            minPhotos: 'Se requiere al menos 1 foto'
        },

        // ========== ITALIANO ==========
        it: {
            appName: 'DannoChat',
            appSlogan: 'Veloce. Semplice. Conveniente.',
            back: 'Indietro',
            next: 'Avanti',
            send: 'Invia',
            cancel: 'Annulla',
            save: 'Salva',
            delete: 'Elimina',
            close: 'Chiudi',
            loading: 'Caricamento...',

            welcomeTitle: 'Danno al veicolo?',
            welcomeSubtitle: 'Scatta una foto, ricevi preventivi!',
            startButton: 'Segnala danno',
            myRequests: 'Le mie richieste',

            photoTitle: 'Fotografa il danno',
            photoSubtitle: 'Scatta 1-5 foto del danno',
            takePhoto: 'Scatta foto',
            choosePhoto: 'Scegli dalla galleria',
            photoTip: 'Consiglio: Fotografa da diverse angolazioni',
            photosSelected: '{count} foto selezionata/e',
            maxPhotos: 'Massimo 5 foto',

            describeTitle: 'Descrivi il danno',
            damageType: 'Tipo di danno',
            damageTypes: {
                dent: 'Ammaccatura',
                scratch: 'Graffio',
                paint: 'Danno alla vernice',
                crack: 'Crepa/Rottura',
                rust: 'Ruggine',
                other: 'Altro'
            },
            damageLocation: 'Dove si trova il danno?',
            locations: {
                frontBumper: 'Paraurti anteriore',
                rearBumper: 'Paraurti posteriore',
                hoodBonnet: 'Cofano',
                roof: 'Tetto',
                doorLeft: 'Porta sinistra',
                doorRight: 'Porta destra',
                fenderFrontLeft: 'Parafango ant. sinistro',
                fenderFrontRight: 'Parafango ant. destro',
                fenderRearLeft: 'Parafango post. sinistro',
                fenderRearRight: 'Parafango post. destro',
                trunk: 'Bagagliaio',
                mirror: 'Specchietto',
                other: 'Altro'
            },
            additionalInfo: 'Info aggiuntive (opzionale)',
            additionalPlaceholder: 'es. danno da incidente, grandine...',

            vehicleTitle: 'Dati del veicolo',
            licensePlate: 'Targa',
            licensePlaceholder: 'es. AB 123 CD',
            vehicleBrand: 'Marca',
            vehicleModel: 'Modello',
            vehicleYear: 'Anno',
            vehicleColor: 'Colore',

            locationTitle: 'La tua posizione',
            locationSubtitle: 'Trova officine vicine',
            useGPS: 'Usa la mia posizione',
            enterZip: 'Oppure inserisci CAP',
            zipPlaceholder: 'es. 00100',
            searchRadius: 'Raggio di ricerca',
            radiusKm: '{km} km',

            submitTitle: 'Invia richiesta',
            submitSubtitle: 'La tua richiesta sarà inviata alle officine',
            contactInfo: 'Dati di contatto',
            yourName: 'Il tuo nome',
            yourPhone: 'Telefono',
            yourEmail: 'Email (opzionale)',
            privacyNote: 'I tuoi dati saranno condivisi solo con officine selezionate.',
            submitRequest: 'Invia richiesta',

            offersTitle: 'Preventivi',
            offersSubtitle: 'In attesa di preventivi dalle officine',
            noOffersYet: 'Nessun preventivo ancora',
            waitingForOffers: 'Le officine stanno esaminando la tua richiesta...',
            offerReceived: '{count} preventivo/i ricevuto/i',
            price: 'Prezzo',
            duration: 'Durata',
            distance: 'Distanza',
            rating: 'Valutazione',
            viewOffer: 'Vedi preventivo',
            acceptOffer: 'Accetta preventivo',

            chatTitle: 'Chat',
            typeMessage: 'Scrivi un messaggio...',
            sendMessage: 'Invia',
            online: 'Online',
            offline: 'Offline',
            typing: 'sta scrivendo...',
            messageSent: 'Inviato',
            messageRead: 'Letto',

            statusTitle: 'Stato',
            status: {
                new: 'Nuovo',
                pending: 'In attesa di preventivi',
                offers: 'Preventivi ricevuti',
                accepted: 'Accettato',
                inProgress: 'In corso',
                completed: 'Completato',
                cancelled: 'Annullato'
            },

            workshopDashboard: 'Pannello',
            newRequests: 'Nuove richieste',
            activeJobs: 'Lavori attivi',
            makeOffer: 'Fai preventivo',
            offerPrice: 'Prezzo (€)',
            offerDuration: 'Durata (giorni)',
            offerNote: 'Nota',
            sendOffer: 'Invia preventivo',

            settings: 'Impostazioni',
            language: 'Lingua',
            notifications: 'Notifiche',
            darkMode: 'Modalità scura',
            logout: 'Esci',

            error: 'Errore',
            success: 'Successo',
            errorGeneric: 'Si è verificato un errore',
            errorNetwork: 'Nessuna connessione internet',
            errorPhoto: 'Impossibile caricare la foto',
            errorLocation: 'Impossibile determinare la posizione',
            successSent: 'Richiesta inviata con successo!',
            successOffer: 'Preventivo inviato con successo!',

            required: 'Campo obbligatorio',
            invalidPhone: 'Telefono non valido',
            invalidEmail: 'Email non valida',
            invalidZip: 'CAP non valido',
            minPhotos: 'Richiesta almeno 1 foto'
        },

        // ========== FRANÇAIS ==========
        fr: {
            appName: 'DommageChat',
            appSlogan: 'Rapide. Simple. Économique.',
            back: 'Retour',
            next: 'Suivant',
            send: 'Envoyer',
            cancel: 'Annuler',
            save: 'Sauvegarder',
            delete: 'Supprimer',
            close: 'Fermer',
            loading: 'Chargement...',

            welcomeTitle: 'Dommage sur véhicule?',
            welcomeSubtitle: 'Prenez une photo, recevez des devis!',
            startButton: 'Signaler un dommage',
            myRequests: 'Mes demandes',

            photoTitle: 'Photographier le dommage',
            photoSubtitle: 'Prenez 1-5 photos du dommage',
            takePhoto: 'Prendre photo',
            choosePhoto: 'Choisir de la galerie',
            photoTip: 'Conseil: Photographiez sous différents angles',
            photosSelected: '{count} photo(s) sélectionnée(s)',
            maxPhotos: 'Maximum 5 photos',

            describeTitle: 'Décrire le dommage',
            damageType: 'Type de dommage',
            damageTypes: {
                dent: 'Bosse',
                scratch: 'Rayure',
                paint: 'Dommage de peinture',
                crack: 'Fissure/Cassure',
                rust: 'Rouille',
                other: 'Autre'
            },
            damageLocation: 'Où est le dommage?',
            locations: {
                frontBumper: 'Pare-chocs avant',
                rearBumper: 'Pare-chocs arrière',
                hoodBonnet: 'Capot',
                roof: 'Toit',
                doorLeft: 'Porte gauche',
                doorRight: 'Porte droite',
                fenderFrontLeft: 'Aile avant gauche',
                fenderFrontRight: 'Aile avant droite',
                fenderRearLeft: 'Aile arrière gauche',
                fenderRearRight: 'Aile arrière droite',
                trunk: 'Coffre',
                mirror: 'Rétroviseur',
                other: 'Autre'
            },
            additionalInfo: 'Infos supplémentaires (optionnel)',
            additionalPlaceholder: 'ex. dommage accident, grêle...',

            vehicleTitle: 'Données du véhicule',
            licensePlate: 'Plaque d\'immatriculation',
            licensePlaceholder: 'ex. AB-123-CD',
            vehicleBrand: 'Marque',
            vehicleModel: 'Modèle',
            vehicleYear: 'Année',
            vehicleColor: 'Couleur',

            locationTitle: 'Votre position',
            locationSubtitle: 'Trouver des garages à proximité',
            useGPS: 'Utiliser ma position',
            enterZip: 'Ou entrez le code postal',
            zipPlaceholder: 'ex. 75001',
            searchRadius: 'Rayon de recherche',
            radiusKm: '{km} km',

            submitTitle: 'Envoyer la demande',
            submitSubtitle: 'Votre demande sera envoyée aux garages',
            contactInfo: 'Coordonnées',
            yourName: 'Votre nom',
            yourPhone: 'Téléphone',
            yourEmail: 'Email (optionnel)',
            privacyNote: 'Vos données ne seront partagées qu\'avec les garages sélectionnés.',
            submitRequest: 'Envoyer la demande',

            offersTitle: 'Devis',
            offersSubtitle: 'En attente de devis des garages',
            noOffersYet: 'Pas encore de devis',
            waitingForOffers: 'Les garages examinent votre demande...',
            offerReceived: '{count} devis reçu(s)',
            price: 'Prix',
            duration: 'Durée',
            distance: 'Distance',
            rating: 'Note',
            viewOffer: 'Voir le devis',
            acceptOffer: 'Accepter le devis',

            chatTitle: 'Discussion',
            typeMessage: 'Écrire un message...',
            sendMessage: 'Envoyer',
            online: 'En ligne',
            offline: 'Hors ligne',
            typing: 'écrit...',
            messageSent: 'Envoyé',
            messageRead: 'Lu',

            statusTitle: 'Statut',
            status: {
                new: 'Nouveau',
                pending: 'En attente de devis',
                offers: 'Devis reçus',
                accepted: 'Accepté',
                inProgress: 'En cours',
                completed: 'Terminé',
                cancelled: 'Annulé'
            },

            workshopDashboard: 'Tableau de bord',
            newRequests: 'Nouvelles demandes',
            activeJobs: 'Travaux actifs',
            makeOffer: 'Faire un devis',
            offerPrice: 'Prix (€)',
            offerDuration: 'Durée (jours)',
            offerNote: 'Note',
            sendOffer: 'Envoyer le devis',

            settings: 'Paramètres',
            language: 'Langue',
            notifications: 'Notifications',
            darkMode: 'Mode sombre',
            logout: 'Déconnexion',

            error: 'Erreur',
            success: 'Succès',
            errorGeneric: 'Une erreur est survenue',
            errorNetwork: 'Pas de connexion internet',
            errorPhoto: 'Impossible de charger la photo',
            errorLocation: 'Impossible de déterminer la position',
            successSent: 'Demande envoyée avec succès!',
            successOffer: 'Devis envoyé avec succès!',

            required: 'Champ obligatoire',
            invalidPhone: 'Téléphone invalide',
            invalidEmail: 'Email invalide',
            invalidZip: 'Code postal invalide',
            minPhotos: 'Au moins 1 photo requise'
        },

        // ========== УКРАЇНСЬКА (Ukrainian) ==========
        uk: {
            appName: 'ПошкодженняЧат',
            appSlogan: 'Швидко. Просто. Вигідно.',
            back: 'Назад',
            next: 'Далі',
            send: 'Надіслати',
            cancel: 'Скасувати',
            save: 'Зберегти',
            delete: 'Видалити',
            close: 'Закрити',
            loading: 'Завантаження...',

            welcomeTitle: 'Пошкодження авто?',
            welcomeSubtitle: 'Сфотографуй, отримай пропозиції!',
            startButton: 'Повідомити про пошкодження',
            myRequests: 'Мої заявки',

            photoTitle: 'Сфотографувати пошкодження',
            photoSubtitle: 'Зроби 1-5 фото пошкодження',
            takePhoto: 'Зробити фото',
            choosePhoto: 'Вибрати з галереї',
            photoTip: 'Порада: Фотографуй з різних кутів',
            photosSelected: '{count} фото вибрано',
            maxPhotos: 'Максимум 5 фото',

            describeTitle: 'Опис пошкодження',
            damageType: 'Тип пошкодження',
            damageTypes: {
                dent: 'Вм\'ятина',
                scratch: 'Подряпина',
                paint: 'Пошкодження фарби',
                crack: 'Тріщина/Злам',
                rust: 'Іржа',
                other: 'Інше'
            },
            damageLocation: 'Де пошкодження?',
            locations: {
                frontBumper: 'Передній бампер',
                rearBumper: 'Задній бампер',
                hoodBonnet: 'Капот',
                roof: 'Дах',
                doorLeft: 'Ліві двері',
                doorRight: 'Праві двері',
                fenderFrontLeft: 'Ліве переднє крило',
                fenderFrontRight: 'Праве переднє крило',
                fenderRearLeft: 'Ліве заднє крило',
                fenderRearRight: 'Праве заднє крило',
                trunk: 'Багажник',
                mirror: 'Дзеркало',
                other: 'Інше'
            },
            additionalInfo: 'Додаткова інформація (необов\'язково)',
            additionalPlaceholder: 'напр. ДТП, град...',

            vehicleTitle: 'Дані автомобіля',
            licensePlate: 'Номер',
            licensePlaceholder: 'напр. АА 1234 ВВ',
            vehicleBrand: 'Марка',
            vehicleModel: 'Модель',
            vehicleYear: 'Рік випуску',
            vehicleColor: 'Колір',

            locationTitle: 'Ваше місцезнаходження',
            locationSubtitle: 'Знайти майстерні поблизу',
            useGPS: 'Використати мою геолокацію',
            enterZip: 'Або введіть індекс',
            zipPlaceholder: 'напр. 01001',
            searchRadius: 'Радіус пошуку',
            radiusKm: '{km} км',

            submitTitle: 'Надіслати заявку',
            submitSubtitle: 'Ваша заявка буде надіслана майстерням',
            contactInfo: 'Контактні дані',
            yourName: 'Ваше ім\'я',
            yourPhone: 'Номер телефону',
            yourEmail: 'Email (необов\'язково)',
            privacyNote: 'Ваші дані будуть передані тільки обраним майстерням.',
            submitRequest: 'Надіслати заявку',

            offersTitle: 'Пропозиції',
            offersSubtitle: 'Очікування пропозицій від майстерень',
            noOffersYet: 'Поки немає пропозицій',
            waitingForOffers: 'Майстерні розглядають вашу заявку...',
            offerReceived: '{count} пропозицію(й) отримано',
            price: 'Ціна',
            duration: 'Термін',
            distance: 'Відстань',
            rating: 'Рейтинг',
            viewOffer: 'Переглянути',
            acceptOffer: 'Прийняти пропозицію',

            chatTitle: 'Чат',
            typeMessage: 'Написати повідомлення...',
            sendMessage: 'Надіслати',
            online: 'Онлайн',
            offline: 'Офлайн',
            typing: 'пише...',
            messageSent: 'Надіслано',
            messageRead: 'Прочитано',

            statusTitle: 'Статус',
            status: {
                new: 'Нова',
                pending: 'Очікує пропозицій',
                offers: 'Отримано пропозиції',
                accepted: 'Прийнято',
                inProgress: 'В роботі',
                completed: 'Завершено',
                cancelled: 'Скасовано'
            },

            workshopDashboard: 'Панель керування',
            newRequests: 'Нові заявки',
            activeJobs: 'Активні замовлення',
            makeOffer: 'Зробити пропозицію',
            offerPrice: 'Ціна (€)',
            offerDuration: 'Термін (днів)',
            offerNote: 'Примітка',
            sendOffer: 'Надіслати пропозицію',

            settings: 'Налаштування',
            language: 'Мова',
            notifications: 'Сповіщення',
            darkMode: 'Темна тема',
            logout: 'Вийти',

            error: 'Помилка',
            success: 'Успішно',
            errorGeneric: 'Сталася помилка',
            errorNetwork: 'Немає з\'єднання з інтернетом',
            errorPhoto: 'Не вдалося завантажити фото',
            errorLocation: 'Не вдалося визначити місцезнаходження',
            successSent: 'Заявку успішно надіслано!',
            successOffer: 'Пропозицію успішно надіслано!',

            required: 'Обов\'язкове поле',
            invalidPhone: 'Невірний номер телефону',
            invalidEmail: 'Невірний email',
            invalidZip: 'Невірний індекс',
            minPhotos: 'Потрібно мінімум 1 фото'
        },

        // ========== ROMÂNĂ (Romanian) ==========
        ro: {
            appName: 'DaunăChat',
            appSlogan: 'Rapid. Simplu. Ieftin.',
            back: 'Înapoi',
            next: 'Următorul',
            send: 'Trimite',
            cancel: 'Anulează',
            save: 'Salvează',
            delete: 'Șterge',
            close: 'Închide',
            loading: 'Se încarcă...',

            welcomeTitle: 'Daună la vehicul?',
            welcomeSubtitle: 'Fă o poză, primești oferte!',
            startButton: 'Raportează daună',
            myRequests: 'Cererile mele',

            photoTitle: 'Fotografiază dauna',
            photoSubtitle: 'Fă 1-5 poze cu dauna',
            takePhoto: 'Fă poză',
            choosePhoto: 'Alege din galerie',
            photoTip: 'Sfat: Fotografiază din unghiuri diferite',
            photosSelected: '{count} poză(e) selectată(e)',
            maxPhotos: 'Maximum 5 poze',

            describeTitle: 'Descrie dauna',
            damageType: 'Tipul daunei',
            damageTypes: {
                dent: 'Lovitură',
                scratch: 'Zgârietură',
                paint: 'Daună vopsea',
                crack: 'Crăpătură/Spărtură',
                rust: 'Rugină',
                other: 'Altele'
            },
            damageLocation: 'Unde este dauna?',
            locations: {
                frontBumper: 'Bară față',
                rearBumper: 'Bară spate',
                hoodBonnet: 'Capotă',
                roof: 'Acoperiș',
                doorLeft: 'Ușă stânga',
                doorRight: 'Ușă dreapta',
                fenderFrontLeft: 'Aripă față stânga',
                fenderFrontRight: 'Aripă față dreapta',
                fenderRearLeft: 'Aripă spate stânga',
                fenderRearRight: 'Aripă spate dreapta',
                trunk: 'Portbagaj',
                mirror: 'Oglindă',
                other: 'Altele'
            },
            additionalInfo: 'Info suplimentare (opțional)',
            additionalPlaceholder: 'ex. daună accident, grindină...',

            vehicleTitle: 'Datele vehiculului',
            licensePlate: 'Număr înmatriculare',
            licensePlaceholder: 'ex. B 123 ABC',
            vehicleBrand: 'Marcă',
            vehicleModel: 'Model',
            vehicleYear: 'An',
            vehicleColor: 'Culoare',

            locationTitle: 'Locația ta',
            locationSubtitle: 'Găsește service-uri aproape',
            useGPS: 'Folosește locația mea',
            enterZip: 'Sau introdu codul poștal',
            zipPlaceholder: 'ex. 010011',
            searchRadius: 'Raza de căutare',
            radiusKm: '{km} km',

            submitTitle: 'Trimite cererea',
            submitSubtitle: 'Cererea ta va fi trimisă service-urilor',
            contactInfo: 'Date de contact',
            yourName: 'Numele tău',
            yourPhone: 'Telefon',
            yourEmail: 'Email (opțional)',
            privacyNote: 'Datele tale vor fi partajate doar cu service-urile selectate.',
            submitRequest: 'Trimite cererea',

            offersTitle: 'Oferte',
            offersSubtitle: 'Așteptăm oferte de la service-uri',
            noOffersYet: 'Nicio ofertă încă',
            waitingForOffers: 'Service-urile verifică cererea ta...',
            offerReceived: '{count} ofertă(e) primită(e)',
            price: 'Preț',
            duration: 'Durată',
            distance: 'Distanță',
            rating: 'Rating',
            viewOffer: 'Vezi oferta',
            acceptOffer: 'Acceptă oferta',

            chatTitle: 'Chat',
            typeMessage: 'Scrie un mesaj...',
            sendMessage: 'Trimite',
            online: 'Online',
            offline: 'Offline',
            typing: 'scrie...',
            messageSent: 'Trimis',
            messageRead: 'Citit',

            statusTitle: 'Status',
            status: {
                new: 'Nou',
                pending: 'Așteaptă oferte',
                offers: 'Oferte primite',
                accepted: 'Acceptat',
                inProgress: 'În lucru',
                completed: 'Finalizat',
                cancelled: 'Anulat'
            },

            workshopDashboard: 'Panou',
            newRequests: 'Cereri noi',
            activeJobs: 'Lucrări active',
            makeOffer: 'Fă ofertă',
            offerPrice: 'Preț (€)',
            offerDuration: 'Durată (zile)',
            offerNote: 'Notă',
            sendOffer: 'Trimite oferta',

            settings: 'Setări',
            language: 'Limbă',
            notifications: 'Notificări',
            darkMode: 'Mod întunecat',
            logout: 'Deconectare',

            error: 'Eroare',
            success: 'Succes',
            errorGeneric: 'A apărut o eroare',
            errorNetwork: 'Nu există conexiune la internet',
            errorPhoto: 'Nu s-a putut încărca poza',
            errorLocation: 'Nu s-a putut determina locația',
            successSent: 'Cerere trimisă cu succes!',
            successOffer: 'Ofertă trimisă cu succes!',

            required: 'Câmp obligatoriu',
            invalidPhone: 'Număr de telefon invalid',
            invalidEmail: 'Email invalid',
            invalidZip: 'Cod poștal invalid',
            minPhotos: 'Este necesară cel puțin 1 poză'
        }
    },

    /**
     * Initialize i18n system
     */
    init() {
        // Check localStorage for saved language
        const savedLang = localStorage.getItem('schadens-chat-lang');
        if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        } else {
            // Auto-detect from browser
            const browserLang = navigator.language.split('-')[0];
            if (this.translations[browserLang]) {
                this.currentLang = browserLang;
            }
        }

        // Set document direction for RTL languages
        this.updateDirection();

        // Initial translation
        this.translatePage();

        console.log(`[i18n] Initialized with language: ${this.currentLang}`);
    },

    /**
     * Update document direction for RTL languages
     */
    updateDirection() {
        const rtlLanguages = ['ar', 'he', 'fa'];
        document.documentElement.dir = rtlLanguages.includes(this.currentLang) ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLang;
    },

    /**
     * Set current language
     * @param {string} lang - Language code (de, en, tr, ru, pl, ar)
     */
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`[i18n] Language '${lang}' not supported, falling back to ${this.fallbackLang}`);
            lang = this.fallbackLang;
        }

        this.currentLang = lang;
        localStorage.setItem('schadens-chat-lang', lang);
        this.updateDirection();
        this.translatePage();

        // Dispatch event for components that need to react
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    /**
     * Get translation for a key
     * @param {string} key - Translation key (dot notation supported)
     * @param {object} params - Parameters for interpolation
     * @returns {string} - Translated string
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        // Navigate through nested keys
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to default language
                value = this.translations[this.fallbackLang];
                for (const fk of keys) {
                    if (value && typeof value === 'object' && fk in value) {
                        value = value[fk];
                    } else {
                        console.warn(`[i18n] Missing translation for key: ${key}`);
                        return key;
                    }
                }
                break;
            }
        }

        // If we got a string, interpolate params
        if (typeof value === 'string') {
            return this.interpolate(value, params);
        }

        return value || key;
    },

    /**
     * Interpolate parameters into string
     * @param {string} str - String with {param} placeholders
     * @param {object} params - Key-value pairs for replacement
     */
    interpolate(str, params) {
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    },

    /**
     * Translate all elements with data-i18n attribute
     */
    translatePage() {
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', this.t(key));
        });

        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    },

    /**
     * Get available languages
     * @returns {Array} - Array of language objects
     */
    getAvailableLanguages() {
        return [
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'en', name: 'English', flag: '🇬🇧' },
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺' },
            { code: 'pl', name: 'Polski', flag: '🇵🇱' },
            { code: 'uk', name: 'Українська', flag: '🇺🇦' },
            { code: 'ro', name: 'Română', flag: '🇷🇴' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'ar', name: 'العربية', flag: '🇸🇦' }
        ];
    },

    /**
     * Get current language info
     */
    getCurrentLanguage() {
        return this.getAvailableLanguages().find(l => l.code === this.currentLang);
    }
};

// Shorthand function for translations
window.t = (key, params) => I18N.t(key, params);

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18N.init());
} else {
    I18N.init();
}

// Export for modules
window.I18N = I18N;
