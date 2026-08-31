import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usersSelector } from "../../redux/slices/usersSlice";
import { userService, followerService } from "../../services";
import Avatar from "../common/Avatar";

export function FeedSuggestionsSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const { signedUser } = useSelector(usersSelector);
  const currentUser = signedUser;

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await userService.getSuggestedUsers();
        if (response?.data?.users) {
          setSuggestions(response.data.users);
          // Check following status
          const initialFollowing = {};
          response.data.users.forEach((user) => {
            if (user.followers && currentUser?._id) {
              initialFollowing[user._id] = user.followers.some(
                (f) => (f._id || f) === currentUser._id
              );
            }
          });
          setFollowingMap(initialFollowing);
        }
      } catch (error) {
        console.error("Failed to load suggested users:", error);
      }
    };

    fetchSuggestions();
  }, [currentUser?._id]);

  const handleToggleFollow = async (userId) => {
    try {
      await followerService.toggleFollow(userId);
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  return (
    <aside className="w-[340px] hidden lg:block pt-5 select-none">
      {/* Current User Profile Row */}
      {currentUser && (
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/profile/${currentUser._id}`}
            className="flex items-center space-x-3.5 hover:opacity-85 transition group"
          >
            <Avatar
              src={currentUser.profilePic}
              alt={currentUser.username}
              gender={currentUser.gender}
              username={currentUser.username}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div className="leading-tight">
              <p className="font-semibold text-gray-900 text-sm group-hover:underline">
                {currentUser.username}
              </p>
              <p className="text-gray-400 text-xs truncate max-w-[160px] font-normal mt-0.5">
                {currentUser.name}
              </p>
            </div>
          </Link>
          <Link
            to="/edit-profile"
            className="text-xs font-semibold text-sky-500 hover:text-sky-700 transition"
          >
            Switch
          </Link>
        </div>
      )}

      {/* Suggestions Header */}
      {suggestions.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-500 text-sm">Suggested for you</span>
          <Link
            to="/discover"
            className="font-semibold text-gray-900 text-xs hover:text-gray-500 transition"
          >
            See all
          </Link>
        </div>
      )}

      {/* Suggestions List */}
      <div className="space-y-4 mb-7">
        {suggestions.map((item) => {
          const isFollowing = !!followingMap[item._id];
          return (
            <div key={item._id} className="flex items-center justify-between">
              <Link
                to={`/profile/${item._id}`}
                className="flex items-center space-x-3.5 group"
              >
                <Avatar
                  src={item.profilePic}
                  alt={item.username}
                  gender={item.gender}
                  username={item.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div className="leading-tight">
                  <p className="font-semibold text-gray-900 text-sm group-hover:underline">
                    {item.username}
                  </p>
                  <p className="text-gray-400 text-xs truncate max-w-[160px] mt-0.5">
                    {item.name || "Suggested for you"}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleToggleFollow(item._id)}
                className={`font-semibold text-xs transition ${
                  isFollowing
                    ? "text-gray-700 hover:text-red-500"
                    : "text-sky-500 hover:text-sky-700"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer & Educational Disclaimer */}
      <footer className="pt-3 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 font-medium">
          © 2026 INSTAGRAM CLONE BY PARMOD KUMAR
        </p>
        <p className="text-[10px] text-gray-400 mt-1 leading-tight">
          Educational Portfolio Project • Not affiliated with Meta Platforms, Inc.
        </p>
      </footer>
    </aside>
  );
}

export default FeedSuggestionsSidebar;
