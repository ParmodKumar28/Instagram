// Imports
import { Link } from "react-router-dom"
import { GoHomeFill } from "react-icons/go";
import { MdExplore } from "react-icons/md";
import { RiVideoFill } from "react-icons/ri";
import { MdAddBox } from "react-icons/md";
import { RiMessage2Fill } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";

// Footer component here 
function Footer() {

    // Side Effect's

    // Returning JSx
    return (
        // Footer container div
        <div className="py-7 h-10 w-full flex justify-evenly items-center border-2 fixed bottom-0" id="footerContainer">
            {/* Home */}
            <div className="">
                {/* Naviagte Link with the Icon here */}
                <Link to={"/"}>
                    {/* Icon */}
                    <GoHomeFill className="text-4xl" />
                </Link>
            </div>
            {/* Home End's*/}

            {/* Explore */}
            <div className="">
                {/* Naviagte Link with the Icon here */}
                <Link to={"/"}>
                    {/* Icon */}
                    <MdExplore className="text-4xl" />
                </Link>
            </div>
            {/* Explore End's */}

            {/* Reel's */}
            <div className="">
                {/* Naviagte Link with the Icon here */}
                <Link to={"/"}>
                    {/* Icon */}
                    <RiVideoFill className="text-4xl" />
                </Link>
            </div>
            {/* Reel's End's */}

            {/* Add */}
            <div className="">
                {/* Naviagte Link with the Icon here */}
                <Link to={"/"}>
                    {/* Icon */}
                    <MdAddBox className="text-4xl" />
                </Link>
            </div>
            {/* Add End's */}

            {/* Message's */}
            <div className="">
                {/* Naviagte Link with the Icon here */}
                <Link to={"/"}>
                    {/* Icon */}
                    <RiMessage2Fill className="text-4xl" />
                </Link>
            </div>
            {/* Message's End's */}

            {/* Profile */}
            <div className="">
                {/* Naviagte Link with the Icon here */}
                <Link to={"/"}>
                    {/* Icon */}
                    <FaUserAlt className="text-3xl" />
                </Link>
            </div>
            {/* Profile End's */}

        </div>
        // Footer container div end's
    )
}

// Exporting footer
export default Footer