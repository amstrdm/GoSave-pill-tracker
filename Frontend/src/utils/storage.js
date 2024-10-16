import { json } from "react-router-dom"
import api from "../axiosInstance"

export const saveFcmToken = (token) => {
    const fcmToken = getFcmToken()
    fcmToken || localStorage.setItem("fcmToken", JSON.stringify(token)) 
}

export const getFcmToken = () => {
    const fcmToken = localStorage.getItem("fcmToken")
    return fcmToken ? JSON.parse(fcmToken) : null
}

export const saveIntakeSettings = async (settings) => {
    try {
        const fcmToken = getFcmToken()
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        console.log("Intake settings: " + settings)

        const response = await api.post("/database", {
            "fcmToken": fcmToken,
            "intakeTime": settings,
            "timezone": userTimeZone
        })
        
        console.log("Intake Response from backend:", response.data);

    } catch (err) {
        console.error("Failed saving Intake Time to Database:", err);
        throw err // Throw the error to be caught in the calling component
    }
}
// This is a really retarded way of doing this but since we're imp
export const getIntakeSettings = async () => {
    try {
        const token = getFcmToken()
        const response = await api.get("/database", {
            params: {"fcmToken": token}
        })
        console.log("Data from getIntakeSettings: ", response.data)
        const intakeTime = response.data.user.intakeTime
        console.log("Retrieved intake time from db:", intakeTime)
        return intakeTime
    } catch (err) {
        console.log("No Intake Time found: ", err.response)
        return null
        
    }
}

export const saveCycleSettings = async (cycleData) => {
    try {
        const fcmToken = getFcmToken()
        console.log("Cycle Settings: ", cycleData)

        const response = await api.post("/database", {
            "fcmToken": fcmToken,
            "cycleData": cycleData
        })
        
        console.log("Cycle Response from backend:", response.data);

    } catch (err) {
        console.error("Failed saving cycle Data to Database:", err);
        throw err;// Throw the error to be caught in the calling component
    }
}

export const getCycleSettings = async () => {
    try {
        const token = getFcmToken()
        const response = await api.get("/database", {
            params: {"fcmToken": token}
        })
        console.log("Data from getCycleSettings: ", response.data)
        const pillDays = response.data.user.cycleData.pillDays
        const breakDays = response.data.user.cycleData.breakDays
        const startDate = response.data.user.cycleData.startDate

        const cycleData = { pillDays, breakDays, startDate }

        if (cycleData){
            console.log("Retrieved cycle data from db:", pillDays, breakDays, startDate)
        }else{
            console.log("Cycle Data not available")
        }
        return cycleData
    } catch (err) {
        console.log("No cycleData found: ", err)
        return null
        
    }
}
