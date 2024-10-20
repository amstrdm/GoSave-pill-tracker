
import { useEffect, useState } from "react";
import api from "../axiosInstance";
import { getFcmToken } from "../utils/storage";



function RemindHome() {
    const [isLoading, setIsLoading] = useState(false)
    const [waitingForHome, setWaitingForHome] = useState(false)
    useEffect(() => {
        async function checkWaitingHome() {
            const fcmToken = getFcmToken()
            try{
                const response = await api.get("/remind-when-home", {
                    params:{ fcmToken: fcmToken }
                })

                if (response.data && typeof response.data.waitingForHome == "boolean"){
                    setWaitingForHome(response.data.waitingForHome)
                    console.log("Set waitingForHome to ", response.data.waitingForHome)
                }else{
                    console.log("Unecpected response format:", response.data)
                    return false
                }
            }catch{
                console.log("Error fetching waitingHome from Server")
                return false
            }
        }
        checkWaitingHome()
    }, [])


    async function handleRemindWhenHome(){
        const fcmToken = getFcmToken()
        const newWaitingForHome = !waitingForHome
        try{
            setIsLoading(true)
            await api.post("/remind-when-home", {
                "fcmToken": fcmToken,
                "waitingForHome": newWaitingForHome,
                "isHome": false
            })
            setWaitingForHome(newWaitingForHome)

        }catch(err){
            if (err.response) {
                // The request was made, and the server responded with a status code outside 2xx
                console.error('Server responded with status:', err.response.status);
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received:', err.request);
            } else {
                // Something else happened in setting up the request
                console.error('Error in setting up request:', err.message);
            }
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <button className="btn mt-12 ml-5 mr-5" onClick={handleRemindWhenHome}>
            {isLoading ? (
                <>
                    <span className="loading loading-spinner loading-md"></span> 
                    Loading...
                </>
                ) : waitingForHome ? (
                <>
                    <span className="loading loading-ring loading-md"></span> 
                    Waiting for you to get Home...
                </>
                ) : (
                    <>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className="size-6"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" 
                            />
                        </svg>
                        Remind when Home
                    </>
                    
                )}
        </button>
    )
}

export default RemindHome;
