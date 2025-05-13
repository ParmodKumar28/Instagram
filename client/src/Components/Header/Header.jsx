// Import's
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { useState, useEffect, useRef } from "react"; // added useEffect import
import { useDispatch } from "react-redux";
import { logoutAsync } from "../../Redux/Reducer/usersReducer";
import { IoIosArrowDown } from "react-icons/io";
import Cookies from "js-cookie";

// Header component is here
function Header() {
    // State for managing dropdown visibility
    const [showDropdown, setShowDropdown] = useState(false);
    const [scroll, setScroll] = useState(false);
    const lastScrollY = useRef(window.scrollY)

    // Better approach: using useEffect to manage event listener lifecycle gracefully
    useEffect(() => {
        console.log("Header mounted");
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY.current) {
                setScroll(true);
            } else {
                setScroll(false);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Dispatcher
    const dispatch = useDispatch();

    // Navigator
    const navigate = useNavigate();

    // Handling logout
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
        // Header container with smoother transition classes, additional easing and z-index for fixed state
        <div className={`h-10 py-6 px-3 w-full flex justify-between items-center border-b-2 md:px-5 transition-all duration-500 ease-in-out select-none ${scroll ? "fixed top-0 left-0 bg-white bg-opacity-70 backdrop-blur-md shadow-md z-50" : "relative"
            }`} id="headerContainer">
            {/* Logo */}
            <div className="relative flex items-center gap-2">
                {/* Navigate Link with logo */}
                <Link to={"/"} className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-tr from-red-600 to-blue-600" style={{ fontFamily: "Lobster Two" }}>
                    Instagram
                </Link>

                <IoIosArrowDown onClick={() => setShowDropdown(!showDropdown)} />

                {/* Dropdown list for logout */}
                {showDropdown && (
                    <div className="absolute top-full mt-1 w-24 font-semibold bg-white border border-gray-300 rounded-lg shadow-lg">
                        <button onClick={() => handleLogout()} className="block w-full py-2 px-4 text-left hover:bg-gray-100 cursor-pointer text-red-800">
                            Logout
                        </button>
                    </div>
                )}
            </div>
            {/* Logo end's */}

            {/* Search */}
            <div className="flex items-center w-[200px] md:w-80">
                {/* Search icon */}
                <span className="absolute m-2">
                    <CiSearch className="text-lg text-slate-600" />
                </span>
                {/* Search input */}
                <input type="text" placeholder="Search" className="rounded-lg bg-slate-100 py-1 px-8 placeholder:ps-5 focus:outline-slate-200 w-[100%]" />
            </div>
            {/* Search End's */}

            {/* Heart */}
            <div className="">
                {/* Navigate Link */}
                <Link to={"/"}>
                    <FaRegHeart className="text-2xl text-red-700" />
                </Link>
            </div>
            {/* Heart Ends */}
        </div>
        // Header container end's
    );
}

// Exporting Header
export default Header;