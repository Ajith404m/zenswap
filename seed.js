const storage = require('./storage');

const sampleListings = [
  {
    id: 'seed-1',
    type: 'sell',
    title: 'iPhone 13, 128GB Midnight',
    description: 'Gently used, great battery. Includes box and cable.',
    price: 399,
    currency: 'USD',
    location: 'Bangalore, IN',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1603898037225-1bea09f5c3d8?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: null,
    exchangeDesired: '',
    status: 'active',
    category: 'Electronics',
    tags: 'iphone,apple,phone',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-2',
    type: 'rent',
    title: 'Mountain Bike (M) - Weekend Rental',
    description: 'Hardtail MTB, helmet included. Pickup near Indiranagar.',
    price: 15,
    currency: 'USD',
    location: 'Bangalore, IN',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: { start: '2025-10-05', end: '2025-12-31' },
    exchangeDesired: '',
    status: 'active',
    category: 'Sports',
    tags: 'bike,mountain,rent',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-3',
    type: 'exchange',
    title: 'Trade Nintendo Switch for PS5 Controller',
    description: 'Switch v2 in good condition, looking for DualSense + cash.',
    price: null,
    currency: 'USD',
    location: 'Chennai, IN',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1605901309584-818e25960a8b?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: null,
    exchangeDesired: 'PS5 Controller in white + ₹1000',
    status: 'active',
    category: 'Gaming',
    tags: 'nintendo,switch,exchange',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-4',
    type: 'sell',
    title: 'MacBook Air M1, 8GB RAM, 256GB SSD',
    description: 'Barely used, perfect for students. Comes with charger.',
    price: 650,
    currency: 'USD',
    location: 'Mumbai, IN',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: null,
    exchangeDesired: '',
    status: 'active',
    category: 'Electronics',
    tags: 'laptop,macbook,apple',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-5',
    type: 'sell',
    title: 'Samsung 55" 4K Smart TV',
    description: '2 years old, works perfectly. Wall mount included.',
    price: 350,
    currency: 'USD',
    location: 'Bangalore, IN',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: null,
    exchangeDesired: '',
    status: 'active',
    category: 'Electronics',
    tags: 'tv,samsung,smart',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-6',
    type: 'sell',
    title: 'Nike Air Max Sneakers (Size 10)',
    description: 'Worn twice, like new. Original box included.',
    price: 90,
    currency: 'USD',
    location: 'Mumbai, IN',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: null,
    exchangeDesired: '',
    status: 'active',
    category: 'Fashion',
    tags: 'shoes,nike,sneakers',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-7',
    type: 'sell',
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Noise cancelling, barely used. Case + cable included.',
    price: 180,
    currency: 'USD',
    location: 'Delhi, IN',
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: null,
    exchangeDesired: '',
    status: 'active',
    category: 'Electronics',
    tags: 'headphones,sony,audio',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-8',
    type: 'buy',
    title: 'Looking for PS5 Console (Used OK)',
    description: 'Willing to pay fair price. Disc version preferred.',
    price: 400,
    currency: 'USD',
    location: 'Hyderabad, IN',
    condition: '',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: null,
    exchangeDesired: '',
    status: 'active',
    category: 'Gaming',
    tags: 'ps5,playstation,buy',
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  try {
    await storage.init();
    console.log('✓ Storage initialized');
    
    await storage.writeListings(sampleListings);
    console.log(`✓ Added ${sampleListings.length} sample listings`);
    
    console.log('\n✅ Seed complete! Restart your server to see the listings.');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  }
}

seed();
