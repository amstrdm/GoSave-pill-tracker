export const saveIntakeSettings = (settings) => {
    console.log("Intake settings: " + settings)
    localStorage.setItem("intakeTime", JSON.stringify(settings))
    //localStorage.setItem("cycleDates", cycleDates)
}

export const getIntakeSettings = () => {
    const settings = localStorage.getItem("intakeTime")
    //const cycleDates = localStorage.getItem("cycleDates")
    return settings ? JSON.parse(settings) : null
}

export const saveCycleSettings = (cycleData) => {
    const cycleDataJSON = JSON.stringify(cycleData)

    localStorage.setItem("cycleSettings", cycleDataJSON)
    console.log("Cycle settings saved to local storage:", cycleData);
}

export const getCycleSettings = () => {
    const savedSettings = localStorage.getItem("cycleSettings")

    if (savedSettings) {
        return JSON.parse(savedSettings)
    }else{
        return null
    }
}