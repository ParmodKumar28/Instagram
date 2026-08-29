import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutAsync, usersSelector } from "../../redux/slices/usersSlice";
import {
  followersSelector,
  getFollowRequestsAsync,
} from "../../redux/slices/followersSlice";
import NotificationsDrawer from "../notifications/NotificationsDrawer";

export function LeftSidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { signedUser, userId } = useSelector(usersSelector);
  const { requests } = useSelector(followersSelector);
  const currentUser = signedUser;
  const currentPath = location.pathname;

  useEffect(() => {
    dispatch(getFollowRequestsAsync());
    const interval = setInterval(() => {
      dispatch(getFollowRequestsAsync());
    }, 8000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    {
      label: "Home",
      to: "/",
      active: currentPath === "/",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-black">
          <path d="M3 9.5L12 2.5l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="flex-shrink-0 text-black">
          <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.545 2.545 0 1 0-5.09 0V22a1 1 0 0 1-1 1H2.89A.89.89 0 0 1 2 22.11V9.673a.89.89 0 0 1 .306-.677l8.802-7.85a1.336 1.336 0 0 1 1.784 0l8.802 7.85a.89.89 0 0 1 .306.677V22.11A.89.89 0 0 1 22 23Z" />
        </svg>
      ),
    },
    {
      label: "Reels",
      to: "#reels",
      active: currentPath === "/reels",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-black">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <line x1="2.5" y1="8" x2="21.5" y2="8" />
          <line x1="7.5" y1="2.5" x2="6" y2="8" />
          <line x1="13.5" y1="2.5" x2="12" y2="8" />
          <line x1="19.5" y1="2.5" x2="18" y2="8" />
          <polygon points="10,12 10,17 15,14.5" fill="currentColor" stroke="none" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="flex-shrink-0 text-black">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 13.5v-7l6 3.5-6 3.5z" />
        </svg>
      ),
    },
    {
      label: "Messages",
      to: "#messages",
      active: currentPath === "/messages",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-black">
          <path d="M22 3.5L1.5 12.5l7 2.5 1.5 6 3.5-3.5 5 3.5L22 3.5z" />
          <line x1="8.5" y1="15" x2="15.5" y2="9" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="flex-shrink-0 text-black">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      ),
    },
    {
      label: "Search",
      to: "#search",
      active: currentPath === "/search",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" className="flex-shrink-0 text-black">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3.2" className="flex-shrink-0 text-black">
          <circle cx="11" cy="11" r="6.8" />
          <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" />
        </svg>
      ),
    },
    {
      label: "Notifications",
      onClick: () => setShowNotifications(true),
      active: showNotifications,
      outlineIcon: (
        <div className="relative">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-black">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF3040] rounded-full ring-2 ring-white" />
          )}
        </div>
      ),
      filledIcon: (
        <div className="relative">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="flex-shrink-0 text-black">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF3040] rounded-full ring-2 ring-white" />
          )}
        </div>
      ),
    },
    {
      label: "Create",
      to: "/new-post",
      active: currentPath === "/new-post",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-black">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="flex-shrink-0 text-black">
          <path d="M18 2H6c-2.2 0-4 1.8-4 4v12c0 2.2 1.8 4 4 4h12c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4zm-5 11h3v2h-3v3h-2v-3H8v-2h3V9h2v4z" />
        </svg>
      ),
    },
    {
      label: "Profile",
      to: userId ? `/profile/${userId}` : "/",
      active: currentPath.startsWith("/profile"),
      outlineIcon: (
        <div className="w-7 h-7 rounded-full p-[1px] flex-shrink-0 overflow-hidden">
          <img
            src={currentUser?.profilePic || "https://placekitten.com/100/100"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      ),
      filledIcon: (
        <div className="w-7 h-7 rounded-full p-[1px] flex-shrink-0 ring-2 ring-black ring-offset-1 overflow-hidden">
          <img
            src={currentUser?.profilePic || "https://placekitten.com/100/100"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowMoreMenu(false);
        }}
        className={`fixed left-0 top-0 h-screen bg-transparent flex flex-col justify-between py-7 z-40 select-none transition-all duration-300 ease-in-out ${
          isHovered ? "w-[260px] px-4" : "w-[84px] px-3"
        }`}
      >
        {/* Top Section: Logo + Navigation Links */}
        <div className="flex flex-col w-full">
          {/* Instagram Camera Glyph */}
          <Link
            to="/"
            className={`flex items-center mb-8 p-3.5 rounded-xl hover:bg-[#F2F2F2] transition duration-150 text-black ${
              isHovered ? "justify-start space-x-4" : "justify-center"
            }`}
            aria-label="Instagram Home"
          >
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-black">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </Link>

          {/* Navigation Items */}
          <nav className="flex flex-col space-y-2 w-full">
            {navItems.map((item) => {
              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`group flex items-center p-3.5 rounded-xl transition-all duration-150 text-black hover:bg-[#F2F2F2] w-full ${
                      isHovered ? "justify-start space-x-4" : "justify-center"
                    } ${item.active ? "font-bold" : "font-normal"}`}
                    title={!isHovered ? item.label : undefined}
                  >
                    <div className="transform group-hover:scale-105 transition-transform duration-150 text-black flex items-center justify-center">
                      {item.active ? item.filledIcon : item.outlineIcon}
                    </div>

                    {isHovered && (
                      <span
                        className={`text-[15px] tracking-tight whitespace-nowrap transition-opacity duration-200 ${
                          item.active ? "font-bold text-black" : "text-black font-normal"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`group flex items-center p-3.5 rounded-xl transition-all duration-150 text-black hover:bg-[#F2F2F2] ${
                    isHovered ? "justify-start space-x-4" : "justify-center"
                  } ${item.active ? "font-bold" : "font-normal"}`}
                  title={!isHovered ? item.label : undefined}
                >
                  <div className="transform group-hover:scale-105 transition-transform duration-150 text-black flex items-center justify-center">
                    {item.active ? item.filledIcon : item.outlineIcon}
                  </div>

                  {isHovered && (
                    <span
                      className={`text-[15px] tracking-tight whitespace-nowrap transition-opacity duration-200 ${
                        item.active ? "font-bold text-black" : "text-black font-normal"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: More */}
        <div className="relative flex flex-col space-y-2 w-full">
          {/* More Popup Menu */}
          {showMoreMenu && (
            <div className="absolute bottom-16 left-1 w-60 bg-white border border-gray-200 rounded-2xl shadow-dropdown py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <Link
                to="/edit-profile"
                onClick={() => setShowMoreMenu(false)}
                className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition"
              >
                Settings
              </Link>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
              >
                Log out
              </button>
            </div>
          )}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`group flex items-center p-3.5 rounded-xl text-black hover:bg-[#F2F2F2] transition duration-150 focus:outline-none w-full ${
              isHovered ? "justify-start space-x-4" : "justify-center"
            }`}
            title={!isHovered ? "More" : undefined}
          >
            <div className="transform group-hover:scale-105 transition-transform duration-150 text-black">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
            {isHovered && (
              <span className="text-[15px] font-normal text-black whitespace-nowrap">
                More
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Notifications & Follow Requests Drawer */}
      <NotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}

export default LeftSidebar;
