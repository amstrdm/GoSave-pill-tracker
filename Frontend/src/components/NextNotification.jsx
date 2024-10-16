import { useState, useEffect } from "react";
import api from "../axiosInstance";
import { getFcmToken } from "../utils/storage";

function NextNotification({pillTaken}) {
  const [nextNotification, setNextNotification] = useState("");

  useEffect(() => {
    const fetchNextNotification = async () => {
      const fcmToken = getFcmToken();
      try {
        const response = await api.get("/next-notification", {
          params: { fcmToken: fcmToken }, // Corrected the parameter name
        });
        
        // Add conditional to check if remindHome db entry of user is true or not to display accordingly
        if (response.data.next_notification === null){
            setNextNotification("None")
        }else{
            setNextNotification(response.data.next_notification);
        }
        
      } catch (err) {
        console.error("Error fetching next notification:", err);
        setNextNotification("Error fetching Data from Server")
      }
    };
    fetchNextNotification();
  }, [pillTaken]); // We trigger useEffect when the pillTaken prop switches state since that means the user pressed the pillTaken button and we want to fetch the new Next Notification


  return (
    <p className="text-4xl mt-10 mx-5 font-bold">
      Next Notification: {nextNotification}
    </p>
  );
}

export default NextNotification;