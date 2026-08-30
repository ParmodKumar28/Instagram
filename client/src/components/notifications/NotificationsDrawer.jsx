import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoClose, IoChevronBack } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import {
  followersSelector,
  getFollowRequestsAsync,
  getActivityAsync,
  acceptFollowRequestAsync,
  rejectFollowRequestAsync,
} from "../../redux/slices/followersSlice";
import { formatTimeAgo } from "../../utils";
import Avatar from "../common/Avatar";

export function NotificationsDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { requests = [], activity = [], loading } = useSelector(followersSelector);
  const [viewingAllRequests, setViewingAllRequests] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(getFollowRequestsAsync());
      dispatch(getActivityAsync());
      const interval = setInterval(() => {
        dispatch(getFollowRequestsAsync());
        dispatch(getActivityAsync());
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setViewingAllRequests(false);
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleAccept = async (followerId) => {
    await dispatch(acceptFollowRequestAsync(followerId));
    dispatch(getFollowRequestsAsync());
    dispatch(getActivityAsync());
  };

  const handleReject = async (followerId) => {
    await dispatch(rejectFollowRequestAsync(followerId));
    dispatch(getFollowRequestsAsync());
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex justify-start backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[397px] bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col justify-between select-none animate-in slide-in-from-left duration-300 md:rounded-r-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          {viewingAllRequests ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewingAllRequests(false)}
                className="text-gray-700 hover:text-black p-1 -ml-2 text-2xl"
                aria-label="Back to notifications"
              >
                <IoChevronBack />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Follow requests</h2>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h2>
          )}

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black p-1 text-2xl"
            aria-label="Close notifications"
          >
            <IoClose />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none">
          {/* Sub-view: Detailed Follow Requests List */}
          {viewingAllRequests ? (
            <div>
              {requests.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No pending follow requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((item) => {
                    const follower = item.follower || item;
                    const followerId = follower._id || follower.id || item._id;
                    const username = follower.username || follower.name || "user";
                    return (
                      <div
                        key={item._id || followerId}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition"
                      >
                        <Link
                          to={`/profile/${followerId || ""}`}
                          onClick={onClose}
                          className="flex items-center space-x-3.5 flex-1 min-w-0 mr-2"
                        >
                          <Avatar
                            src={follower.profilePic}
                            alt={username}
                            gender={follower.gender}
                            username={username}
                            className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0"
                          />
                          <div className="truncate leading-tight">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {username}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {follower.name || "requested to follow you"} · {formatTimeAgo(item.createdAt)}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleAccept(followerId)}
                            className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleReject(followerId)}
                            className="bg-[#EFEFEF] hover:bg-[#DBDBDB] text-gray-900 text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Main View: Grouped Sections */
            <>
              {/* Follow Requests Summary Row */}
              {requests.length > 0 && (
                <div
                  onClick={() => setViewingAllRequests(true)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="relative flex -space-x-4">
                      {requests.slice(0, 2).map((item, idx) => {
                        const follower = item.follower || item;
                        return (
                          <Avatar
                            key={item._id || idx}
                            src={follower.profilePic}
                            alt="Requester"
                            gender={follower.gender}
                            username={follower.username || follower.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                          />
                        );
                      })}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Follow requests</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Approve or ignore requests
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0095F6]" />
                    <span className="text-xs font-semibold text-[#0095F6]">
                      {requests.length}
                    </span>
                    <FaChevronRight className="text-xs text-gray-400 ml-1" />
                  </div>
                </div>
              )}

              {/* Pending Requests Preview (if any) */}
              {requests.length > 0 && (
                <div>
                  <span className="font-bold text-sm text-gray-900 block mb-3 px-1">
                    Pending requests
                  </span>
                  <div className="space-y-3">
                    {requests.slice(0, 3).map((item) => {
                      const follower = item.follower || item;
                      const followerId = follower._id || follower.id || item._id;
                      const username = follower.username || follower.name || "user";
                      return (
                        <div
                          key={item._id || followerId}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition"
                        >
                          <Link
                            to={`/profile/${followerId || ""}`}
                            onClick={onClose}
                            className="flex items-center space-x-3.5 flex-1 min-w-0 mr-2"
                          >
                            <Avatar
                              src={follower.profilePic}
                              alt={username}
                              gender={follower.gender}
                              username={username}
                              className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0"
                            />
                            <div className="truncate leading-snug">
                              <p className="text-xs text-gray-900">
                                <span className="font-semibold">{username}</span> requested to follow you.{" "}
                                <span className="text-gray-400 text-[11px]">{formatTimeAgo(item.createdAt)}</span>
                              </p>
                            </div>
                          </Link>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleAccept(followerId)}
                              className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleReject(followerId)}
                              className="bg-[#EFEFEF] hover:bg-[#DBDBDB] text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity Section (New Followers & Accepted Requests) */}
              <div>
                <span className="font-bold text-sm text-gray-900 block mb-3 px-1">
                  Activity
                </span>
                <div className="space-y-3">
                  {activity.length === 0 && requests.length === 0 && !loading && (
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-xs text-gray-500 font-medium">
                        No new notifications
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        When people accept your requests or follow you, you&apos;ll see it here.
                      </p>
                    </div>
                  )}

                  {activity.map((act) => {
                    const actUser = act.user || {};
                    const actUsername = actUser.username || actUser.name || "user";
                    const isAccepted = act.type === "accepted_request";

                    return (
                      <div
                        key={act._id || actUser._id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition"
                      >
                        <Link
                          to={`/profile/${actUser._id || ""}`}
                          onClick={onClose}
                          className="flex items-center space-x-3.5 flex-1 min-w-0"
                        >
                          <Avatar
                            src={actUser.profilePic}
                            alt={actUsername}
                            gender={actUser.gender}
                            username={actUsername}
                            className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0"
                          />
                          <div className="truncate leading-snug">
                            <p className="text-xs text-gray-900">
                              <span className="font-semibold">{actUsername}</span>{" "}
                              {isAccepted ? "accepted your follow request." : "started following you."}{" "}
                              <span className="text-gray-400 text-[11px]">
                                {formatTimeAgo(act.createdAt)}
                              </span>
                            </p>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsDrawer;
