import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoHomeFill } from "react-icons/go";
import { MdExplore, MdAddBox } from "react-icons/md";
import { RiVideoFill, RiMessage2Fill } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import { useEffect } from "react";
import { usersSelector } from "../../redux/slices/usersSlice";

export function Footer() {
  const location = useLocation();
  const { signedUser, userId } = useSelector(usersSelector);

  const activeStyle = "text-blue-500 scale-110";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="py-5 h-16 w-full flex justify-evenly items-center fixed bottom-0 left-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg z-40">
      {/* Home */}
      <div className={location.pathname === "/" ? activeStyle : "text-gray-600"}>
        <Link to="/">
          <GoHomeFill className="text-3xl hover:scale-110 transition-transform duration-200" />
        </Link>
      </div>

      {/* Explore */}
      <div className={location.pathname === "/explore" ? activeStyle : "text-gray-600"}>
        <Link to="/explore">
          <MdExplore className="text-3xl hover:scale-110 transition-transform duration-200" />
        </Link>
      </div>

      {/* Reels */}
      <div className={location.pathname === "/reels" ? activeStyle : "text-gray-600"}>
        <Link to="/reels">
          <RiVideoFill className="text-3xl hover:scale-110 transition-transform duration-200" />
        </Link>
      </div>

      {/* Add Post */}
      <div className={location.pathname === "/new-post" ? activeStyle : "text-gray-600"}>
        <Link to="/new-post">
          <MdAddBox className="text-3xl hover:scale-110 transition-transform duration-200" />
        </Link>
      </div>

      {/* Messages */}
      <div className={location.pathname === "/messages" ? activeStyle : "text-gray-600"}>
        <Link to="/messages">
          <RiMessage2Fill className="text-3xl hover:scale-110 transition-transform duration-200" />
        </Link>
      </div>

      {/* Profile */}
      <div
        className={
          userId && location.pathname === `/profile/${userId}`
            ? activeStyle
            : "text-gray-600"
        }
      >
        <Link to={userId ? `/profile/${userId}` : "/login"}>
          {signedUser && signedUser.profilePic ? (
            <img
              src={signedUser.profilePic}
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <FaUserAlt className="text-2xl hover:scale-110 transition-transform duration-200" />
          )}
        </Link>
      </div>
    </div>
  );
}

export default Footer;
