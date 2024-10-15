import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getCycleSettings, getIntakeSettings } from "../utils/storage"
import SettingsPanel from "./Settings"
import ChangeTheme from "./ChangeTheme"
import api from "../axiosInstance"
import { getFcmToken } from "../utils/storage"

function Home() {

    const navigate = useNavigate()
    const [localIntakeSettings, setLocalIntakeSettings] = useState("") 
    const [localCycleSettings, setLocalCycleSettings] = useState({pillDays: "", breakDays: "", startDate: ""}) 
    const [isPillDay, setIsPillDay] = useState(false)
    const [settingsUpdated, setSettingsUpdated] = useState(false)
    const [pillTaken, setPillTaken] = useState(false)

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
    }

    function handleChangeIntakeTime(){

    }

    function handleRemindWhenHome(){

    }

    return(
        
        <div className="flex flex-col justify-center items-center min-h-screen">
            <SettingsPanel onSave={updateSettings}/>
            <ChangeTheme />
            {isPillDay ? (<div className="flex flex-col items-center justify-center">
                <button className="btn btn-circle h-60 w-60" onClick={handlePillTaken}>
                    {pillTaken ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>) : (<svg className="size-48" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7" />  <path d="M8.5 8.5l7 7" /></svg>)}
                </button>

                <p className="text-4xl mt-10 font-bold">Current Intake Time: 20:00 </p>

                <div className="flex flex-row items-center justify-center">
                    <button className="btn mt-12 ml-5 mr-5" onClick={handleChangeIntakeTime}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>Change Intake Time
                    </button>
                    <button className="btn mt-12 ml-5 mr-5" onClick={handleRemindWhenHome}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>Remind when Home
                    </button>
                </div>
            </div>) : 
                (<div className="flex flex-col items-center justify-center">
                    <p className="text-6xl">Take a break!</p><br />
                    <p>It's one of your break days right now no need to take your pill today</p>
                </div>)}
        </div>
    )
}

export default Home

