import { useState } from "react";
import api from "../axiosInstance";
import { getFcmToken } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


function ChangeIntakeTime() {
    const [intakeTime, setIntakeTime] = useState("") 
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    
    async function handleSubmit(){
        

        const fcmToken = getFcmToken()
        setIsLoading(true)
        try{
            const response = await api.post("/schedule-notifications", {
                "fcmToken": fcmToken,
                "intakeTime": intakeTime,
                "interval": false
            })
            setIsSubmitted(true)
        }catch(err){
            if (err.response && 
                err.response.data &&
                err.response.data.error === "passed intake time is in the past"){
                await api.post("/schedule-notifications", {
                    fcmToken: fcmToken,
                    interval: true,})
            }
            toast.info("Rescheduled Notifications")
        }
        
        setIsLoading(false)
        
        setTimeout(() => {
            navigate("/")
            setIsSubmitted(false)
        }, 500)
        
    }

    return (
        <div>
            <button className="btn mt-12 ml-5 mr-5" onClick={()=>document.getElementById('intake_time_modal').showModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>Change Intake Time
            </button>
            <dialog id="intake_time_modal" className="modal">
                <div className="modal-box flex flex-col justify-center items-center">
                    <h1 className="text-4xl font-bold text-center mb-4">Input your preferred temporary Intake Time</h1>
                    <h4 className="text-xl font-bold text-center mb-10">(This will be reset tomorrow)</h4>
                    <input type="time" value={intakeTime} onChange={(e) => setIntakeTime(e.target.value)} className="input input-bordered input-lg w-60 text-center px-4 py-2"/>

                    <div className="modal-action">
                        <form method="dialog">
                        </form>
                        <button className="btn btn-primary btn-lg mt-4" onClick={handleSubmit}>{isLoading ? <span className="loading loading-spinner loading-lg"></span> : 
                        isSubmitted ? "Settings saved" : "Save"}</button>
                    </div>

                </div>
            </dialog>
        </div>
    )
}

export default ChangeIntakeTime;
