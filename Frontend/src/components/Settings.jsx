import { useNavigate } from "react-router-dom"
import ChangeTheme from "./ChangeTheme"
import PillCycleForm from "./Forms/PillCycleForm"

function SettingsPanel({ isOpen=true, onSave }) {
    if (!isOpen) return null

    const navigate = useNavigate()
    

    return(
    <div>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <button className="absolute top-0 right-0 m-4" onClick={()=>document.getElementById('settings_modal').showModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </button>
        {/* We're importing the PillCycleForm Component here since a lot of the settings are the same.
        However We need to add other settings like changing the IntakeTime as well as define different handling depending on if it's being called from the Form or the Settingspanel.
        This leads to majorly fucked up code in the PillCycleForm Component.
        This if fucked. Like this is an absoluetely horrible approach. Quite frankly I do not know why I chose to do it this way I cannot exlain it in hindsight*/}
        <dialog id="settings_modal" className="modal">
            <div className="modal-box overflow-hidden">
                <div className="modal-action justify-center">
                    <ChangeTheme />
                    <form method="dialog" className="flex items-center justify-center">
                        <PillCycleForm isSettings={true} onSave={onSave}/>
                        {/* A logical approach would've been to just add the prompt for the Intake time here directly.
                        Instead I put it in a conditional inside of the PillCycleForm.jsx Component.
                        I do not know what I was smoking*/}
                        <button className="absolute top-0 right-0 m-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    </div>
    )
}

export default SettingsPanel

// 