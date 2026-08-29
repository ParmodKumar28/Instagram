import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { usersSelector } from "../../redux/slices/usersSlice";

export function Footer() {
  const location = useLocation();
  const { userData, signedUser, userId } = useSelector(usersSelector);
  const currentUser = userData?.user || signedUser;
  const currentPath = location.pathname;

  const navTabs = [
    {
      label: "Home",
      to: "/",
      active: currentPath === "/",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
          <path d="M3 9.5L12 2.5l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black">
          <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.545 2.545 0 1 0-5.09 0V22a1 1 0 0 1-1 1H2.89A.89.89 0 0 1 2 22.11V9.673a.89.89 0 0 1 .306-.677l8.802-7.85a1.336 1.336 0 0 1 1.784 0l8.802 7.85a.89.89 0 0 1 .306.677V22.11A.89.89 0 0 1 22 23Z" />
        </svg>
      ),
    },
    {
      label: "Search",
      to: "#search",
      active: currentPath === "/search",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3.2" className="text-black">
          <circle cx="11" cy="11" r="6.8" />
          <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" />
        </svg>
      ),
    },
    {
      label: "Create",
      to: "/new-post",
      active: currentPath === "/new-post",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black">
          <path d="M18 2H6c-2.2 0-4 1.8-4 4v12c0 2.2 1.8 4 4 4h12c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4zm-5 11h3v2h-3v3h-2v-3H8v-2h3V9h2v4z" />
        </svg>
      ),
    },
    {
      label: "Reels",
      to: "#reels",
      active: currentPath === "/reels",
      outlineIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <line x1="2.5" y1="8" x2="21.5" y2="8" />
          <line x1="7.5" y1="2.5" x2="6" y2="8" />
          <line x1="13.5" y1="2.5" x2="12" y2="8" />
          <line x1="19.5" y1="2.5" x2="18" y2="8" />
          <polygon points="10,12 10,17 15,14.5" fill="currentColor" stroke="none" />
        </svg>
      ),
      filledIcon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 13.5v-7l6 3.5-6 3.5z" />
        </svg>
      ),
    },
    {
      label: "Profile",
      to: userId ? `/profile/${userId}` : "/",
      active: currentPath.startsWith("/profile"),
      outlineIcon: (
        <div className="w-6 h-6 rounded-full overflow-hidden">
          <img
            src={currentUser?.profilePic || "https://placekitten.com/100/100"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      ),
      filledIcon: (
        <div className="w-6 h-6 rounded-full ring-2 ring-black ring-offset-1 overflow-hidden">
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
    <nav className="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-gray-200 z-40 px-6 flex items-center justify-between select-none">
      {navTabs.map((tab) => (
        <Link
          key={tab.label}
          to={tab.to}
          className="flex items-center justify-center p-1.5 focus:outline-none"
          aria-label={tab.label}
        >
          {tab.active ? tab.filledIcon : tab.outlineIcon}
        </Link>
      ))}
    </nav>
  );
}

export default Footer;
