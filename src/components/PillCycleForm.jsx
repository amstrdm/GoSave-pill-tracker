import { useEffect, useState } from "react"
import { saveCycleSettings, getCycleSettings } from "../utils/storage"
import { useNavigate } from "react-router-dom";

import ChangeTheme from "./ChangeTheme"

function PillCycleForm() {

    const navigate = useNavigate()

    const [pillDays, setPillDays] = useState("")
    const [breakDays, setBreakDays] = useState("")
    const [startDate, setStartDate] = useState("")   

    const [isSubmitted, setisSubmitted] = useState(false)

    useEffect(() => {
        const cycleSettings = getCycleSettings()

        if (cycleSettings){
            navigate("/")
        }else{
            console.log("No Cycle Data found")
        }
    }, [])

    function handleSubmit() {
        const cycleData = { pillDays, breakDays, startDate }
        saveCycleSettings(cycleData)
        console.log("Cycle Data saved to Local Storage")

        setisSubmitted(true)
        setTimeout(() => {
            navigate("/")
        }, 500)
    }

    return(
        <div className="relative min-h-screen overflow-x-hidden overflow-y-hidden">
            <ChangeTheme />
            <div className="min-h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-bold text-center mb-6">Set your pill cycle</h1>

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

                    <button onClick={handleSubmit} className="btn btn-primary btn-lg mt-4">{isSubmitted ? "Saved Cycle Settings" : "Save Cycle"}</button>
                </div>
            </div>
        </div>
    )
}   

export default PillCycleForm