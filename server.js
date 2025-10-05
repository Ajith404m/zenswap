require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');
const connectDB = require('./config/database');

// MongoDB Models
const User = require('./models/User');
const Listing = require('./models/Listing');
const Offer = require('./models/Offer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Sessions (MVP, in-memory store)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'zenswap_dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 days
  })
);

// Uploads setup
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const disk = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, unique + ext);
  },
});
const upload = multer({ storage: disk, limits: { fileSize: 5 * 1024 * 1024, files: 6 } });

// Helpers
const makeId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const nowIso = () => new Date().toISOString();

function validateListing(payload) {
  const required = ['type', 'title'];
  for (const k of required) {
    if (!payload[k] || String(payload[k]).trim() === '') return `Missing field: ${k}`;
  }
  const allowedTypes = ['sell', 'buy', 'exchange', 'rent'];
  if (!allowedTypes.includes(payload.type)) return 'Invalid type. Allowed: sell, buy, exchange, rent';
  return null;
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'ZenSwap', time: nowIso() });
});

// Auth routes
app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
  const emailNorm = String(email).toLowerCase();
  
  // Check if user exists
  const existingUser = await User.findOne({ email: emailNorm });
  if (existingUser) return res.status(409).json({ error: 'Email already in use' });
  
  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = new User({
    name: String(name).trim(),
    email: emailNorm,
    password: passwordHash,
  });
  
  await user.save();
  req.session.user = { id: user._id.toString(), name: user.name, email: user.email };
  res.status(201).json({ user: req.session.user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const emailNorm = String(email).toLowerCase();
  
  const user = await User.findOne({ email: emailNorm });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const ok = await bcrypt.compare(String(password), user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  
  req.session.user = { id: user._id.toString(), name: user.name, email: user.email };
  res.json({ user: req.session.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// User CRUD APIs
// Get all users (admin/testing purpose - exclude password hashes)
app.get('/api/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, createdAt: u.createdAt })));
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt });
});

// Update user (requires auth and must be own profile)
app.put('/api/users/:id', requireAuth, async (req, res) => {
  if (req.session.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden: can only update own profile' });
  }
  
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (req.body.name) user.name = String(req.body.name).trim();
  if (req.body.email) {
    const emailNorm = String(req.body.email).toLowerCase();
    // Check if email already exists for another user
    const existing = await User.findOne({ email: emailNorm, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    user.email = emailNorm;
  }
  if (req.body.password) {
    user.password = await bcrypt.hash(String(req.body.password), 10);
  }
  
  await user.save();
  req.session.user = { id: user._id.toString(), name: user.name, email: user.email };
  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  });
});

// Delete user (requires auth and must be own profile)
app.delete('/api/users/:id', requireAuth, async (req, res) => {
  if (req.session.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden: can only delete own profile' });
  }
  
  await User.findByIdAndDelete(req.params.id);
  
  // Also delete user's listings
  await Listing.deleteMany({ 'owner.id': req.params.id });
  
  req.session.destroy(() => {
    res.json({ ok: true, message: 'User deleted successfully' });
  });
});

// Create listing
app.post('/api/listings', requireAuth, async (req, res) => {
  const error = validateListing(req.body || {});
  if (error) return res.status(400).json({ error });

  const listing = new Listing({
    type: req.body.type,
    title: String(req.body.title).trim(),
    description: (req.body.description || '').toString(),
    price: req.body.price != null ? Number(req.body.price) : null,
    currency: (req.body.currency || 'USD').toString(),
    location: (req.body.location || '').toString(),
    condition: (req.body.condition || '').toString(),
    images: Array.isArray(req.body.images) ? req.body.images.slice(0, 6) : [],
    owner: {
      id: req.session.user.id,
      name: req.session.user.name,
      email: req.session.user.email,
      phone: (req.body.owner?.phone || '').toString(),
    },
    availability: req.body.availability || null,
    exchangeDesired: (req.body.exchangeDesired || '').toString(),
    status: 'active',
    category: (req.body.category || '').toString(),
    tags: (req.body.tags || '').toString(),
  });
  
  await listing.save();
  res.status(201).json(listing);
});

// Get listings with optional filters: type, q, location, category, tags, price range, condition, status
app.get('/api/listings', async (req, res) => {
  const { type, q, location, category, tags, priceMin, priceMax, condition, status } = req.query;
  
  let query = {};
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (category) query.category = new RegExp(category, 'i');
  if (condition) query.condition = new RegExp(condition, 'i');
  if (location) query.location = new RegExp(location, 'i');
  if (tags) query.tags = new RegExp(tags, 'i');
  
  if (priceMin != null || priceMax != null) {
    query.price = {};
    if (priceMin != null) query.price.$gte = Number(priceMin);
    if (priceMax != null) query.price.$lte = Number(priceMax);
  }
  
  if (q) {
    query.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { tags: new RegExp(q, 'i') },
      { exchangeDesired: new RegExp(q, 'i') },
    ];
  }
  
  const results = await Listing.find(query).sort({ createdAt: -1 });
  res.json(results);
});

// Update listing (partial)
app.patch('/api/listings/:id', async (req, res) => {
  const allowed = ['title', 'description', 'price', 'currency', 'location', 'condition', 'images', 'availability', 'exchangeDesired', 'status', 'category', 'tags'];
  const updates = {};
  for (const k of allowed) {
    if (k in req.body) updates[k] = req.body[k];
  }
  
  const listing = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!listing) return res.status(404).json({ error: 'Not found' });
  res.json(listing);
});

// Delete listing
app.delete('/api/listings/:id', async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  
  // Also delete related offers
  await Offer.deleteMany({ listingId: req.params.id });
  res.json({ ok: true });
});

// Create offer for a listing (e.g., counter, inquiry)
app.post('/api/listings/:id/offers', requireAuth, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  
  const offer = new Offer({
    listingId: req.params.id,
    message: (req.body.message || '').toString(),
    price: req.body.price != null ? Number(req.body.price) : null,
    from: {
      id: req.session.user.id,
      name: req.session.user.name,
      email: req.session.user.email,
    },
  });
  
  await offer.save();
  res.status(201).json(offer);
});

// Get offers for a listing
app.get('/api/listings/:id/offers', async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  const offers = await Offer.find({ listingId: req.params.id }).sort({ createdAt: -1 });
  res.json(offers);
});

// Upload endpoint
app.post('/api/uploads', requireAuth, upload.array('files', 6), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/${path.basename(f.path)}`);
  res.json({ urls });
});

// Gate the app: require auth before showing home
app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login.html');
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Redirect logged-in users away from auth pages
app.get('/login.html', (req, res) => {
  if (req.session.user) return res.redirect('/');
  return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup.html', (req, res) => {
  if (req.session.user) return res.redirect('/');
  return res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve static
app.use('/uploads', express.static(uploadDir));
app.use('/', express.static(path.join(__dirname, 'public')));

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZenSwap server running on http://localhost:${PORT}`);
    console.log(`Network access: http://10.53.241.208:${PORT}`);
    console.log(`Database: MongoDB Atlas`);
  });
}).catch((err) => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
