export const saveIntakeSettings = (settings) => {
    console.log("settings: " + settings)
    localStorage.setItem("intakeTime", JSON.stringify(settings))
    //localStorage.setItem("cycleDates", cycleDates)
}

export const getIntakeSettings = () => {
    const settings = localStorage.getItem("intakeTime")
    //const cycleDates = localStorage.getItem("cycleDates")
    return settings ? JSON.parse(settings) : null
}
