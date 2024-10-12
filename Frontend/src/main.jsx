import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

// Wait for the service worker to be ready before rendering the app
navigator.serviceWorker.ready.then(() => {
  createRoot(document.getElementById('root')).render(
    //<StrictMode>
      <App />
    //</StrictMode>,
  );
});
