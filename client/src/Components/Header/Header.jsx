// Import's
import { Link } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";

// Header component is here
function Header() {

    // Returning JSX
    return (
        // Header container
        <div className="h-10 py-6 px-2 w-full flex justify-between items-center border-2" id="headerContainer">
            {/* Logo */}
            <div className="">
                {/* Navigate Link with logo */}
                <Link to={"/"} className="text-2xl" style={{ fontFamily: "Lobster Two" }}>
                    Instagram
                </Link>
            </div>
            {/* Logo end's */}

            {/* Search */}
            <div className="flex items-center">
                {/* Search icon */}
                <span className="absolute m-2">
                    <CiSearch className="text-xl text-slate-600" />
                </span>
                {/* Search input */}
                <input type="text" placeholder="Search" className="rounded-lg bg-slate-100 py-1 px-5 placeholder:ps-5 focus:outline-slate-200" />
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