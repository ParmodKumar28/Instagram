import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logoutAsync } from "../../redux/slices/usersSlice";
import InstagramLogo from "../common/InstagramLogo";
import { IoIosArrowDown } from "react-icons/io";

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  const lastScrollY = useRef(0);
  const threshold = 20;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) {
        setShowHeader(true);
        lastScrollY.current = 0;
        return;
      }
      if (Math.abs(currentScrollY - lastScrollY.current) < threshold) {
        return;
      }
      if (currentScrollY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div
        id="headerContainer"
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out 
          ${showHeader ? "translate-y-0" : "-translate-y-full"} 
          flex justify-between items-center py-2 px-4 md:px-8 
          bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm`}
      >
        {/* Instagram Logo */}
        <div className="flex items-center gap-1 cursor-pointer">
          <Link to="/">
            <span
              className="text-2xl font-bold tracking-tight text-gray-900 select-none hover:opacity-80 transition"
              style={{ fontFamily: "'Grand Hotel', 'Lobster Two', cursive" }}
            >
              Instagram
            </span>
          </Link>
          <IoIosArrowDown
            className="text-gray-700 text-base cursor-pointer ml-1"
            onClick={() => setShowDropdown(!showDropdown)}
          />
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-14 left-4 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-50">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowDropdown(false);
                navigate("/following");
              }}
            >
              Following
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowDropdown(false);
                navigate("/favorites");
              }}
            >
              Favorites
            </button>
          </div>
        )}

        {/* Icons Section */}
        <div className="flex items-center space-x-5">
          <Link to="/explore" className="relative group">
            <CiSearch className="text-2xl text-gray-700 hover:text-black transition duration-200" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
              Search
            </span>
          </Link>

          <Link to="/notifications" className="relative group">
            <FaRegHeart className="text-2xl text-gray-700 hover:text-black transition duration-200" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
              Notifications
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-full transition duration-200"
          >
            Log Out
          </button>
        </div>
      </div>
      <div className="h-16"></div>
    </>
  );
}

export default Header;
