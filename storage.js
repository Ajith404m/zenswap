const path = require('path');
const fs = require('fs-extra');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');

async function init() {
  await fs.ensureDir(DATA_DIR);
  await Promise.all([
    fs.pathExists(USERS_FILE).then((e) => (e ? null : fs.writeJson(USERS_FILE, []))),
    fs.pathExists(LISTINGS_FILE).then((e) => (e ? null : fs.writeJson(LISTINGS_FILE, []))),
    fs.pathExists(OFFERS_FILE).then((e) => (e ? null : fs.writeJson(OFFERS_FILE, {}))),
  ]);
}

async function readUsers() { return fs.readJson(USERS_FILE); }
async function writeUsers(v) { return fs.writeJson(USERS_FILE, v, { spaces: 2 }); }
async function readListings() { return fs.readJson(LISTINGS_FILE); }
async function writeListings(v) { return fs.writeJson(LISTINGS_FILE, v, { spaces: 2 }); }
async function readOffers() { return fs.readJson(OFFERS_FILE); }
async function writeOffers(v) { return fs.writeJson(OFFERS_FILE, v, { spaces: 2 }); }

module.exports = {
  init,
  readUsers, writeUsers,
  readListings, writeListings,
  readOffers, writeOffers,
};
