import { useEffect } from "react";
import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";
import api from "../axiosInstance";
 import { saveFcmToken } from "../utils/storage";

function Notification() {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        // Wait for the service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Request the token
        const token = await getToken(messaging, {
          vapidKey: 'BK0qwUVTs45pLrpte0VlRRYkQyQfzAKwIINcrj_R1B-dtYIWUZKV5aS4F5ii-XhXT5ZSZG9YqLIjBRm54CcVkwI',
          serviceWorkerRegistration: registration, // Pass the service worker registration
        });

        if (token) {
          console.log("Token generated: ", token);
          
          // save token to local storage
          saveFcmToken(token)

          // Send token to the backend
          await api.post("/save-token", {
            "fcmToken": token
          });
          console.log("Token saved to database successfully:", token);
        } else {
          console.log("No registration token available.");
        }
      } catch (err) {
        console.error("Error getting token: ", err);
      }
    };

    // Handle incoming messages while the app is in the foreground
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
    });

    requestPermission();

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}

export default Notification;
