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
        console.log("Intake settings: " + settings)

        const response = await api.post("/database", {
            "fcmToken": fcmToken,
            "intakeTime": settings
        })
        
        console.log("Intake Response from backend:", response.data);

    } catch (err) {
        // Log the full error object to understand the issue
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Error saving data to backend:", err.response.data);
            console.error("Status code:", err.response.status);
            console.error("Headers:", err.response.headers);
        } else if (err.request) {
            // The request was made but no response was received
            console.error("No response received:", err.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error in setting up the request:", err.message);
        }
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
        // Log the full error object to understand the issue
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Error saving data to backend:", err.response.data);
            console.error("Status code:", err.response.status);
            console.error("Headers:", err.response.headers);
        } else if (err.request) {
            // The request was made but no response was received
            console.error("No response received:", err.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error in setting up the request:", err.message);
        }
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
