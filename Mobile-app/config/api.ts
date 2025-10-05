import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  // Production API URL - Update this with your deployed backend URL
  BASE_URL: __DEV__
    ? 'https://snap2print-api.onrender.com' // Replace with your Render/Production URL
    : 'https://snap2print-api.onrender.com', // Production URL (same for now)
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,
  
  // Enable/disable request/response logging
  DEBUG: __DEV__,
  
  // Platform specific configurations
  PLATFORM: {
    OS: Platform.OS,
    Version: Platform.Version,
  },
};

// Get full API URL
export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${path}`;
};

// Common headers for all requests
export const getDefaultHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Platform': API_CONFIG.PLATFORM.OS,
    'X-Platform-Version': String(API_CONFIG.PLATFORM.Version),
    'X-App-Version': '1.0.0', // Replace with your app version
  };

  // Add Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Error handler for API responses
export const handleApiError = async (error: any): Promise<never> => {
  if (error.response) {
    // Server responded with a status code outside 2xx
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
    throw error.response.data || { message: 'An error occurred' };
  } else if (error.request) {
    // Request was made but no response received
    console.error('API Request Error:', error.request);
    throw { message: 'No response from server. Please check your internet connection.' };
  } else {
    // Something happened in setting up the request
    console.error('API Setup Error:', error.message);
    throw { message: error.message || 'An unexpected error occurred' };
  }
};
