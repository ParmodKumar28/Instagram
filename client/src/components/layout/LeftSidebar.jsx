import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { InstagramLogo } from "../common/InstagramLogo";
import {
  logoutAsync,
  usersSelector,
} from "../../redux/slices/usersSlice";
import {
  followersSelector,
  getFollowRequestsAsync,
} from "../../redux/slices/followersSlice";
import {
  GoHome,
  GoHomeFill,
} from "react-icons/go";
import {
  IoSearchOutline,
  IoSearchSharp,
  IoFilmOutline,
  IoFilmSharp,
  IoPaperPlaneOutline,
  IoPaperPlaneSharp,
  IoHeartOutline,
  IoHeartSharp,
  IoMenuOutline,
  IoImagesOutline,
} from "react-icons/io5";
import { RiAddBoxLine, RiAddBoxFill } from "react-icons/ri";
import NotificationsDrawer from "../notifications/NotificationsDrawer";
import CreatePostModal from "../post/CreatePostModal";
import toast from "react-hot-toast";

export function LeftSidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  // Close popup menus when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowCreateMenu(false);
      setShowMoreMenu(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

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
      outlineIcon: <GoHome className="text-[28px] text-black" />,
      filledIcon: <GoHomeFill className="text-[28px] text-black" />,
    },
    {
      label: "Search",
      to: "#search",
      active: currentPath === "/search",
      outlineIcon: <IoSearchOutline className="text-[27px] text-black" />,
      filledIcon: <IoSearchSharp className="text-[27px] text-black" />,
    },
    {
      label: "Reels",
      to: "#reels",
      active: currentPath === "/reels",
      outlineIcon: <IoFilmOutline className="text-[27px] text-black" />,
      filledIcon: <IoFilmSharp className="text-[27px] text-black" />,
    },
    {
      label: "Messages",
      to: "#messages",
      active: currentPath === "/messages",
      outlineIcon: <IoPaperPlaneOutline className="text-[26px] text-black" />,
      filledIcon: <IoPaperPlaneSharp className="text-[26px] text-black" />,
    },
    {
      label: "Notifications",
      onClick: () => setShowNotifications(true),
      active: showNotifications,
      outlineIcon: (
        <div className="relative">
          <IoHeartOutline className="text-[28px] text-black" />
          {requests.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF3040] rounded-full ring-2 ring-white" />
          )}
        </div>
      ),
      filledIcon: (
        <div className="relative">
          <IoHeartSharp className="text-[28px] text-black" />
          {requests.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF3040] rounded-full ring-2 ring-white" />
          )}
        </div>
      ),
    },
    {
      label: "Create",
      onClick: (e) => {
        e.stopPropagation();
        setShowCreateMenu((prev) => !prev);
      },
      active: showCreateModal || showCreateMenu,
      outlineIcon: <RiAddBoxLine className="text-[28px] text-black" />,
      filledIcon: <RiAddBoxFill className="text-[28px] text-black" />,
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
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      ),
      filledIcon: (
        <div className="w-7 h-7 rounded-full p-[1.5px] border-2 border-black flex-shrink-0 overflow-hidden">
          <img
            src={currentUser?.profilePic || "https://placekitten.com/100/100"}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 h-screen bg-white z-40 transition-all duration-300 ease-in-out select-none hidden md:flex flex-col justify-between p-3 border-none shadow-none ${
          isHovered ? "w-[260px]" : "w-[84px]"
        }`}
      >
        {/* Top Logo */}
        <div className="h-16 flex items-center px-2 flex-shrink-0">
          <Link to="/" className="flex items-center">
            {isHovered ? (
              <div className="px-2 transition-opacity duration-300">
                <InstagramLogo size="text-3xl" className="pb-0 pt-0" />
              </div>
            ) : (
              <div className="w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform duration-200">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
            )}
          </Link>
        </div>

        {/* Vertically Centered Navigation Links */}
        <nav className="flex-1 flex flex-col justify-center space-y-2 relative my-auto">
          {navItems.map((item) => {
            const isCreate = item.label === "Create";

            if (item.onClick) {
              return (
                <div key={item.label} className="relative w-full">
                  <button
                    onClick={item.onClick}
                    className={`group flex items-center p-3.5 rounded-xl transition-all duration-150 text-black hover:bg-[#F2F2F2] focus:outline-none w-full ${
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

                  {/* Create Options Popup Menu anchored directly beside Create button */}
                  {isCreate && showCreateMenu && (
                    <div
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-52 bg-white border border-gray-200 rounded-2xl shadow-dropdown p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          setShowCreateModal(true);
                        }}
                        className="w-full flex items-center space-x-3 px-3.5 py-3 text-sm text-gray-900 font-semibold hover:bg-[#F2F2F2] rounded-xl transition text-left"
                      >
                        <IoImagesOutline className="text-xl text-black" />
                        <span>Post</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          toast.success("To add a story, tap your avatar in the story tray on the feed!");
                        }}
                        className="w-full flex items-center space-x-3 px-3.5 py-3 text-sm text-gray-900 font-semibold hover:bg-[#F2F2F2] rounded-xl transition text-left"
                      >
                        <div className="w-5 h-5 rounded-full p-[1.5px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center flex-shrink-0">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#DD2A7B]">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </div>
                        </div>
                        <span>Story</span>
                      </button>
                    </div>
                  )}
                </div>
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

        {/* Bottom Section: More */}
        <div className="relative flex flex-col space-y-2 w-full">
          {/* More Popup Menu */}
          {showMoreMenu && (
            <div
              className="absolute bottom-16 left-1 w-60 bg-white border border-gray-200 rounded-2xl shadow-dropdown py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
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
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreMenu(!showMoreMenu);
            }}
            className={`group flex items-center p-3.5 rounded-xl text-black hover:bg-[#F2F2F2] transition duration-150 focus:outline-none w-full ${
              isHovered ? "justify-start space-x-4" : "justify-center"
            }`}
            title={!isHovered ? "More" : undefined}
          >
            <div className="transform group-hover:scale-105 transition-transform duration-150 text-black">
              <IoMenuOutline className="text-[28px]" />
            </div>
            {isHovered && (
              <span className="text-[15px] font-normal text-black whitespace-nowrap">
                More
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Create New Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}

export default LeftSidebar;
