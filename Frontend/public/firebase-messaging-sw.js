importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
firebase.initializeApp({
  apiKey: "AIzaSyDpjfjGdQ3l7yWEqATd3YQ4NRpMvNSMwLk",
  authDomain: "pill-tracker-420d6.firebaseapp.com",
  projectId: "pill-tracker-420d6",
  storageBucket: "pill-tracker-420d6.appspot.com",
  messagingSenderId: "794655877560",
  appId: "1:794655877560:web:075a4f09ee1987599f874d",
  measurementId: "G-MPBX1WSPTS"
});

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload)

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'contraceptive-pill.png', 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
})