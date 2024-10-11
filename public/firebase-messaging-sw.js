importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
firebase.initializeApp({
  apiKey: "***REMOVED***",
  authDomain: "***REMOVED***",
  projectId: "***REMOVED***",
  storageBucket: "***REMOVED***.appspot.com",
  messagingSenderId: "***REMOVED***",
  appId: "1:***REMOVED***:web:075a4f09ee1987599f874d",
  measurementId: "***REMOVED***"
});

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload)

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './contraceptive-pill.png', 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
})