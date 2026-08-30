import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { InstagramLogo } from "../common/InstagramLogo";
import { followersSelector, getFollowRequestsAsync } from "../../redux/slices/followersSlice";
import { IoHeartOutline, IoPaperPlaneOutline } from "react-icons/io5";
import NotificationsDrawer from "../notifications/NotificationsDrawer";

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch();
  const { requests = [] } = useSelector(followersSelector);

  useEffect(() => {
    dispatch(getFollowRequestsAsync());
    const interval = setInterval(() => {
      dispatch(getFollowRequestsAsync());
    }, 8000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 z-40 px-4 flex items-center justify-between select-none">
        {/* Instagram Logo */}
        <Link to="/" className="flex items-center">
          <InstagramLogo size="text-2xl" className="pb-0 pt-0" />
        </Link>

        {/* Right Action Icons (Notifications & Direct Messages) */}
        <div className="flex items-center space-x-4 text-black">
          <button
            onClick={() => setShowNotifications(true)}
            aria-label="Notifications"
            className="relative focus:outline-none p-1"
          >
            <IoHeartOutline className="text-[25px] text-black" />
            {requests.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#FF3040] rounded-full ring-2 ring-white" />
            )}
          </button>

          <Link to="/messages" aria-label="Messages" className="p-1 focus:outline-none">
            <IoPaperPlaneOutline className="text-[24px] text-black" />
          </Link>
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
