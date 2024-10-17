import { useEffect, useState } from "react"
import { saveCycleSettings, getCycleSettings, getIntakeSettings, saveIntakeSettings, getFcmToken } from "../../utils/storage"
import { useNavigate } from "react-router-dom";

import ChangeTheme from "../ChangeTheme"
import api from "../../axiosInstance";
// We want to check if the form is being used from the settings panel in which case we will tweak some things
function PillCycleForm({ isSettings, onSave }) { 

    const navigate = useNavigate()

    const [pillDays, setPillDays] = useState(isSettings ? "" : "");
    const [breakDays, setBreakDays] = useState(isSettings ? "" : "");
    const [startDate, setStartDate] = useState(isSettings ? "" : "");   
    const [intakeTime, setIntakeTime] = useState(isSettings ? "" : "");
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    useEffect(() => {

        const fetchData = async () => {
            if (isSettings) {
                const cycleSettings = await getCycleSettings();
                if (cycleSettings) {
                    setPillDays(cycleSettings.pillDays);
                    setBreakDays(cycleSettings.breakDays);
                    setStartDate(cycleSettings.startDate);
                    console.log("Fetched cycle data from settings panel: ", pillDays, breakDays, startDate)
                }

                const intakeSettings = await getIntakeSettings();
                if (intakeSettings) {
                    setIntakeTime(intakeSettings);
                }
            } else {
                const cycleSettings = await getCycleSettings();
                if (cycleSettings.breakDays && cycleSettings.pillDays && cycleSettings.startDate) {
                    console.log("Cycle Settings: ", cycleSettings);
                    navigate("/");
                }
            }
        };

        fetchData();

    }, [isSettings, navigate])


    async function handleSubmit() {
        const cycleData = { pillDays, breakDays, startDate }
        await saveCycleSettings(cycleData)
        
        if (isSettings){
            await saveIntakeSettings(intakeTime)
        }
        
        if (!isSettings){
            // if this is the initial pillCycleForm we want to schedule notifications on submit 
            // Otherwise the user wouldn't get any notifications until the next day even if his intake time is after he signed up
            // notifications for the user wouldn't be scheduled until midnight when all users notifications get scheduled
            const fcmToken = getFcmToken()
            await api.post("/schedule-notifications", {
                "fcmToken": fcmToken,
                "interval": true
            })
        }

        setIsSubmitted(true)

        //Check if onSave function is provided, if it is notify parent that Settings were modified
        if (onSave) {
            onSave();
        }

        //set isSubmitted to false so if the user is accessing through the settings panel
        // the submit button doesnt stay stuck on "saved Settings"
        setTimeout(() => {
            setIsSubmitted(false)
            navigate("/")
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

                    {isSettings && (
                        <div className="form-control w-60">
                        <label className="label">
                            <span className="label-text font-semibold">Intake Time</span>
                        </label>
                        <input
                            type="time"
                            value={intakeTime}
                            onChange={(e) => setIntakeTime(e.target.value)}
                            className="input input-bordered input-lg w-full text-center px-4 py-2"
                        />
                    </div>
                    )}

                    <button onClick={handleSubmit} className="btn btn-primary btn-lg mt-4">{isSubmitted ? "Saved Settings" : "Save"}</button>
                </div>
            </div>
        </div>
    )
}   

export default PillCycleForm