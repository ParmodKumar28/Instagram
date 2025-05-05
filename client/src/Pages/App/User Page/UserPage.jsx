import { useEffect, useState } from 'react';
import { fetchUserPostsAsync, postsSelector } from '../../../Redux/Reducer/postsReducer';
import { logoutAsync, userDataAsync, usersSelector } from '../../../Redux/Reducer/usersReducer';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserPostList from '../../../Components/User Post List/UserPostList';
import { FaHeart, FaComment } from 'react-icons/fa'; // Import icons
import styles from "./UserPage.module.css"; // Import module CSS
import { Link } from 'react-router-dom';
import Cookies from "js-cookie"; // Import Cookies
import { ColorRing } from 'react-loader-spinner';
import { followersSelector, getFollowingAsync, toggleFollowAsync, unfollowUserAsync } from '../../../Redux/Reducer/followersReducer';

const UserPage = () => {
    const dispatch = useDispatch();
    const { userData, userLoading } = useSelector(usersSelector);
    const { userPosts, userPostsLoading } = useSelector(postsSelector);
    const [signedUser, setSignedUser] = useState(null);
    const { userId } = useParams();
    const navigate = useNavigate();
    const { following } = useSelector(followersSelector);
    const [isFollowed, setIsFollowed] = useState(false); // Initialize as false
    const [isProfilePicZoomed, setIsProfilePicZoomed] = useState(false);

    useEffect(() => {
        const userIdFromCookies = Cookies.get("userId");
        setSignedUser(userIdFromCookies);
        if (userIdFromCookies) {
            dispatch(userDataAsync({ userId }));
            dispatch(fetchUserPostsAsync(userId));
            dispatch(getFollowingAsync(userIdFromCookies));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (following) {
            setIsFollowed(following.some((user) => user.following._id === userId));
        }
    }, [following, userId]);

    // Handling logout
    const handleLogout = async () => {
        try {
            await dispatch(logoutAsync());

            // Redirecting to login page after logout
            if (!Cookies.get("isSignIn")) {
                navigate("/login");
            }

        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    // Function to handle follow/unfollow
    const handleFollowToggle = () => {
        if (isFollowed) {
            dispatch(unfollowUserAsync(userId));
        } else {
            dispatch(toggleFollowAsync(userId));
        }
        setIsFollowed(!isFollowed);
    }

    // Zoom Image on click profile
    const handleProfilePicClick = () => {
        setIsProfilePicZoomed(!isProfilePicZoomed);
    }

    if (userLoading) {
        return <div className="flex justify-center items-center h-screen">
            <ColorRing
                visible={true}
                height={80}
                width={80}
                ariaLabel="color-ring-loading"
                color={'#e15b64'}
            />
        </div>
    }

    const { user } = userData;
    const defaultProfilePic = "https://placekitten.com/200/200";

    if (!user) {
        return <div>User not found.</div>;
    }

    return (
        <div className={`bg-gray-100 min-h-screen ${styles.userPage}`}>
            <div className={`max-w-6xl mx-auto px-4 py-8 ${styles.content}`}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start ${styles.userDetails}`}>
                    <div className="col-span-1 sm:col-span-1">
                        <img className="rounded-full sm:w-32 sm:h-32 w-36 h-36 object-cover" onClick={handleProfilePicClick} src={user.profilePic || defaultProfilePic} alt={user.username} />
                    </div>
                    <div className="col-span-1 sm:col-span-1 md:col-span-3 space-y-1">
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <p className="text-gray-600">{user.bio}</p>
                        <a href={user.website} className='text-blue-600' target='_blank' rel='noopener noreferrer'>Website: {user.website}</a>
                        <div className="flex space-x-4">
                            <span className="font-semibold">{user.posts.length} posts</span>
                            <Link to={`/followers/${user._id}`}>
                                <span className="font-semibold">{user.followers.length} followers</span>
                            </Link>
                            <Link to={`/following/${user._id}`}>
                                <span className="font-semibold">{user.following.length} following</span>
                            </Link>
                        </div>

                        {/* Conditionally render follow/unfollow button */}
                        {signedUser !== userId && (
                            <button
                                onClick={handleFollowToggle}
                                className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4`}
                            >
                                {isFollowed ? "Unfollow" : "Follow"}
                            </button>
                        )}

                        {/* Conditionally render Edit Profile and Logout buttons */}
                        {signedUser === user._id ? (
                            <div className="flex justify-end mt-4 space-x-4">
                                <Link to={"/edit-profile"}>
                                    <button className=" bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                                        Edit Profile
                                    </button>
                                </Link>
                                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                    Logout
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
                {/* Ruler above posts */}
                <hr className={`my-8 ${styles.ruler}`} />
                {/* Posts title with icons */}
                <div className={`flex items-center space-x-4 justify-center ${styles.postsTitle}`}>
                    <FaHeart className="text-red-500" />
                    <span className="text-lg font-semibold">Posts</span>
                    <FaComment className="text-blue-500" />
                </div>
                <div className={`mt-10 grid grid-cols-1 gap-4 ${styles.postContainer}`}>
                    {userPostsLoading ? "Loading..." : <UserPostList posts={userPosts} />}
                </div>
            </div>

            {/* Modal for profile pic zoom fetaure */}
            {isProfilePicZoomed && (
                <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50' onClick={handleProfilePicClick}>
                <img className='max-w-full max-h-full rounded-xl' src={user.profilePic || defaultProfilePic} alt={user.username}/>
                </div>
            )}
        </div>
    );
}

export default UserPage;
