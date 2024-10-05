import { useEffect } from "react";
import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../axiosInstance";
 

function Notification() {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        // Wait for the service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Request the token
        const token = await getToken(messaging, {
          vapidKey: '***REMOVED***',
          serviceWorkerRegistration: registration, // Pass the service worker registration
        });

        if (token) {
          console.log("Token generated: ", token);
          
          // Send token to the backend
          await axiosInstance.post("/save-token", { token }, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("Token saved successfully:", token);
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
