/**
 * SchadensChat-App - Mock Data for Tests
 */

const mockWorkshops = [
  {
    id: 'workshop-1',
    name: 'Auto Lackierzentrum Mosbach',
    email: 'info@auto-lackierzentrum.de',
    phone: '+49 6261 123456',
    address: 'Industriestrasse 10, 74821 Mosbach',
    zip: '74821',
    zipPrefix: '74',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'workshop-2',
    name: 'Karosserie Mueller',
    email: 'info@karosserie-mueller.de',
    phone: '+49 6221 987654',
    address: 'Hauptstrasse 5, 69117 Heidelberg',
    zip: '69117',
    zipPrefix: '69',
    active: true,
    createdAt: new Date().toISOString()
  }
];

const mockRequests = [
  {
    id: 'request-1',
    status: 'new',
    customerId: 'customer-1',
    photos: ['https://placehold.co/400x300/jpeg'],
    damage: {
      type: 'dent',
      location: 'fenderFrontLeft',
      description: 'Kleine Delle durch Parkrempler'
    },
    vehicle: {
      plate: 'MOS-AB 123',
      brand: 'BMW',
      model: '3er',
      year: '2020',
      color: 'schwarz'
    },
    location: {
      lat: 49.3517,
      lng: 9.1380,
      address: 'Bahnhofstrasse 1, 74821 Mosbach',
      zip: '74821',
      radius: 25
    },
    contact: {
      name: 'Max Mustermann',
      phone: '+49 170 1234567',
      email: 'max@test.de'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'request-2',
    status: 'offers_received',
    customerId: 'customer-2',
    photos: ['https://placehold.co/400x300/jpeg', 'https://placehold.co/400x300/jpeg'],
    damage: {
      type: 'scratch',
      location: 'doorLeft',
      description: 'Tiefer Kratzer an der Fahrertuer'
    },
    vehicle: {
      plate: 'HD-XY 456',
      brand: 'Mercedes',
      model: 'C-Klasse',
      year: '2019',
      color: 'silber'
    },
    location: {
      lat: 49.4094,
      lng: 8.6944,
      address: 'Hauptstrasse 50, 69117 Heidelberg',
      zip: '69117',
      radius: 30
    },
    contact: {
      name: 'Anna Schmidt',
      phone: '+49 171 9876543',
      email: 'anna@test.de'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString()
  }
];

const mockOffers = [
  {
    id: 'offer-1',
    requestId: 'request-2',
    workshopId: 'workshop-1',
    workshopName: 'Auto Lackierzentrum Mosbach',
    price: 450,
    duration: 2,
    description: 'Professionelle Kratzerreparatur mit Lackierung',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-2',
    requestId: 'request-2',
    workshopId: 'workshop-2',
    workshopName: 'Karosserie Mueller',
    price: 520,
    duration: 3,
    description: 'Komplette Instandsetzung der Fahrertuer',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

const mockMessages = [
  {
    id: 'msg-1',
    requestId: 'request-2',
    senderId: 'workshop-1',
    senderType: 'workshop',
    text: 'Guten Tag! Wir haben Ihr Anliegen erhalten.',
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'msg-2',
    requestId: 'request-2',
    senderId: 'customer-2',
    senderType: 'customer',
    text: 'Danke! Wann waere ein Termin moeglich?',
    read: true,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const mockSubscriptions = {
  trial: {
    plan: 'trial',
    status: 'active',
    price: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    requestsUsed: 0,
    requestLimit: 999
  },
  starter: {
    plan: 'starter',
    status: 'active',
    price: 49,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    requestsUsed: 5,
    requestLimit: 20
  },
  professional: {
    plan: 'professional',
    status: 'active',
    price: 99,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    requestsUsed: 25,
    requestLimit: 100
  },
  enterprise: {
    plan: 'enterprise',
    status: 'active',
    price: 199,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    requestsUsed: 150,
    requestLimit: -1 // Unlimited
  }
};

const damageTypes = ['dent', 'scratch', 'paint', 'crack', 'rust', 'other'];
const damageLocations = [
  'frontBumper', 'rearBumper', 'hood', 'roof', 'trunk',
  'doorLeft', 'doorRight', 'fenderFrontLeft', 'fenderFrontRight',
  'fenderRearLeft', 'fenderRearRight', 'mirror', 'other'
];

module.exports = {
  mockWorkshops,
  mockRequests,
  mockOffers,
  mockMessages,
  mockSubscriptions,
  damageTypes,
  damageLocations
};
