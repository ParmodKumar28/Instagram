import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { usersSelector } from "../../redux/slices/usersSlice";
import { GoHome, GoHomeFill } from "react-icons/go";
import {
  IoSearchOutline,
  IoSearchSharp,
  IoFilmOutline,
  IoFilmSharp,
  IoImagesOutline,
} from "react-icons/io5";
import { RiAddBoxLine, RiAddBoxFill } from "react-icons/ri";
import CreatePostModal from "../post/CreatePostModal";
import CreateStoryModal from "../story/CreateStoryModal";
import Avatar from "../common/Avatar";

export function Footer() {
  const location = useLocation();
  const { signedUser, userId } = useSelector(usersSelector);
  const currentUser = signedUser;
  const currentPath = location.pathname;

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowCreateMenu(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const navTabs = [
    {
      label: "Home",
      to: "/",
      active: currentPath === "/",
      onLinkClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      outlineIcon: <GoHome className="text-[26px] text-gray-900" />,
      filledIcon: <GoHomeFill className="text-[26px] text-black" />,
    },
    {
      label: "Search",
      to: "/explore",
      active: currentPath === "/explore" || currentPath === "/search",
      outlineIcon: <IoSearchOutline className="text-[25px] text-gray-900" />,
      filledIcon: <IoSearchSharp className="text-[25px] text-black" />,
    },
    {
      label: "Create",
      onClick: (e) => {
        e.stopPropagation();
        setShowCreateMenu((prev) => !prev);
      },
      active: showCreateModal || showCreateMenu,
      outlineIcon: (
        <svg
          viewBox="0 0 24 24"
          width="25"
          height="25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-900"
        >
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <line x1="12" y1="7.5" x2="12" y2="16.5" strokeWidth="2.2" />
          <line x1="7.5" y1="12" x2="16.5" y2="12" strokeWidth="2.2" />
        </svg>
      ),
      filledIcon: (
        <svg
          viewBox="0 0 24 24"
          width="25"
          height="25"
          fill="currentColor"
          className="text-black"
        >
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" />
          <line
            x1="12"
            y1="7.5"
            x2="12"
            y2="16.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="7.5"
            y1="12"
            x2="16.5"
            y2="12"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Reels",
      to: "/reels",
      active: currentPath === "/reels",
      outlineIcon: <IoFilmOutline className="text-[25px] text-gray-900" />,
      filledIcon: <IoFilmSharp className="text-[25px] text-black" />,
    },
    {
      label: "Profile",
      to: userId ? `/profile/${userId}` : "/",
      active: currentPath.startsWith("/profile"),
      outlineIcon: (
        <div className="w-6 h-6 rounded-full overflow-hidden">
          <Avatar
            src={currentUser?.profilePic}
            alt="Profile"
            gender={currentUser?.gender}
            username={currentUser?.username}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      ),
      filledIcon: (
        <div className="w-6 h-6 rounded-full ring-2 ring-black ring-offset-1 ring-offset-white overflow-hidden">
          <Avatar
            src={currentUser?.profilePic}
            alt="Profile"
            gender={currentUser?.gender}
            username={currentUser?.username}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 h-12 z-50 select-none transition-all duration-300 bg-white/75 backdrop-blur-xl border-t border-gray-200/60 shadow-lg text-gray-900"
      >
        <div className="w-full h-full flex items-center justify-between">
          {navTabs.map((tab) => {
            const isCreate = tab.label === "Create";

            if (tab.onClick) {
              return (
                <div
                  key={tab.label}
                  className="relative flex-1 h-full flex items-center justify-center"
                >
                  <button
                    onClick={tab.onClick}
                    className="w-full h-full flex items-center justify-center focus:outline-none active:scale-90 transition-transform cursor-pointer"
                    aria-label={tab.label}
                  >
                    {tab.active ? tab.filledIcon : tab.outlineIcon}
                  </button>

                  {/* Mobile Create Popup Menu directly above Create tab */}
                  {isCreate && showCreateMenu && (
                    <div
                      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-dropdown p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          setShowCreateModal(true);
                        }}
                        className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-sm text-gray-900 font-semibold hover:bg-gray-100/70 rounded-xl transition text-left cursor-pointer"
                      >
                        <IoImagesOutline className="text-xl text-black" />
                        <span>Post</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          setShowCreateStoryModal(true);
                        }}
                        className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-sm text-gray-900 font-semibold hover:bg-gray-100/70 rounded-xl transition text-left cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded-full p-[1.5px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center flex-shrink-0">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              width="10"
                              height="10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-[#DD2A7B]"
                            >
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
                key={tab.label}
                to={tab.to}
                onClick={tab.onLinkClick}
                className="flex-1 h-full flex items-center justify-center focus:outline-none active:scale-90 transition-transform"
                aria-label={tab.label}
              >
                {tab.active ? tab.filledIcon : tab.outlineIcon}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Create New Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={showCreateStoryModal}
        onClose={() => setShowCreateStoryModal(false)}
      />
    </>
  );
}

export default Footer;
