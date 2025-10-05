/**
 * ZenSwap API Test Script
 * Run this to test all API endpoints
 * Usage: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let sessionCookie = '';
let userId = '';
let listingId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        // Capture session cookie
        if (res.headers['set-cookie']) {
          sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        }
        
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  const res = await makeRequest('GET', '/api/health');
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 200;
}

async function testSignup() {
  console.log('\n🔍 Testing User Signup...');
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'test123456'
  };
  const res = await makeRequest('POST', '/api/auth/signup', userData);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  
  if (res.status === 201 && res.data.user) {
    userId = res.data.user.id;
    console.log(`📝 User ID saved: ${userId}`);
    return true;
  }
  return false;
}

async function testGetCurrentUser() {
  console.log('\n🔍 Testing Get Current User...');
  const res = await makeRequest('GET', '/api/auth/me');
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 200 && res.data.user;
}

async function testGetAllUsers() {
  console.log('\n🔍 Testing Get All Users...');
  const res = await makeRequest('GET', '/api/users');
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response: ${res.data.length} users found`);
  return res.status === 200 && Array.isArray(res.data);
}

async function testGetUserById() {
  console.log('\n🔍 Testing Get User by ID...');
  const res = await makeRequest('GET', `/api/users/${userId}`);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 200;
}

async function testUpdateUser() {
  console.log('\n🔍 Testing Update User...');
  const updateData = {
    name: 'Updated Test User'
  };
  const res = await makeRequest('PUT', `/api/users/${userId}`, updateData);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 200;
}

async function testCreateListing() {
  console.log('\n🔍 Testing Create Listing...');
  const listingData = {
    type: 'sell',
    title: 'Test iPhone 15',
    description: 'Brand new test listing',
    price: 999,
    currency: 'USD',
    location: 'Test City',
    condition: 'new',
    category: 'Electronics',
    tags: 'iphone,test,smartphone'
  };
  const res = await makeRequest('POST', '/api/listings', listingData);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  
  if (res.status === 201 && res.data.id) {
    listingId = res.data.id;
    console.log(`📝 Listing ID saved: ${listingId}`);
    return true;
  }
  return false;
}

async function testGetAllListings() {
  console.log('\n🔍 Testing Get All Listings...');
  const res = await makeRequest('GET', '/api/listings');
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response: ${res.data.length} listings found`);
  return res.status === 200 && Array.isArray(res.data);
}

async function testSearchListings() {
  console.log('\n🔍 Testing Search Listings...');
  const res = await makeRequest('GET', '/api/listings?q=iphone&type=sell');
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response: ${res.data.length} listings found`);
  return res.status === 200;
}

async function testUpdateListing() {
  console.log('\n🔍 Testing Update Listing...');
  const updateData = {
    price: 899,
    status: 'active'
  };
  const res = await makeRequest('PATCH', `/api/listings/${listingId}`, updateData);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 200;
}

async function testCreateOffer() {
  console.log('\n🔍 Testing Create Offer...');
  const offerData = {
    type: 'counter',
    message: 'Would you accept $850?',
    price: 850
  };
  const res = await makeRequest('POST', `/api/listings/${listingId}/offers`, offerData);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 201;
}

async function testGetOffers() {
  console.log('\n🔍 Testing Get Offers...');
  const res = await makeRequest('GET', `/api/listings/${listingId}/offers`);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response: ${res.data.length} offers found`);
  return res.status === 200;
}

async function testDeleteListing() {
  console.log('\n🔍 Testing Delete Listing...');
  const res = await makeRequest('DELETE', `/api/listings/${listingId}`);
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 200;
}

async function testLogout() {
  console.log('\n🔍 Testing Logout...');
  const res = await makeRequest('POST', '/api/auth/logout');
  console.log(`✅ Status: ${res.status}`);
  console.log(`Response:`, res.data);
  return res.status === 200;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting ZenSwap API Tests...\n');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Signup', fn: testSignup },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Get All Users', fn: testGetAllUsers },
    { name: 'Get User by ID', fn: testGetUserById },
    { name: 'Update User', fn: testUpdateUser },
    { name: 'Create Listing', fn: testCreateListing },
    { name: 'Get All Listings', fn: testGetAllListings },
    { name: 'Search Listings', fn: testSearchListings },
    { name: 'Update Listing', fn: testUpdateListing },
    { name: 'Create Offer', fn: testCreateOffer },
    { name: 'Get Offers', fn: testGetOffers },
    { name: 'Delete Listing', fn: testDeleteListing },
    { name: 'Logout', fn: testLogout },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
    }
    console.log('=' .repeat(50));
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${tests.length}`);
  console.log(`🎯 Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your ZenSwap API is working perfectly!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the output above.');
  }
}

// Run tests
runAllTests().catch(console.error);
