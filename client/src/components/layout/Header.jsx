import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { InstagramLogo } from "../common/InstagramLogo";
import { logoutAsync } from "../../redux/slices/usersSlice";
import {
  followersSelector,
  getFollowRequestsAsync,
  clearUnreadNotifications,
} from "../../redux/slices/followersSlice";
import { chatSelector, fetchConversationsAsync } from "../../redux/slices/chatSlice";
import { IoHeartOutline, IoPaperPlaneOutline, IoLogOutOutline } from "react-icons/io5";
import NotificationsDrawer from "../notifications/NotificationsDrawer";

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { requests = [], hasUnreadNotifications } = useSelector(followersSelector);
  const { conversations = [] } = useSelector(chatSelector);

  useEffect(() => {
    dispatch(getFollowRequestsAsync());
    dispatch(fetchConversationsAsync());
  }, [dispatch]);

  // Smooth auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when near top
      if (currentScrollY < 20) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollYRef.current;
      if (Math.abs(diff) > 6) {
        if (diff > 0 && currentScrollY > 50) {
          // Scrolling down
          setIsVisible(false);
        } else if (diff < 0) {
          // Scrolling up
          setIsVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenNotifications = () => {
    dispatch(clearUnreadNotifications());
    setShowNotifications(true);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const totalUnreadMessages = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0
  );

  const showNotificationDot = hasUnreadNotifications || requests.length > 0;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-12 bg-white/75 backdrop-blur-xl border-b border-gray-200/60 shadow-xs z-40 px-4 flex items-center justify-between select-none transition-all duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Instagram Logo (Click to scroll to top) */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center">
          <InstagramLogo size="text-2xl" className="pb-0 pt-0" />
        </Link>

        {/* Right Action Icons (Notifications, Direct Messages & Logout) */}
        <div className="flex items-center space-x-3.5 text-black">
          {/* Notifications */}
          <button
            onClick={handleOpenNotifications}
            aria-label="Notifications"
            className="relative focus:outline-none p-1 cursor-pointer"
          >
            <IoHeartOutline className="text-[25px] text-black" />
            {showNotificationDot && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF3040] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Direct Messages */}
          <Link
            to="/messages"
            aria-label="Messages"
            className="relative p-1 text-black focus:outline-none flex items-center justify-center"
          >
            <IoPaperPlaneOutline className="text-[24px]" />
            {totalUnreadMessages > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 px-1 bg-[#FF3040] text-white text-[9px] font-bold rounded-full ring-2 ring-white flex items-center justify-center animate-pulse">
                {totalUnreadMessages}
              </span>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="p-1 text-gray-800 hover:text-red-600 focus:outline-none cursor-pointer transition-colors active:scale-95"
          >
            <IoLogOutOutline className="text-[25px]" />
          </button>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}

export default Header;
