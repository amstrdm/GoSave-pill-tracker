import { useEffect, useState } from "react"

function ChangeTheme(){

    const [selectedTheme, setSelectedTheme] = useState(
        localStorage.getItem("selectedTheme") || "default"
    )

    useEffect(() => {
        localStorage.setItem("selectedTheme", selectedTheme)
    }, [selectedTheme])

    return(
        <div className="dropdown absolute left-0 top-0 m-3">
            <div tabIndex={0} role="button" className="btn m-1">
                Theme
                <svg
                width="12px"
                height="12px"
                className="inline-block h-2 w-2 fill-current opacity-60"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2048 2048">
                <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl">
                <li>
                <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                    aria-label="Default"
                    value="default"
                    checked={selectedTheme === "default"}
                    onChange={() => setSelectedTheme("default")}/>
                </li>
                <li>
                <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                    aria-label="Dark"
                    value="dark" 
                    checked={selectedTheme === "dark"}
                    onChange={() => setSelectedTheme("dark")}/>
                </li>
                <li>
                <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                    aria-label="Coffee"
                    value="coffee"
                    checked={selectedTheme === "coffee"}
                    onChange={() => setSelectedTheme("coffee")}/>
                </li>
            </ul>
        </div>
    )
}

export default ChangeTheme
