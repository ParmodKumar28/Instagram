import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { followersSelector, getFollowingAsync, unfollowUserAsync } from "../../Redux/Reducer/followersReducer"
import Cookies from "js-cookie"
import { motion } from "framer-motion"
import { UserMinus, ArrowLeft, Search, UserX } from "lucide-react"

const FollowingList = () => {
  const dispatch = useDispatch()
  const { loading, following: initialFollowing } = useSelector(followersSelector)
  const { userId } = useParams()
  const [signedUser, setSignedUser] = useState("")
  const [following, setFollowing] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isUnfollowing, setIsUnfollowing] = useState({})

  useEffect(() => {
    setSignedUser(Cookies.get("userId"))
  }, [])

  useEffect(() => {
    dispatch(getFollowingAsync(userId))
  }, [dispatch, userId])

  useEffect(() => {
    setFollowing(initialFollowing || [])
  }, [initialFollowing])

  const unfollow = async (followingId) => {
    // Set loading state for this specific user
    setIsUnfollowing((prev) => ({ ...prev, [followingId]: true }))

    // Optimistically update the following list
    setFollowing(following.filter((followedUser) => followedUser.following._id !== followingId))

    // Dispatch the unfollow action
    await dispatch(unfollowUserAsync(followingId))

    // Reset loading state
    setIsUnfollowing((prev) => ({ ...prev, [followingId]: false }))
  }

  const filteredFollowing = following.filter(
    (user) =>
      user.following.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.following.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading following list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="sticky top-0 bg-white shadow-sm z-10 rounded-b-xl">
          <div className="flex items-center p-4">
            <Link to={`/profile/${userId}`} className="mr-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gray-100 p-2 rounded-full"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </motion.div>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Following</h1>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Search following"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {following.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Not following anyone</h3>
              <p className="text-gray-500 mb-6">When you follow people, they'll appear here.</p>
              <Link to="/explore">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full transition duration-300"
                >
                  Discover people
                </motion.button>
              </Link>
            </motion.div>
          ) : filteredFollowing.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-500">We couldn't find any users matching "{searchQuery}"</p>
            </motion.div>
          ) : (
            <motion.ul variants={container} initial="hidden" animate="show" className="space-y-3">
              {filteredFollowing.map((followedUser) => (
                <motion.li
                  key={followedUser._id}
                  variants={item}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-4 flex items-center">
                    <Link to={`/profile/${followedUser.following._id}`} className="flex-shrink-0">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={followedUser.following.profilePic || "https://placekitten.com/200/200"}
                        alt={followedUser.following.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    </Link>

                    <div className="ml-4 flex-grow">
                      <Link to={`/profile/${followedUser.following._id}`} className="hover:underline">
                        <h3 className="font-semibold text-gray-800">{followedUser.following.name}</h3>
                      </Link>
                      {followedUser.following.username && (
                        <p className="text-gray-500 text-sm">@{followedUser.following.username}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Followed{" "}
                        {new Date(followedUser.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {signedUser === userId && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => unfollow(followedUser.following._id)}
                        disabled={isUnfollowing[followedUser.following._id]}
                        className={`flex items-center justify-center ml-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          isUnfollowing[followedUser.following._id]
                            ? "bg-gray-200 text-gray-500"
                            : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500"
                        }`}
                      >
                        {isUnfollowing[followedUser.following._id] ? (
                          <div className="w-4 h-4 border-t-2 border-gray-500 rounded-full animate-spin mr-1"></div>
                        ) : (
                          <UserMinus size={16} className="mr-1" />
                        )}
                        Unfollow
                      </motion.button>
                    )}
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default FollowingList
