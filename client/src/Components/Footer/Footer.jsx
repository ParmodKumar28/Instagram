// Imports
import { Link, useLocation } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { MdExplore } from "react-icons/md";
import { RiVideoFill } from "react-icons/ri";
import { MdAddBox } from "react-icons/md";
import { RiMessage2Fill } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";

// Footer component
function Footer() {
    // Get current location
    const location = useLocation();

    // Return JSX
    return (
        // Footer container div
        <div className="py-7 h-10 w-full flex justify-evenly items-center border-2 fixed bottom-0 bg-white" id="footerContainer">
            {/* Home */}
            <div className={location.pathname === "/" ? "text-blue-500" : ""}>
                {/* Navigate Link with the Icon here */}
                <Link to={"/"}>
                    {/* Icon */}
                    <GoHomeFill className="text-4xl" />
                </Link>
            </div>
            {/* Home End's*/}

            {/* Explore */}
            <div className={location.pathname === "/explore" ? "text-blue-500" : ""}>
                {/* Navigate Link with the Icon here */}
                <Link to={"/explore"}>
                    {/* Icon */}
                    <MdExplore className="text-4xl" />
                </Link>
            </div>
            {/* Explore End's */}

            {/* Reel's */}
            <div className={location.pathname === "/reels" ? "text-blue-500" : ""}>
                {/* Navigate Link with the Icon here */}
                <Link to={"/reels"}>
                    {/* Icon */}
                    <RiVideoFill className="text-4xl" />
                </Link>
            </div>
            {/* Reel's End's */}

            {/* Add Post*/}
            <div className={location.pathname === "/new-post" ? "text-blue-500" : ""}>
                {/* Navigate Link with the Icon here */}
                <Link to={"/new-post"}>
                    {/* Icon */}
                    <MdAddBox className="text-4xl" />
                </Link>
            </div>
            {/* Add Post End's */}

            {/* Message's */}
            <div className={location.pathname === "/messages" ? "text-blue-500" : ""}>
                {/* Navigate Link with the Icon here */}
                <Link to={"/messages"}>
                    {/* Icon */}
                    <RiMessage2Fill className="text-4xl" />
                </Link>
            </div>
            {/* Message's End's */}

            {/* Profile */}
            <div className={location.pathname === "/profile" ? "text-blue-500" : ""}>
                {/* Navigate Link with the Icon here */}
                <Link to={"/profile"}>
                    {/* Icon */}
                    <FaUserAlt className="text-3xl" />
                </Link>
            </div>
            {/* Profile End's */}
        </div>
        // Footer container div end's
    );
}

// Exporting footer
export default Footer;
