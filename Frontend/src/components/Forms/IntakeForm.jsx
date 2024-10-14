import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveIntakeSettings, getIntakeSettings } from "../../utils/storage.jsx";
import ChangeTheme from "../ChangeTheme";

export const IntakeForm = () => {
    const navigate = useNavigate()

    const [intakeTime, setIntakeTime] = useState("")    
    const [isSubmitted, setIsSubmitted] = useState(false)
    
    useEffect(() => {

        const fetchSettings = async () => {
            const settings = await getIntakeSettings()
        
            if (settings){
                navigate("/cycle")
            }else{
                console.log("No Intake time found")
            }
        }
        
        fetchSettings()

    }, [navigate])
    
    async function handleSubmit (){
        await saveIntakeSettings(intakeTime)
        setIsSubmitted(true)
        setTimeout(() => {
            navigate("/cycle")
        }, 500)
        
    }   

    return (
        <div className="relative min-h-screen overflow-x-hidden overflow-y-hidden">
            
            <ChangeTheme />
            <div className="flex flex-col justify-center items-center h-screen space-y-6">

                <h1 className="text-4xl font-bold text-center mb-6">At which time would you like to take your pill?</h1>
                <input type="time" value={intakeTime} onChange={(e) => setIntakeTime(e.target.value)} className="input input-bordered input-lg w-60 text-center px-4 py-2"/>
                <button onClick={handleSubmit} className="btn btn-primary btn-lg mt-4">{isSubmitted ? "Settings saved" : "Save"}</button>
            </div>
        </div>
    )
}

export default IntakeForm