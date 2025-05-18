import { useEffect, useState } from "react"
import { fetchUserPostsAsync, postsSelector } from "../../../Redux/Reducer/postsReducer"
import { logoutAsync, userDataAsync, usersSelector } from "../../../Redux/Reducer/usersReducer"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import UserPostList from "../../../Components/User Post List/UserPostList"
import { FaHeart, FaComment, FaLink, FaUserEdit, FaSignOutAlt } from "react-icons/fa"
import Cookies from "js-cookie"
import {
  followersSelector,
  getFollowingAsync,
  getFollowStatusAsync,
  toggleFollowAsync,
  unfollowUserAsync,
} from "../../../Redux/Reducer/followersReducer"
import { motion, AnimatePresence } from "framer-motion"

const UserPage = () => {
  const dispatch = useDispatch()
  const { userData, userLoading } = useSelector(usersSelector)
  const { userPosts, userPostsLoading } = useSelector(postsSelector)
  const [signedUser, setSignedUser] = useState(null)
  const { userId } = useParams()
  const navigate = useNavigate()
  const { following, followStatus } = useSelector(followersSelector)
  const [isProfilePicZoomed, setIsProfilePicZoomed] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  // Always use the Redux followStatus for the button
  const currentFollowStatus = followStatus || "none"

  useEffect(() => {
    const userIdFromCookies = Cookies.get("userId")
    setSignedUser(userIdFromCookies)
    if (userIdFromCookies) {
      dispatch(userDataAsync({ userId }))
      dispatch(fetchUserPostsAsync(userId))
      dispatch(getFollowingAsync(userIdFromCookies))
      dispatch(getFollowStatusAsync(userId))
    }
  }, [dispatch, userId])

  // Update following state for UI (optional, can be removed if you use only followStatus)
  const [isFollowed, setIsFollowed] = useState(false)
  useEffect(() => {
    if (following) {
      setIsFollowed(following.some((user) => user.following._id === userId))
    }
  }, [following, userId])

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync())
      if (!Cookies.get("isSignIn")) {
        navigate("/login")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Update follow status live after follow/unfollow
const handleFollowToggle = async () => {
  if (currentFollowStatus === "following" || isFollowed) {
    await dispatch(unfollowUserAsync(userId))
  } else {
    await dispatch(toggleFollowAsync(userId))
  }
  // Re-fetch follow status and following list
  dispatch(getFollowStatusAsync(userId))
  dispatch(getFollowingAsync(signedUser))
}

  const handleProfilePicClick = () => {
    setIsProfilePicZoomed(!isProfilePicZoomed)
  }

  // Private profile logic
  const { user } = userData
  const defaultProfilePic = "https://placekitten.com/200/200"
  const isOwnProfile = signedUser === userId
  const isPrivate = user?.accountType === "private"
  const isLocked = isPrivate && !isOwnProfile

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User not found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full transition duration-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative">
            {isOwnProfile && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <Link to="/edit-profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium py-2 px-4 rounded-full flex items-center transition duration-300"
                  >
                    <FaUserEdit className="mr-2" />
                    Edit Profile
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium py-2 px-4 rounded-full flex items-center transition duration-300"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </motion.button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <img
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md cursor-pointer"
                  onClick={handleProfilePicClick}
                  src={user.profilePic || defaultProfilePic}
                  alt={user.username}
                />
                <div className="absolute bottom-0 right-0 bg-gray-100 rounded-full p-1 border-2 border-white">
                  <div className={`w-3 h-3 rounded-full ${Math.random() > 0.5 ? "bg-green-500" : "bg-gray-400"}`}></div>
                </div>
              </motion.div>

              <div className="md:ml-6 mt-4 md:mt-0 flex-grow">
                <h1 className="text-2xl font-bold text-gray-800">{user.username}</h1>
                <p className="text-gray-600 mt-1 max-w-lg">{user.bio || "No bio yet"}</p>
                {user.website && (
                  <a
                    href={user.website}
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 mt-2 transition duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLink className="mr-1" size={14} />
                    <span className="underline">{user.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
                {isLocked && (
                  <div className="flex items-center text-gray-500 mt-2">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v.01M17 8V7a5 5 0 00-10 0v1M5 8h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                    </svg>
                    <span>This profile is private. Follow to see their posts.</span>
                  </div>
                )}
              </div>

              {!isOwnProfile && (
                <div className="mt-4 md:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollowToggle}
                    className={`${
                      isFollowed
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                      } font-medium py-2 px-6 rounded-full transition duration-300`}
                  >
                    {followStatus === "pending" ? "Cancel Request" : isFollowed ? "Unfollow" : "Follow"}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-around md:justify-start md:space-x-8 border-t border-b border-gray-100 py-4 -mx-6 px-6 mb-6">
              <div className="text-center md:text-left">
                <span className="block text-2xl font-bold text-gray-800 cursor-pointer">
                  {user.posts.length}
                </span>
                <span className="text-gray-500 text-sm">Posts</span>
              </div>

              {isLocked ? (
                <div className="text-center md:text-left">
                  <span className="block text-2xl font-bold text-gray-800 cursor-pointer">
                    {user.followers.length}
                  </span>
                  <span className="text-gray-500 text-sm">Followers</span>
                </div>
              ) : (
                <Link to={`/followers/${user._id}`} className="text-center md:text-left">
                  <span className="block text-2xl font-bold text-gray-800 cursor-pointer">
                    {user.followers.length}
                  </span>
                  <span className="text-gray-500 text-sm">Followers</span>
                </Link>
              )}

              {isLocked ? (
                <div className="text-center md:text-left">
                  <span className="block text-2xl font-bold text-gray-800 cursor-pointer">
                    {user.following.length}
                  </span>
                  <span className="text-gray-500 text-sm">Following</span>
                </div>
              ) : (
                <Link to={`/following/${user._id}`} className="text-center md:text-left">
                  <span className="block text-2xl font-bold text-gray-800 cursor-pointer">
                    {user.following.length}
                  </span>
                  <span className="text-gray-500 text-sm">Following</span>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        {!isLocked ? (
          <div className="mt-8">
            <div className="flex justify-center border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center py-3 px-6 font-medium text-sm transition duration-300 relative ${activeTab === "posts" ? "text-blue-500" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                <FaHeart className="mr-2" />
                POSTS
                {activeTab === "posts" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center py-3 px-6 font-medium text-sm transition duration-300 relative ${activeTab === "saved" ? "text-blue-500" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                <FaComment className="mr-2" />
                SAVED
                {activeTab === "saved" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            </div>

            {/* Posts Content */}
            <AnimatePresence mode="wait">
              {activeTab === "posts" && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {userPostsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-10 h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                      <div className="text-gray-400 mb-4">
                        <svg
                          className="w-16 h-16 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">No posts yet</h3>
                      <p className="text-gray-500 mt-1">When {user.username} shares posts, they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      <UserPostList posts={userPosts} />
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "saved" && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12 bg-white rounded-lg shadow-sm"
                >
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Saved items</h3>
                  <p className="text-gray-500 mt-1">Only you can see what you've saved</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-8">
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17v.01M17 8V7a5 5 0 00-10 0v1M5 8h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800">This account is private</h3>
              <p className="text-gray-500 mt-1">Follow to see their posts and saved items.</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Picture Modal */}
      <AnimatePresence>
        {isProfilePicZoomed &&   (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
            onClick={handleProfilePicClick}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-full max-h-[80vh] rounded-xl object-contain"
              src={user.profilePic || defaultProfilePic}
              alt={user.username}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserPage