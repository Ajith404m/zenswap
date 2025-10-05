require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Listing = require('./models/Listing');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const sampleListings = [
  {
    type: 'sell',
    title: 'iPhone 13, 128GB Midnight',
    description: 'Gently used, great battery. Includes box and cable.',
    price: 399,
    currency: 'USD',
    location: 'Bangalore, IN',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1603898037225-1bea09f5c3d8?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    status: 'active',
    category: 'Electronics',
    tags: 'iphone,apple,phone',
  },
  {
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
    status: 'active',
    category: 'Sports',
    tags: 'bike,mountain,rent',
  },
  {
    type: 'exchange',
    title: 'Trade Nintendo Switch for PS5 Controller',
    description: 'Switch v2 in good condition, looking for DualSense + cash.',
    currency: 'USD',
    location: 'Chennai, IN',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1605901309584-818e25960a8b?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    exchangeDesired: 'PS5 Controller in white + ₹1000',
    status: 'active',
    category: 'Gaming',
    tags: 'nintendo,switch,exchange',
  },
  {
    type: 'sell',
    title: 'MacBook Air M1, 8GB RAM, 256GB SSD',
    description: 'Barely used, perfect for students. Comes with charger.',
    price: 650,
    currency: 'USD',
    location: 'Mumbai, IN',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    status: 'active',
    category: 'Electronics',
    tags: 'laptop,macbook,apple',
  },
  {
    type: 'sell',
    title: 'Samsung 55" 4K Smart TV',
    description: '2 years old, works perfectly. Wall mount included.',
    price: 350,
    currency: 'USD',
    location: 'Bangalore, IN',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    status: 'active',
    category: 'Electronics',
    tags: 'tv,samsung,smart',
  },
  {
    type: 'sell',
    title: 'Nike Air Max Sneakers (Size 10)',
    description: 'Worn twice, like new. Original box included.',
    price: 90,
    currency: 'USD',
    location: 'Mumbai, IN',
    condition: 'like new',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    status: 'active',
    category: 'Fashion',
    tags: 'shoes,nike,sneakers',
  },
  {
    type: 'buy',
    title: 'Looking for PS5 Console (Used OK)',
    description: 'Willing to pay fair price. Disc version preferred.',
    price: 400,
    currency: 'USD',
    location: 'Hyderabad, IN',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    status: 'active',
    category: 'Gaming',
    tags: 'ps5,playstation,buy',
  },
  {
    type: 'rent',
    title: 'Canon EOS R6 Camera + Lens Kit',
    description: 'Professional mirrorless camera for events/shoots. Daily rental.',
    price: 50,
    currency: 'USD',
    location: 'Delhi, IN',
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1606980624314-0b4e6c8c9b7f?q=80&w=1200&auto=format&fit=crop'],
    owner: { id: 'demo', name: 'Demo User', email: 'demo@example.com', phone: '' },
    availability: { start: '2025-10-10', end: '2025-12-31' },
    status: 'active',
    category: 'Photography',
    tags: 'camera,canon,rent',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas');

    // Create demo user
    console.log('\nCreating demo user...');
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash('demo123', 10);
      const demoUser = new User({
        name: 'Demo User',
        email: 'demo@example.com',
        password: passwordHash,
      });
      await demoUser.save();
      console.log('✓ Demo user created (email: demo@example.com, password: demo123)');
    } else {
      console.log('✓ Demo user already exists');
    }

    // Clear existing listings
    console.log('\nClearing existing listings...');
    await Listing.deleteMany({});
    console.log('✓ Listings cleared');

    // Insert sample listings
    console.log('\nInserting sample listings...');
    await Listing.insertMany(sampleListings);
    console.log(`✓ Added ${sampleListings.length} sample listings`);

    console.log('\n✅ Seed complete!');
    console.log('\nYou can now:');
    console.log('1. Login with: demo@example.com / demo123');
    console.log('2. Browse listings in the app');
    console.log('3. Create new listings');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
