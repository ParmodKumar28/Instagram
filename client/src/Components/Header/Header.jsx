import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logoutAsync } from "../../Redux/Reducer/usersReducer";
import { IoIosArrowDown } from "react-icons/io";
import Cookies from "js-cookie";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  // Store the last scroll position using useRef to prevent re-renders
  const lastScrollY = useRef(0);
  // Define a threshold (in pixels) before we update the header visibility
  const threshold = 20;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) {
        setShowHeader(true);
        lastScrollY.current = 0;
        return;
      }
      // Check if the scroll difference is larger than the threshold
      if (Math.abs(currentScrollY - lastScrollY.current) < threshold) {
        return; // Ignore minor scroll changes
      }

      // If scrolling down, hide the header; if scrolling up, show it.
      if (currentScrollY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      // Update the last scroll position
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
      if (!Cookies.get("isSignIn")) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div
        id="headerContainer"
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out 
          ${showHeader ? "translate-y-0" : "-translate-y-full"} bg-white bg-opacity-70 backdrop-blur-md shadow-md`}
      >
        <div className="h-10 py-6 px-3 flex justify-between items-center border-b-2 md:px-5">
          {/* Logo and Dropdown */}
          <div className="relative flex items-center gap-2">
            <Link
              to="/"
              className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-tr from-red-600 to-blue-600"
              style={{ fontFamily: "Lobster Two" }}
            >
              Instagram
            </Link>
            <IoIosArrowDown onClick={() => setShowDropdown(!showDropdown)} />
            {showDropdown && (
              <div className="absolute top-full mt-1 w-24 font-semibold bg-white border border-gray-300 rounded-lg shadow-lg">
                <button
                  onClick={handleLogout}
                  className="block w-full py-2 px-4 text-left hover:bg-gray-100 cursor-pointer text-red-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          {/* Search */}
          <div className="flex items-center w-[200px] md:w-80">
            <span className="absolute m-2">
              <CiSearch className="text-lg text-slate-600" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="rounded-lg bg-slate-100 py-1 px-8 placeholder:ps-5 focus:outline-slate-200 w-full"
            />
          </div>
          {/* Heart Icon */}
          <div>
            <Link to="/">
              <FaRegHeart className="text-2xl text-red-700" />
            </Link>
          </div>
        </div>
      </div>
      {/* Add margin to prevent content overlap */}
      <div className="mt-10"></div>
    </>
  );
}

export default Header;