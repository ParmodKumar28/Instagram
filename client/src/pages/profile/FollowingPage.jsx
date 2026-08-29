import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  followersSelector,
  getFollowingAsync,
  unfollowUserAsync,
} from "../../redux/slices/followersSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import { motion } from "framer-motion";
import { ArrowLeft, Search, UserX } from "lucide-react";

export function FollowingPage() {
  const dispatch = useDispatch();
  const { loading, following: initialFollowing } = useSelector(followersSelector);
  const { userId: currentUserId } = useSelector(usersSelector);
  const { userId } = useParams();
  const [following, setFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUnfollowing, setIsUnfollowing] = useState({});

  useEffect(() => {
    if (userId) {
      dispatch(getFollowingAsync(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    setFollowing(initialFollowing || []);
  }, [initialFollowing]);

  const handleUnfollow = async (followingId) => {
    setIsUnfollowing((prev) => ({ ...prev, [followingId]: true }));
    setFollowing(
      following.filter((item) => item.following?._id !== followingId)
    );
    await dispatch(unfollowUserAsync(followingId));
    setIsUnfollowing((prev) => ({ ...prev, [followingId]: false }));
  };

  const filteredFollowing = following.filter(
    (user) =>
      user.following?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.following?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-2">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-4">
          <div className="flex items-center mb-3">
            <Link to={`/profile/${userId}`} className="mr-3">
              <div className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                <ArrowLeft size={18} className="text-gray-700" />
              </div>
            </Link>
            <h1 className="text-lg font-bold text-gray-800">Following</h1>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-200 w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Search following"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          {following.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserX size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">Not Following Anyone</h3>
              <p className="text-xs text-gray-500 mb-4">
                When this user follows accounts, they will appear here.
              </p>
              <Link
                to="/explore"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-5 rounded-full transition"
              >
                Discover Profiles
              </Link>
            </div>
          ) : filteredFollowing.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">
                No users matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <motion.ul
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {filteredFollowing.map((followedUser) => (
                <motion.li
                  key={followedUser._id}
                  variants={item}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 flex items-center justify-between"
                >
                  <Link
                    to={`/profile/${followedUser.following?._id}`}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={
                        followedUser.following?.profilePic ||
                        "https://placekitten.com/100/100"
                      }
                      alt={followedUser.following?.name || "User"}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 leading-tight">
                        {followedUser.following?.name}
                      </h3>
                      {followedUser.following?.username && (
                        <p className="text-xs text-gray-500">
                          @{followedUser.following.username}
                        </p>
                      )}
                    </div>
                  </Link>

                  {currentUserId === userId && (
                    <button
                      onClick={() => handleUnfollow(followedUser.following?._id)}
                      disabled={isUnfollowing[followedUser.following?._id]}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      {isUnfollowing[followedUser.following?._id]
                        ? "Unfollowing..."
                        : "Following"}
                    </button>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowingPage;
