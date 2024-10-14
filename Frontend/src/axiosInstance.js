// src/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  // If the request succeeds, return the response
  response => response,
  
  // If the request fails, handle the error
  error => {
    // Check if the response exists (sometimes network errors won't have a response)
    if (error.response) {
      // The request was made and the server responded with a status code that is not in the range of 2xx
      console.error('Error response:', error.response);
      return Promise.reject(error.response); // Return the error response
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error); // Reject the promise with the error object
  }
);

export default api;