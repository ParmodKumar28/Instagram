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
import toast from "react-hot-toast";

export function Footer() {
  const location = useLocation();
  const { signedUser, userId } = useSelector(usersSelector);
  const currentUser = signedUser;
  const currentPath = location.pathname;

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      outlineIcon: <GoHome className="text-[26px] text-black" />,
      filledIcon: <GoHomeFill className="text-[26px] text-black" />,
    },
    {
      label: "Search",
      to: "#search",
      active: currentPath === "/search",
      outlineIcon: <IoSearchOutline className="text-[25px] text-black" />,
      filledIcon: <IoSearchSharp className="text-[25px] text-black" />,
    },
    {
      label: "Create",
      onClick: (e) => {
        e.stopPropagation();
        setShowCreateMenu((prev) => !prev);
      },
      active: showCreateModal || showCreateMenu,
      outlineIcon: <RiAddBoxLine className="text-[26px] text-black" />,
      filledIcon: <RiAddBoxFill className="text-[26px] text-black" />,
    },
    {
      label: "Reels",
      to: "#reels",
      active: currentPath === "/reels",
      outlineIcon: <IoFilmOutline className="text-[25px] text-black" />,
      filledIcon: <IoFilmSharp className="text-[25px] text-black" />,
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
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-gray-200 z-40 px-6 flex items-center justify-between select-none">
        {navTabs.map((tab) => {
          const isCreate = tab.label === "Create";

          if (tab.onClick) {
            return (
              <div key={tab.label} className="relative flex items-center justify-center">
                <button
                  onClick={tab.onClick}
                  className="flex items-center justify-center p-1.5 focus:outline-none"
                  aria-label={tab.label}
                >
                  {tab.active ? tab.filledIcon : tab.outlineIcon}
                </button>

                {/* Mobile Create Popup Menu directly above Create tab */}
                {isCreate && showCreateMenu && (
                  <div
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-200 rounded-2xl shadow-dropdown p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setShowCreateMenu(false);
                        setShowCreateModal(true);
                      }}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-sm text-gray-900 font-semibold hover:bg-gray-50 rounded-xl transition text-left"
                    >
                      <IoImagesOutline className="text-xl text-black" />
                      <span>Post</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowCreateMenu(false);
                        toast.success("To add a story, tap your avatar in the story tray on the feed!");
                      }}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-sm text-gray-900 font-semibold hover:bg-gray-50 rounded-xl transition text-left"
                    >
                      <div className="w-5 h-5 rounded-full p-[1.5px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center flex-shrink-0">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#DD2A7B]">
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
              className="flex items-center justify-center p-1.5 focus:outline-none"
              aria-label={tab.label}
            >
              {tab.active ? tab.filledIcon : tab.outlineIcon}
            </Link>
          );
        })}
      </nav>

      {/* Create New Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}

export default Footer;
