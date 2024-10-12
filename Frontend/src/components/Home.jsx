/*
    TODO:
    // 1. 


*/ 




import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getCycleSettings, getIntakeSettings } from "../utils/storage"
import SettingsPanel from "./Settings"

function Home() {

    const navigate = useNavigate()
    const [localIntakeSettings, setLocalIntakeSettings] = useState("") 
    const [localCycleSettings, setLocalCycleSettings] = useState({pillDays: "", breakDays: "", startDate: ""}) 

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
        
    }, [navigate])
    

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
    }

    // If settings are missing, don't render anything (since useEffect will handle redirecting)
    if (!localCycleSettings || !localIntakeSettings) {
        return null; // You could also render a loading or redirect message here
    }

    return(
        
        <div className="flex flex-col justify-center items-center min-h-screen">
            <SettingsPanel onSave={updateSettings}/>
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-6xl text-center font-bold">Home</h1> <br />
                <p className="text-2xl m-5">Intake Settings: {localIntakeSettings}</p><br />
                <p className="text-2xl m-5">Pill Days: {localCycleSettings.pillDays}</p>
                <p className="text-2xl m-5">Break Days: {localCycleSettings.breakDays}</p>
                <p className="text-2xl m-5">Start Date: {localCycleSettings.startDate}</p>
            </div>
        </div>
    )
}

export default Home

