import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getCycleSettings, getIntakeSettings } from "../utils/storage"
import SettingsPanel from "./Settings"
import ChangeTheme from "./ChangeTheme"
import api from "../axiosInstance"
import { getFcmToken } from "../utils/storage"
import ChangeIntakeTime from "./ChangeIntakeTime"
import RemindHome from "./RemindHome"
import NextNotification from "./NextNotification"
import InfoRemindHome from "./InfoRemindHome"

function Home() {

    const navigate = useNavigate()
    const [localIntakeSettings, setLocalIntakeSettings] = useState("") 
    const [localCycleSettings, setLocalCycleSettings] = useState({pillDays: "", breakDays: "", startDate: ""}) 
    const [isPillDay, setIsPillDay] = useState(true)
    const [settingsUpdated, setSettingsUpdated] = useState(false)
    const [pillTaken, setPillTaken] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchSettings  = async () => {
            const intake = await getIntakeSettings()
            const cycle = await getCycleSettings()

            console.log("intake and cycle: ", intake, cycle)

            if (intake){
                setLocalIntakeSettings(intake)
                console.log("localIntakeSettings:", localIntakeSettings)
            }

            if (cycle && cycle.pillDays && cycle.breakDays && cycle.startDate){
                setLocalCycleSettings(cycle)
            }
            
            if (!cycle || !cycle.pillDays || !cycle.breakDays || !cycle.startDate || !intake){
                console.log("Missing intake or cycle settings, redirecting to intake page.")
                navigate("/intake")
            }
        }
        
        fetchSettings()

        
        const checkPillDay = async () => {
            const fcmToken = getFcmToken()
            
            try{
                const response = await api.post("/is-pill-day", {
                    "fcmToken": fcmToken
                })

                if (response.data && typeof response.data.isPillDay === "boolean"){
                    setIsPillDay(response.data.isPillDay)
                    console.log("Set isPillDay from successful request", isPillDay)
                }else {
                    console.error("Unexpected response format:", response.data);
                    return false; // Return false if the format is not as expected

                }
            }catch(err) {
                console.error("Error checking pill day:", err)
                return false
            }
                
        }

        checkPillDay()

        const checkPillTaken = async () => {
            const fcmToken = getFcmToken()

            try {
                setIsLoading(true)
                const response = await api.get("/pill-taken", {
                    params: {"fcmToken": fcmToken}
                })
                if (response.data && typeof response.data.pillTaken === "boolean"){
                    setPillTaken(response.data.pillTaken)
                    console.log("Set pillTaken to ", response.data.pillTaken)
                }
                else {
                    console.error("Unexpected response format:", response.data);
                    return false; // Return false if the format is not as expected
                }
            }catch(err){
                console.error("Error checking pill day:", err)
                return false
            }
            setIsLoading(false)
        }

        checkPillTaken()
    }, [navigate, settingsUpdated])

    

    // Function to update settings from the settings panel
    async function updateSettings(){
        const intake = await getIntakeSettings()
        const cycle = await getCycleSettings()

        if (intake){
            setLocalIntakeSettings(intake)
        }

        if (cycle){
            setLocalCycleSettings(cycle)
        }

        // Trigger useEffect to re-run by updating the state
        setSettingsUpdated(prev => !prev)
    }

    // If settings are missing, don't render anything (since useEffect will handle redirecting)
    if (!localCycleSettings || !localIntakeSettings) {
        return null; // You could also render a loading or redirect message here
    }

    async function handlePillTaken (){
        const fcmToken = getFcmToken()
        const newPillTaken = !pillTaken

        try{
            setIsLoading(true)
            await api.post("/pill-taken", {
                "fcmToken": fcmToken,
                "isPillTaken": newPillTaken
            })

            setPillTaken(newPillTaken)

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
        }
        setIsLoading(false)
    }

    return(
        
        <div className="flex flex-col justify-center items-center min-h-screen">
            <div className="flex flex-row">
                <button className="btn btn-secondary absolute top-0 left-0 m-3" onClick={() => {navigate("/logs")}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Logs
                    </button>
                <SettingsPanel onSave={updateSettings}/>
            </div>
            
            {isPillDay ? (<div className="flex flex-col items-center justify-center">
                <button className="btn btn-circle h-60 w-60" onClick={handlePillTaken}>
                    {isLoading ? (<span className="loading loading-spinner w-32 h-32"></span>) :
                    pillTaken ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-48">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>) : 
                        (<svg className="size-48" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7" />  <path d="M8.5 8.5l7 7" /></svg>)}
                </button>
                {/*We pass the pillTaken state to the NextNotification Component
                so it can track when the user presses the pillTaken Button*/}
                <NextNotification pillTaken={pillTaken}/> 

                <div className="flex flex-row items-start justify-center">
                    <ChangeIntakeTime/>

                    <div className="flex flex-col items-center">
                        <RemindHome/>
                        <InfoRemindHome/>
                    </div>
                </div>
            </div>) : 
                (<div className="flex flex-col items-center justify-center">
                    <p className="text-6xl">Take a break!</p><br />
                    <p>It's one of your break days today no need to take your pill today</p>
                </div>)}
        </div>
    )
}

export default Home


{/*  */}