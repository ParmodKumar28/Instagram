import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { followersSelector, getFollowersAsync, removeFollowerAsync } from "../../Redux/Reducer/followersReducer"
import { Link, useParams } from "react-router-dom"
import Cookies from "js-cookie"
import { motion } from "framer-motion"
import { UserMinus, ArrowLeft, Search, Users } from "lucide-react"

const FollowerList = () => {
  const dispatch = useDispatch()
  const { loading, followers: initialFollowers } = useSelector(followersSelector)
  const { userId } = useParams()
  const [signedUser, setSignedUser] = useState("")
  const [followers, setFollowers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isRemoving, setIsRemoving] = useState({})

  useEffect(() => {
    setSignedUser(Cookies.get("userId"))
  }, [])

  useEffect(() => {
    dispatch(getFollowersAsync(userId))
  }, [dispatch, userId])

  useEffect(() => {
    setFollowers(initialFollowers || [])
  }, [initialFollowers])

  const removeFollower = async (followerId) => {
    // Set loading state for this specific user
    setIsRemoving((prev) => ({ ...prev, [followerId]: true }))

    // Optimistically update the followers list
    setFollowers(followers.filter((follower) => follower.follower._id !== followerId))

    // Dispatch the remove follower action
    await dispatch(removeFollowerAsync(followerId))

    // Reset loading state
    setIsRemoving((prev) => ({ ...prev, [followerId]: false }))
  }

  const filteredFollowers = followers.filter(
    (user) =>
      user.follower.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.follower.username?.toLowerCase().includes(searchQuery.toLowerCase()),
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
          <p className="mt-4 text-gray-600 font-medium">Loading followers...</p>
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
            <h1 className="text-xl font-bold text-gray-800">Followers</h1>
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
                placeholder="Search followers"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {followers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No followers yet</h3>
              <p className="text-gray-500 mb-6">When people follow you, they'll appear here.</p>
              <Link to="/explore">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full transition duration-300"
                >
                  Find friends
                </motion.button>
              </Link>
            </motion.div>
          ) : filteredFollowers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-500">We couldn't find any followers matching "{searchQuery}"</p>
            </motion.div>
          ) : (
            <motion.ul variants={container} initial="hidden" animate="show" className="space-y-3">
              {filteredFollowers.map((follower) => (
                <motion.li key={follower._id} variants={item} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center">
                    <Link to={`/profile/${follower.follower._id}`} className="flex-shrink-0">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={follower.follower.profilePic || "https://placekitten.com/200/200"}
                        alt={follower.follower.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    </Link>

                    <div className="ml-4 flex-grow">
                      <Link to={`/profile/${follower.follower._id}`} className="hover:underline">
                        <h3 className="font-semibold text-gray-800">{follower.follower.name}</h3>
                      </Link>
                      {follower.follower.username && (
                        <p className="text-gray-500 text-sm">@{follower.follower.username}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Followed you{" "}
                        {new Date(follower.createdAt).toLocaleDateString(undefined, {
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
                        onClick={() => removeFollower(follower.follower._id)}
                        disabled={isRemoving[follower.follower._id]}
                        className={`flex items-center justify-center ml-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          isRemoving[follower.follower._id]
                            ? "bg-gray-200 text-gray-500"
                            : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500"
                        }`}
                      >
                        {isRemoving[follower.follower._id] ? (
                          <div className="w-4 h-4 border-t-2 border-gray-500 rounded-full animate-spin mr-1"></div>
                        ) : (
                          <UserMinus size={16} className="mr-1" />
                        )}
                        Remove
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

export default FollowerList
