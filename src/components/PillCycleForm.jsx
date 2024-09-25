import { useEffect, useState } from "react"
import { saveCycleSettings, getCycleSettings } from "../utils/storage"
import { useNavigate } from "react-router-dom";

import ChangeTheme from "./ChangeTheme"
// We want to check if the form is being used from the settings panel in which case we will tweak some things
function PillCycleForm({ isSettings, onSave }) { 

    const navigate = useNavigate()
    let storedPillDays, storedBreakDays, storedStartDate 

    if(isSettings && getCycleSettings()) {
        ({ pillDays: storedPillDays, breakDays: storedBreakDays, startDate: storedStartDate } = getCycleSettings())
        console.log("get cycle settings", getCycleSettings())
        console.log("storedPillDays: ", storedPillDays)
        
    }

    console.log("storedPillDays: " + storedPillDays)
    const [pillDays, setPillDays] = isSettings ? useState(storedPillDays) : useState("")
    const [breakDays, setBreakDays] = isSettings ? useState(storedBreakDays) : useState("")
    const [startDate, setStartDate] = isSettings ? useState(storedStartDate) : useState("")   

    const [isSubmitted, setisSubmitted] = useState(false)
    
    useEffect(() => {

        const cycleSettings = getCycleSettings()
        if (cycleSettings && !isSettings){
            navigate("/")
        }else{
            console.log("No Cycle Data found or accesing from Settings Panel")
        }
    }, [])


    function handleSubmit() {
        const cycleData = { pillDays, breakDays, startDate }
        saveCycleSettings(cycleData)
        console.log("Cycle Data saved to Local Storage")

        setisSubmitted(true)

        //Check if onSave function is provided, if it is notify parent that Settings were modified
        if (onSave) {
            onSave();
        }
      

        setTimeout(() => {
            setisSubmitted(false)
        }, 500)
    }

    return(
        <div className={`relative ${isSettings ? "" : "min-h-screen"} overflow-x-hidden overflow-y-hidden`}>
            {isSettings ? null : <ChangeTheme />}
            
            <div className={`${isSettings ? "" : "min-h-screen"} flex flex-col justify-center items-center`}>
                <h1 className="text-4xl font-bold text-center mb-6">{isSettings ? "Settings" : "Set your pill cycle"}</h1>

                <div className="flex flex-col items-center space-y-6">
                    <div className="form-control w-60">
                        <label className="label">
                            <span className="label-text font-semibold">Pill intake days</span>
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={pillDays}
                            onChange={(e) => setPillDays(e.target.value)}
                            className="input input-bordered input-lg w-full text-center px-4 py-2"
                        />
                    </div>

                    <div className="form-control w-60">
                        <label className="label">
                            <span className="label-text font-semibold">Break days</span>
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={breakDays}
                            onChange={(e) => setBreakDays(e.target.value)}
                            className="input input-bordered input-lg w-full text-center px-4 py-2"
                        />
                    </div>

                    <div className="form-control w-60">
                        <label className="label">
                            <span className="label-text font-semibold">Start date of cycle</span>
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input input-bordered input-lg w-full text-center px-4 py-2"
                        />
                    </div>

                    <button onClick={handleSubmit} className="btn btn-primary btn-lg mt-4">{isSubmitted ? "Saved Settings" : "Save"}</button>
                </div>
            </div>
        </div>
    )
}   

export default PillCycleForm