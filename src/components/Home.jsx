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
    const [intakeSettings, setIntakeSettings] = useState(getIntakeSettings()) 
    const [cycleSettings, setCycleSettings] = useState(getCycleSettings()) 

    useEffect(() => {
        if (!cycleSettings || !intakeSettings){
            navigate("/intake")
        }
        
    }, [ intakeSettings, cycleSettings, navigate])
    

    // Function to update settings from the settings panel
    function updateSettings(){
        setIntakeSettings(getIntakeSettings())
        setCycleSettings(getCycleSettings())
    }

    // If settings are missing, don't render anything (since useEffect will handle redirecting)
    if (!cycleSettings || !intakeSettings) {
        return null; // You could also render a loading or redirect message here
    }

    return(
        
        <div className="flex flex-col justify-center items-center min-h-screen">
            <SettingsPanel onSave={updateSettings}/>
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-6xl text-center font-bold">Home</h1> <br />
                <p className="text-2xl m-5">Intake Settings: {intakeSettings}</p><br />
                <p className="text-2xl m-5">Pill Days: {cycleSettings.pillDays}</p>
                <p className="text-2xl m-5">Break Days: {cycleSettings.breakDays}</p>
                <p className="text-2xl m-5">Start Date: {cycleSettings.startDate}</p>
            </div>
        </div>
    )
}

export default Home

