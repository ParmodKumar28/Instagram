import { useEffect, useState } from "react";
import {
  fetchUserPostsAsync,
  postsSelector,
  clearUserPosts,
} from "../../redux/slices/postsSlice";
import {
  userDataAsync,
  usersSelector,
  clearProfileUser,
} from "../../redux/slices/usersSlice";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserPostList from "../../components/profile/UserPostList";
import {
  followersSelector,
  getFollowingAsync,
  getFollowStatusAsync,
  toggleFollowAsync,
  unfollowUserAsync,
} from "../../redux/slices/followersSlice";
import { IoSettingsOutline, IoLockClosedOutline, IoLinkOutline } from "react-icons/io5";
import { BsGrid3X3, BsBookmark, BsPersonSquare } from "react-icons/bs";
import ProfileSkeleton from "../../components/common/skeletons/ProfileSkeleton";

export function ProfilePage() {
  const dispatch = useDispatch();
  const { profileUser, signedUser, userLoading, userId: currentUserId } = useSelector(usersSelector);
  const { userPosts, userPostsLoading } = useSelector(postsSelector);
  const { userId } = useParams();
  const { following, followStatus } = useSelector(followersSelector);
  const [activeTab, setActiveTab] = useState("posts");
  const [isProfilePicZoomed, setIsProfilePicZoomed] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(clearUserPosts());
      dispatch(clearProfileUser());
      dispatch(userDataAsync({ userId }));
      dispatch(fetchUserPostsAsync(userId));
      if (currentUserId) {
        dispatch(getFollowingAsync(currentUserId));
        dispatch(getFollowStatusAsync(userId));
      }
    }
  }, [dispatch, userId, currentUserId]);

  const isOwnProfile = !userId || currentUserId === userId;
  const user = isOwnProfile ? signedUser : profileUser;
  
  const isFollowed =
    followStatus === "accepted" ||
    (user?.followers && user.followers.some((f) => (f._id || f).toString() === (currentUserId || "").toString())) ||
    (following && following.some((u) => (u.following?._id || u.following || u._id).toString() === (userId || "").toString()));

  const isPending =
    !isFollowed &&
    (followStatus === "pending" ||
      (user?.requests && user.requests.some((r) => (r._id || r).toString() === (currentUserId || "").toString())));

  const isPrivate = user?.accountType === "private";
  const isLocked = isPrivate && !isOwnProfile && !isFollowed;

  const handleFollowAction = async () => {
    if (isFollowed) {
      await dispatch(unfollowUserAsync(userId));
    } else {
      await dispatch(toggleFollowAsync(userId));
      if (!isPrivate) {
        dispatch(fetchUserPostsAsync(userId));
      }
    }
    dispatch(getFollowStatusAsync(userId));
    dispatch(userDataAsync({ userId }));
    if (currentUserId) {
      dispatch(getFollowingAsync(currentUserId));
    }
  };

  if (userLoading && !user) {
    return <ProfileSkeleton />;
  }

  if (!user && !userLoading) {
    return (
      <div className="flex justify-center items-center py-20 px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">
            The profile you are looking for does not exist or may have been removed.
          </p>
          <Link
            to="/"
            className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-sm font-semibold py-2 px-6 rounded-lg transition"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[935px] mx-auto pt-4 md:pt-8 px-4 sm:px-6 select-none">
      {/* Profile Header */}
      <header className="flex flex-col sm:flex-row items-center sm:items-start mb-8 md:mb-12">
        {/* Profile Picture */}
        <div className="flex-shrink-0 sm:w-[290px] flex justify-center mb-4 sm:mb-0">
          <div
            onClick={() => setIsProfilePicZoomed(true)}
            className="w-24 h-24 sm:w-36 sm:h-36 md:w-38 md:h-38 rounded-full border border-gray-200 overflow-hidden cursor-pointer hover:opacity-90 transition"
          >
            <img
              src={user?.profilePic || "https://placekitten.com/200/200"}
              alt={user?.username || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="flex-1 text-center sm:text-left sm:pl-4">
          {/* Top Row: Username + Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-normal text-gray-900">
              {user?.username}
            </h1>

            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/edit-profile"
                  className="bg-[#EFEFEF] hover:bg-[#DBDBDB] text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  Edit profile
                </Link>
                <Link
                  to="/edit-profile"
                  className="p-2 text-gray-900 hover:text-gray-600 transition"
                  aria-label="Settings"
                >
                  <IoSettingsOutline className="text-2xl" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollowAction}
                  className={`${
                    isFollowed || isPending
                      ? "bg-[#EFEFEF] hover:bg-[#DBDBDB] text-gray-900"
                      : "bg-[#0095F6] hover:bg-[#1877F2] text-white"
                  } text-sm font-semibold px-5 py-1.5 rounded-lg transition shadow-sm`}
                >
                  {isPending ? "Requested" : isFollowed ? "Following" : "Follow"}
                </button>
                <Link
                  to="#messages"
                  className="bg-[#EFEFEF] hover:bg-[#DBDBDB] text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  Message
                </Link>
              </div>
            )}
          </div>

          {/* Middle Row: Stats (Desktop inline) */}
          <div className="hidden sm:flex items-center space-x-10 mb-4 text-sm text-gray-900">
            <div>
              <span className="font-semibold">{user?.posts?.length || userPosts?.length || 0}</span> posts
            </div>
            <Link
              to={isLocked ? "#" : `/followers/${user?._id || userId}`}
              className={isLocked ? "cursor-default pointer-events-none" : "hover:opacity-75"}
            >
              <span className="font-semibold">{user?.followers?.length || 0}</span> followers
            </Link>
            <Link
              to={isLocked ? "#" : `/following/${user?._id || userId}`}
              className={isLocked ? "cursor-default pointer-events-none" : "hover:opacity-75"}
            >
              <span className="font-semibold">{user?.following?.length || 0}</span> following
            </Link>
          </div>

          {/* Bottom Row: Name, Bio, and Website */}
          <div className="text-sm text-gray-900 leading-snug">
            {user?.name && <p className="font-semibold">{user.name}</p>}
            {user?.bio && (
              <p className="whitespace-pre-line text-gray-900 mt-1 font-normal">
                {user.bio}
              </p>
            )}
            {user?.website && (
              <a
                href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                className="inline-flex items-center text-[#00376B] hover:underline font-semibold mt-1.5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IoLinkOutline className="mr-1 text-sm" />
                <span>{user.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Stats Row (Visible on small screens) */}
      <div className="sm:hidden flex justify-around border-t border-b border-gray-200 py-3 mb-4 text-center text-xs text-gray-500">
        <div>
          <span className="block text-sm font-semibold text-gray-900">
            {user?.posts?.length || userPosts?.length || 0}
          </span>
          posts
        </div>
        <Link
          to={isLocked ? "#" : `/followers/${user?._id || userId}`}
          className={isLocked ? "cursor-default pointer-events-none" : ""}
        >
          <span className="block text-sm font-semibold text-gray-900">
            {user?.followers?.length || 0}
          </span>
          followers
        </Link>
        <Link
          to={isLocked ? "#" : `/following/${user?._id || userId}`}
          className={isLocked ? "cursor-default pointer-events-none" : ""}
        >
          <span className="block text-sm font-semibold text-gray-900">
            {user?.following?.length || 0}
          </span>
          following
        </Link>
      </div>

      {/* Tab Navigation Bar & Posts */}
      {!isLocked ? (
        <div>
          <div className="flex justify-center border-t border-gray-200">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center space-x-1.5 py-3.5 px-6 text-xs font-semibold tracking-wider uppercase transition ${
                activeTab === "posts"
                  ? "border-t border-black -mt-[1px] text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BsGrid3X3 className="text-sm" />
              <span>POSTS</span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center space-x-1.5 py-3.5 px-6 text-xs font-semibold tracking-wider uppercase transition ${
                  activeTab === "saved"
                    ? "border-t border-black -mt-[1px] text-black"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <BsBookmark className="text-sm" />
                <span>SAVED</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("tagged")}
              className={`flex items-center space-x-1.5 py-3.5 px-6 text-xs font-semibold tracking-wider uppercase transition ${
                activeTab === "tagged"
                  ? "border-t border-black -mt-[1px] text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BsPersonSquare className="text-sm" />
              <span>TAGGED</span>
            </button>
          </div>

          {/* Posts Grid */}
          <div className="mt-4 pb-12">
            {activeTab === "posts" && (
              userPostsLoading ? (
                <div className="grid grid-cols-3 gap-1 sm:gap-6 animate-pulse">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-200 rounded-sm sm:rounded-md"
                    />
                  ))}
                </div>
              ) : (
                <UserPostList posts={userPosts} />
              )
            )}

            {activeTab === "saved" && (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
                <p className="text-sm font-semibold text-gray-800">Saved Posts</p>
                <p className="text-xs text-gray-400 mt-1">
                  Only you can see what you&apos;ve saved
                </p>
              </div>
            )}

            {activeTab === "tagged" && (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
                <p className="text-sm font-semibold text-gray-800">Photos of you</p>
                <p className="text-xs text-gray-400 mt-1">
                  When people tag you in photos, they&apos;ll appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Private Account Locked Banner */
        <div className="mt-6 py-16 px-6 bg-white border border-gray-200 rounded-xl text-center shadow-sm">
          <div className="w-14 h-14 rounded-full border-2 border-gray-900 mx-auto flex items-center justify-center mb-4">
            <IoLockClosedOutline className="text-2xl text-gray-900" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">This account is private</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Follow to see their photos and videos.
          </p>
        </div>
      )}

      {/* Profile Picture Fullscreen Preview */}
      {isProfilePicZoomed && (
        <div
          className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4"
          onClick={() => setIsProfilePicZoomed(false)}
        >
          <img
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-150"
            src={user?.profilePic || "https://placekitten.com/200/200"}
            alt={user?.username || "Profile"}
          />
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
