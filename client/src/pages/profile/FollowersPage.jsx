import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  followersSelector,
  getFollowersAsync,
  removeFollowerAsync,
} from "../../redux/slices/followersSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Users } from "lucide-react";

import UserListSkeleton from "../../components/common/skeletons/UserListSkeleton";
import Avatar from "../../components/common/Avatar";

export function FollowersPage() {
  const dispatch = useDispatch();
  const { loading, followers: initialFollowers } = useSelector(followersSelector);
  const { userId: currentUserId } = useSelector(usersSelector);
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRemoving, setIsRemoving] = useState({});

  useEffect(() => {
    if (userId) {
      dispatch(getFollowersAsync(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    setFollowers(initialFollowers || []);
  }, [initialFollowers]);

  const removeFollower = async (followerId) => {
    setIsRemoving((prev) => ({ ...prev, [followerId]: true }));
    setFollowers(
      followers.filter((follower) => follower.follower?._id !== followerId)
    );
    await dispatch(removeFollowerAsync(followerId));
    setIsRemoving((prev) => ({ ...prev, [followerId]: false }));
  };

  const filteredFollowers = followers.filter(
    (user) =>
      user.follower?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.follower?.username?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="min-h-screen py-4 px-2">
        <div className="max-w-2xl mx-auto">
          <UserListSkeleton count={6} />
        </div>
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
            <h1 className="text-lg font-bold text-gray-800">Followers</h1>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-200 w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Search followers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div>
          {followers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">No Followers Yet</h3>
              <p className="text-xs text-gray-500 mb-4">
                When people follow this account, they will appear here.
              </p>
              <Link
                to="/explore"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-5 rounded-full transition"
              >
                Find people
              </Link>
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">
                No followers matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <motion.ul
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {filteredFollowers.map((follower) => (
                <motion.li
                  key={follower._id}
                  variants={item}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 flex items-center justify-between"
                >
                  <Link
                    to={`/profile/${follower.follower?._id}`}
                    className="flex items-center space-x-3"
                  >
                    <Avatar
                      src={follower.follower?.profilePic}
                      alt={follower.follower?.name || "User"}
                      gender={follower.follower?.gender}
                      username={follower.follower?.username || follower.follower?.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 leading-tight">
                        {follower.follower?.name}
                      </h3>
                      {follower.follower?.username && (
                        <p className="text-xs text-gray-500">@{follower.follower.username}</p>
                      )}
                    </div>
                  </Link>

                  {currentUserId === userId && (
                    <button
                      onClick={() => removeFollower(follower.follower?._id)}
                      disabled={isRemoving[follower.follower?._id]}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      {isRemoving[follower.follower?._id] ? "Removing..." : "Remove"}
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

export default FollowersPage;
