import { useEffect, useState } from "react";
import {
  fetchUserPostsAsync,
  postsSelector,
} from "../../redux/slices/postsSlice";
import {
  logoutAsync,
  userDataAsync,
  usersSelector,
} from "../../redux/slices/usersSlice";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserPostList from "../../components/profile/UserPostList";
import {
  FaHeart,
  FaComment,
  FaLink,
  FaUserEdit,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  followersSelector,
  getFollowingAsync,
  getFollowStatusAsync,
  toggleFollowAsync,
  unfollowUserAsync,
} from "../../redux/slices/followersSlice";
import { motion, AnimatePresence } from "framer-motion";

export function ProfilePage() {
  const dispatch = useDispatch();
  const { userData, userLoading, userId: currentUserId } = useSelector(usersSelector);
  const { userPosts, userPostsLoading } = useSelector(postsSelector);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { following, followStatus } = useSelector(followersSelector);
  const [isProfilePicZoomed, setIsProfilePicZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const currentFollowStatus = followStatus || "none";

  useEffect(() => {
    if (userId) {
      dispatch(userDataAsync({ userId }));
      dispatch(fetchUserPostsAsync(userId));
      if (currentUserId) {
        dispatch(getFollowingAsync(currentUserId));
        dispatch(getFollowStatusAsync(userId));
      }
    }
  }, [dispatch, userId, currentUserId]);

  const [isFollowed, setIsFollowed] = useState(false);
  useEffect(() => {
    if (following) {
      setIsFollowed(following.some((user) => user.following?._id === userId));
    }
  }, [following, userId]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (currentFollowStatus === "following" || isFollowed) {
      await dispatch(unfollowUserAsync(userId));
    } else {
      await dispatch(toggleFollowAsync(userId));
    }
    dispatch(getFollowStatusAsync(userId));
    if (currentUserId) {
      dispatch(getFollowingAsync(currentUserId));
    }
  };

  const handleProfilePicClick = () => {
    setIsProfilePicZoomed(!isProfilePicZoomed);
  };

  const { user } = userData || {};
  const defaultProfilePic = "https://placekitten.com/200/200";
  const isOwnProfile = currentUserId === userId;
  const isPrivate = user?.accountType === "private";
  const isLocked = isPrivate && !isOwnProfile;

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">
            The profile you are looking for does not exist or may have been removed.
          </p>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-6 rounded-full transition"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Banner */}
          <div className="h-36 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative">
            {isOwnProfile && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <Link to="/edit-profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-semibold py-2 px-4 rounded-full flex items-center transition"
                  >
                    <FaUserEdit className="mr-1.5" />
                    Edit Profile
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-semibold py-2 px-4 rounded-full flex items-center transition"
                >
                  <FaSignOutAlt className="mr-1.5" />
                  Logout
                </motion.button>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              <motion.div whileHover={{ scale: 1.03 }} className="relative self-start md:self-auto">
                <img
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-md cursor-pointer bg-white"
                  onClick={handleProfilePicClick}
                  src={user.profilePic || defaultProfilePic}
                  alt={user.username}
                />
              </motion.div>

              <div className="md:ml-6 mt-3 md:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {user.username}
                  </h1>
                  {!isOwnProfile && (
                    <div className="mt-2 sm:mt-0">
                      <button
                        onClick={handleFollowToggle}
                        className={`${
                          isFollowed
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        } text-xs font-semibold py-1.5 px-5 rounded-lg transition`}
                      >
                        {followStatus === "pending"
                          ? "Requested"
                          : isFollowed
                          ? "Following"
                          : "Follow"}
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-800 font-medium mt-1">{user.name}</p>
                <p className="text-sm text-gray-600 mt-1 max-w-lg whitespace-pre-line">
                  {user.bio || "No bio yet"}
                </p>

                {user.website && (
                  <a
                    href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                    className="inline-flex items-center text-blue-600 hover:underline text-xs font-medium mt-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLink className="mr-1" size={12} />
                    <span>{user.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-around md:justify-start md:space-x-10 border-t border-b border-gray-100 py-3 -mx-6 px-6">
              <div className="text-center md:text-left">
                <span className="block text-lg font-bold text-gray-900">
                  {user.posts?.length || 0}
                </span>
                <span className="text-xs text-gray-500">posts</span>
              </div>

              <Link
                to={isLocked ? "#" : `/followers/${user._id}`}
                className={`text-center md:text-left ${isLocked ? "cursor-default" : "hover:opacity-75"}`}
              >
                <span className="block text-lg font-bold text-gray-900">
                  {user.followers?.length || 0}
                </span>
                <span className="text-xs text-gray-500">followers</span>
              </Link>

              <Link
                to={isLocked ? "#" : `/following/${user._id}`}
                className={`text-center md:text-left ${isLocked ? "cursor-default" : "hover:opacity-75"}`}
              >
                <span className="block text-lg font-bold text-gray-900">
                  {user.following?.length || 0}
                </span>
                <span className="text-xs text-gray-500">following</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs & Posts */}
        {!isLocked ? (
          <div className="mt-6">
            <div className="flex justify-center border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center py-3 px-6 font-semibold text-xs tracking-wider uppercase transition relative ${
                  activeTab === "posts"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <FaHeart className="mr-1.5" />
                POSTS
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center py-3 px-6 font-semibold text-xs tracking-wider uppercase transition relative ${
                  activeTab === "saved"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <FaComment className="mr-1.5" />
                SAVED
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "posts" && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {userPostsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <UserPostList posts={userPosts} />
                  )}
                </motion.div>
              )}

              {activeTab === "saved" && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 bg-white rounded-xl border border-gray-200"
                >
                  <p className="text-sm font-semibold text-gray-700">Saved Items</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Only you can see what you've saved
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-6 text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-800">This Account is Private</h3>
            <p className="text-xs text-gray-500 mt-1">
              Follow this account to see their photos and videos.
            </p>
          </div>
        )}
      </div>

      {/* Profile Picture Modal */}
      <AnimatePresence>
        {isProfilePicZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
            onClick={handleProfilePicClick}
          >
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
              src={user.profilePic || defaultProfilePic}
              alt={user.username}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfilePage;
