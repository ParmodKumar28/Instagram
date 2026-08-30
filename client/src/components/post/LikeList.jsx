import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import {
  toggleFollowAsync,
  getFollowingAsync,
  followersSelector,
} from "../../redux/slices/followersSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import Avatar from "../common/Avatar";

export function LikeList({ likes = [], likeList = [], onClose }) {
  const dispatch = useDispatch();
  const rawList = likeList.length > 0 ? likeList : likes;
  const { following = [] } = useSelector(followersSelector);
  const { userId: currentUserId, signedUser } = useSelector(usersSelector);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMap, setLoadingMap] = useState({});
  const [followedUserIds, setFollowedUserIds] = useState(new Set());

  // Ensure current user's following list is fresh
  useEffect(() => {
    const effectiveUserId = currentUserId || signedUser?._id;
    if (effectiveUserId) {
      dispatch(getFollowingAsync(effectiveUserId));
    }
  }, [dispatch, currentUserId, signedUser?._id]);

  // Synchronize followed user IDs accurately
  useEffect(() => {
    const ids = new Set();
    if (Array.isArray(following)) {
      following.forEach((item) => {
        let fId = "";
        if (item?.following) {
          fId =
            typeof item.following === "object"
              ? item.following._id || item.following.id
              : item.following;
        }
        if (fId) ids.add(fId.toString());
      });
    }
    if (Array.isArray(signedUser?.following)) {
      signedUser.following.forEach((item) => {
        const fId =
          typeof item === "object" ? item?._id || item?.id : item;
        if (fId) ids.add(fId.toString());
      });
    }
    setFollowedUserIds(ids);
  }, [following, signedUser?.following]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filteredLikes = rawList.filter((item) => {
    const user = item.user || {};
    const uname = user.username || user.name || "";
    const fullName = user.name || "";
    return (
      uname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleToggleFollow = async (targetUserId) => {
    if (!targetUserId || loadingMap[targetUserId]) return;
    const targetStr = targetUserId.toString();
    const wasFollowing = followedUserIds.has(targetStr);

    // Instant optimistic toggle
    setFollowedUserIds((prev) => {
      const next = new Set(prev);
      if (wasFollowing) {
        next.delete(targetStr);
      } else {
        next.add(targetStr);
      }
      return next;
    });

    setLoadingMap((prev) => ({ ...prev, [targetStr]: true }));
    try {
      const res = await dispatch(toggleFollowAsync(targetStr)).unwrap();
      if (res?.status === "accepted" || res?.isFollowing === true) {
        setFollowedUserIds((prev) => new Set(prev).add(targetStr));
      } else if (res?.status === "not-following" || res?.isFollowing === false) {
        setFollowedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(targetStr);
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      // Revert on error
      setFollowedUserIds((prev) => {
        const next = new Set(prev);
        if (wasFollowing) {
          next.add(targetStr);
        } else {
          next.delete(targetStr);
        }
        return next;
      });
    } finally {
      setLoadingMap((prev) => ({ ...prev, [targetStr]: false }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[420px] max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3.5 border-b border-gray-100">
          <div className="w-6" /> {/* spacer for centered title */}
          <h3 className="text-base font-semibold text-gray-900">Likes</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Search Bar (if more than 5 likes) */}
        {rawList.length > 5 && (
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 text-xs text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:bg-gray-200 transition"
            />
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-gray-50 max-h-[60vh]">
          {filteredLikes && filteredLikes.length > 0 ? (
            filteredLikes.map((likeItem, index) => {
              const user = likeItem.user || {};
              const userId = (user._id || user.id || "").toString();
              const username = user.username || user.name || "user";
              const fullName = user.name || "";
              const myIdStr = (currentUserId || signedUser?._id || "").toString();
              const isCurrentUser = myIdStr && userId === myIdStr;
              const isFollowing = followedUserIds.has(userId);
              const isLoading = !!loadingMap[userId];

              return (
                <div
                  key={likeItem._id || index}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Link
                    to={`/profile/${userId}`}
                    onClick={onClose}
                    className="flex items-center space-x-3 flex-1 min-w-0 pr-2"
                  >
                    <Avatar
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      src={user.profilePic}
                      alt={username}
                      gender={user.gender}
                      username={username}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-gray-900 hover:underline truncate">
                        {username}
                      </span>
                      {fullName && (
                        <span className="text-[11px] text-gray-500 truncate">
                          {fullName}
                        </span>
                      )}
                    </div>
                  </Link>

                  {!isCurrentUser && userId && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleFollow(userId)}
                      className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition active:scale-95 cursor-pointer ${
                        isFollowing
                          ? "bg-[#EFEFEF] hover:bg-[#DBDBDB] text-gray-900"
                          : "bg-[#0095F6] hover:bg-[#1877F2] text-white"
                      }`}
                    >
                      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">
              {searchTerm ? "No users found" : "No likes yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LikeList;
