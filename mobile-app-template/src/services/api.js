import axios from 'axios';

// Update this to your computer's local IP address
// Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: http://192.168.1.100:3006
const API_BASE_URL = 'http://localhost:3006/api';

// For testing on real device, use your computer's IP:
// const API_BASE_URL = 'http://192.168.1.XXX:3006/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Listings API
export const fetchListings = async (params = {}) => {
  try {
    const response = await api.get('/listings', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const fetchListingById = async (id) => {
  try {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

export const createListing = async (listingData) => {
  try {
    const response = await api.post('/listings', listingData);
    return response.data;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

// Auth API
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const signup = async (name, email, password) => {
  try {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Offers API
export const createOffer = async (listingId, offerData) => {
  try {
    const response = await api.post(`/listings/${listingId}/offers`, offerData);
    return response.data;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export default api;
