import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDpjfjGdQ3l7yWEqATd3YQ4NRpMvNSMwLk",
    authDomain: "pill-tracker-420d6.firebaseapp.com",
    projectId: "pill-tracker-420d6",
    storageBucket: "pill-tracker-420d6.appspot.com",
    messagingSenderId: "794655877560",
    appId: "1:794655877560:web:075a4f09ee1987599f874d",
    measurementId: "G-MPBX1WSPTS"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export { messaging }