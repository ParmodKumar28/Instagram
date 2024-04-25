// Import's
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logoutAsync } from "../../Redux/Reducer/usersReducer";
import { IoIosArrowDown } from "react-icons/io";
import Cookies from "js-cookie";

// Header component is here
function Header() {
    // State for managing dropdown visibility
    const [showDropdown, setShowDropdown] = useState(false);

    // User's state

    // Dispatcher
    const dispatch = useDispatch();

    // Navigator
    const navigate = useNavigate();

    // Hanlding logout
    const handleLogout = async () => {
        try {
            await dispatch(logoutAsync());

            // Redirecting to login page after logout
            if (!Cookies.get("isSignIn")) {
                navigate("/login");
            }

        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    // Returning JSX
    return (
        // Header container
        <div className="h-10 py-6 px-2 w-full flex justify-between items-center border-2 md:px-5" id="headerContainer">
            {/* Logo */}
            <div className="relative flex items-center gap-2">
                {/* Navigate Link with logo */}
                <Link to={"/"} className="text-2xl" style={{ fontFamily: "Lobster Two" }}>
                    Instagram
                </Link>

                <IoIosArrowDown onClick={() => setShowDropdown(!showDropdown)} />

                {/* Dropdown list for logout */}
                {showDropdown && (
                    <div className="absolute top-full mt-1 w-24 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <button onClick={() => handleLogout()} className="block w-full py-2 px-4 text-left hover:bg-gray-100 cursor-pointer">Logout</button>
                    </div>
                )}
            </div>
            {/* Logo end's */}

            {/* Search */}
            <div className="flex items-center md:w-80">
                {/* Search icon */}
                <span className="absolute m-2">
                    <CiSearch className="text-xl text-slate-600" />
                </span>
                {/* Search input */}
                <input type="text" placeholder="Search" className="rounded-lg bg-slate-100 py-1 px-5 placeholder:ps-5 focus:outline-slate-200 w-[100%]" />
            </div>
            {/* Search End's */}

            {/* Heart */}
            <div className="">
                {/* Navigate Link */}
                <Link to={"/"}>
                    <FaRegHeart className="text-2xl" />
                </Link>
            </div>
            {/* Heart Ends */}
        </div>
        // Header container end's
    )
}

// Exporting Header
export default Header;