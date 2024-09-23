import { useState } from "react";

function ChangeTheme() {
    // State to track the selected theme
    const [selectedTheme, setSelectedTheme] = useState("default");
    
    // State to track dropdown visibility
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    // Function to handle theme change
    const handleThemeChange = (event) => {
        const selected = event.target.value;
        setSelectedTheme(selected);
        console.log("Selected theme:", selected);
    };

    // Function to toggle dropdown visibility
    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="absolute top-0 right-0 m-2">
            <div className="dropdown">
                {/* Button to toggle dropdown */}
                <div 
                    tabIndex={0}
                    role="button"
                    onClick={toggleDropdown} // Toggle dropdown on click
                    className="btn m-1"
                >
                    Theme
                    <svg
                        width="12px"
                        height="12px"
                        className="inline-block h-2 w-2 fill-current opacity-60"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 2048 2048"
                    >
                        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                    </svg>
                </div>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                    <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl">
                        <li>
                            <input
                                type="radio"
                                name="theme-dropdown"
                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                aria-label="Default"
                                value="default"
                                checked={selectedTheme === "default"} // Set default theme as selected
                                onChange={handleThemeChange}
                            />
                        </li>
                        <li>
                            <input
                                type="radio"
                                name="theme-dropdown"
                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                aria-label="Dark"
                                value="dark"
                                checked={selectedTheme === "dark"} // Check if the theme is "dark"
                                onChange={handleThemeChange}
                            />
                        </li>
                        <li>
                            <input
                                type="radio"
                                name="theme-dropdown"
                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                aria-label="Autumn"
                                value="coffee"
                                checked={selectedTheme === "coffee"} // Check if the theme is "coffee"
                                onChange={handleThemeChange}
                            />
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ChangeTheme;
