import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "***REMOVED***",
    projectId: "***REMOVED***",
    storageBucket: "***REMOVED***.appspot.com",
    messagingSenderId: "***REMOVED***",
    appId: "1:***REMOVED***:web:075a4f09ee1987599f874d",
    measurementId: "***REMOVED***"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export { messaging }