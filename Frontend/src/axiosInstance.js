// src/axiosInstance.js
import axios from 'axios';
import { toast } from 'react-toastify';

// This is the base URL through which all requests will run. This should be your servers URL
export const baseURL = 'http://localhost:5000'

const api = axios.create({
  baseURL: baseURL, 
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
      toast.error(`Error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('No response received from server. Please check your network connection.')
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Request error:', error.message);
      toast.error(`Request error: ${error.message}`)
    }
    
    return Promise.reject(error); // Reject the promise with the error object
  }
);

export default api;