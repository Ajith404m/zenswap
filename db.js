const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_FILE = process.env.SQLITE_PATH || path.join(__dirname, 'zenswap.db');
const db = new Database(DB_FILE);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price REAL,
  currency TEXT,
  location TEXT,
  condition TEXT,
  images_json TEXT,
  owner_id TEXT NOT NULL,
  owner_phone TEXT,
  availability_start TEXT,
  availability_end TEXT,
  exchange_desired TEXT,
  status TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_title ON listings(title);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  type TEXT,
  message TEXT,
  price REAL,
  from_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (from_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id);
`);

function rowToListing(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description || '',
    price: row.price != null ? Number(row.price) : null,
    currency: row.currency || 'USD',
    location: row.location || '',
    condition: row.condition || '',
    images: row.images_json ? JSON.parse(row.images_json) : [],
    owner: { id: row.owner_id, name: row.owner_name || '', email: row.owner_email || '', phone: row.owner_phone || '' },
    availability: (row.availability_start || row.availability_end) ? { start: row.availability_start || null, end: row.availability_end || null } : null,
    exchangeDesired: row.exchange_desired || '',
    status: row.status,
    category: row.category || '',
    tags: row.tags || '',
    createdAt: row.created_at,
  };
}

module.exports = {
  db,
  rowToListing,
};
