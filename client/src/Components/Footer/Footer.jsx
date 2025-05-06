// Imports
import { Link, useLocation } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { MdExplore } from "react-icons/md";
import { RiVideoFill } from "react-icons/ri";
import { MdAddBox } from "react-icons/md";
import { RiMessage2Fill } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import Cookies from "js-cookie";

// Footer component
function Footer() {
    // Get current location
    const location = useLocation();
    const signedUser = Cookies.get("signedUser");
    const userId = signedUser ? JSON.parse(signedUser)._id : null;

    // Active link styles
    const activeStyle = "text-blue-500 scale-110";

    // Return JSX
    return (
        <div className="py-5 h-16 w-full flex justify-evenly items-center fixed bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-300 shadow-lg">
            {/* Home */}
            <div className={location.pathname === "/" ? activeStyle : "text-gray-600"}>
                <Link to={"/"}>
                    <GoHomeFill className="text-4xl hover:scale-110 transition-transform duration-200" />
                </Link>
            </div>

            {/* Explore */}
            <div className={location.pathname === "/explore" ? activeStyle : "text-gray-600"}>
                <Link to={"/explore"}>
                    <MdExplore className="text-4xl hover:scale-110 transition-transform duration-200" />
                </Link>
            </div>

            {/* Reels */}
            <div className={location.pathname === "/reels" ? activeStyle : "text-gray-600"}>
                <Link to={"/reels"}>
                    <RiVideoFill className="text-4xl hover:scale-110 transition-transform duration-200" />
                </Link>
            </div>

            {/* Add Post */}
            <div className={location.pathname === "/new-post" ? activeStyle : "text-gray-600"}>
                <Link to={"/new-post"}>
                    <MdAddBox className="text-4xl hover:scale-110 transition-transform duration-200" />
                </Link>
            </div>

            {/* Messages */}
            <div className={location.pathname === "/messages" ? activeStyle : "text-gray-600"}>
                <Link to={"/messages"}>
                    <RiMessage2Fill className="text-4xl hover:scale-110 transition-transform duration-200" />
                </Link>
            </div>

            {/* Profile */}
            <div className={location.pathname === `/profile/${userId}` ? activeStyle : "text-gray-600"}>
                <Link to={`/profile/${userId}`}>
                    <FaUserAlt className="text-3xl hover:scale-110 transition-transform duration-200" />
                </Link>
            </div>
        </div>
    );
}

// Export Footer
export default Footer;