import { useState } from "react";
import { Navigate } from "react-router-dom";
import { saveIntakeSettings, getIntakeSettings } from "../utils/storage";
import ChangeTheme from "./ChangeTheme";

export const IntakeForm = () => {
    const [intakeTime, setIntakeTime] = useState("")    

    function handleSubmit(){
        saveIntakeSettings(intakeTime)
        
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden overflow-y-hidden">
            
            <ChangeTheme />
            <div className="flex flex-col justify-center items-center h-screen space-y-6">

                <h1 className="text-4xl font-bold text-center mb-6">At which time would you like to take your pill?</h1>
                <input type="time" value={intakeTime} onChange={(e) => setIntakeTime(e.target.value)} className="input input-bordered input-lg w-60 text-center px-4 py-2"/>
                <button onClick={handleSubmit} className="btn btn-primary btn-lg mt-4">Save</button>
            </div>
        </div>
    )
}

export default IntakeForm