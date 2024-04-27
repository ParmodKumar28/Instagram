// UserPage.js
import React, { useEffect, useState } from 'react';
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

const UserPage = () => {
    const dispatch = useDispatch();
    const { userData, userLoading } = useSelector(usersSelector);
    const { userPosts, userPostsLoading } = useSelector(postsSelector);
    const [signedUser, setSignedUser] = useState(null);
    const { userId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        setSignedUser(Cookies.get("userId"));
        dispatch(userDataAsync({ userId }));
        dispatch(fetchUserPostsAsync(userId));
    }, [dispatch, userId]);

    // Hanlding logout
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

    if (!user) {
        return <div>User not found.</div>;
    }

    return (
        <div className={`bg-gray-100 min-h-screen ${styles.userPage}`}>
            <div className={`max-w-6xl mx-auto px-4 py-8 ${styles.content}`}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start ${styles.userDetails}`}>
                    <div className="col-span-1 sm:col-span-1">
                        <img className="rounded-full sm:w-32 sm:h-32 w-36 h-36 object-cover" src={user.profilePic} alt={user.username} />
                    </div>
                    <div className="col-span-1 sm:col-span-1 md:col-span-3 space-y-1">
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <p className="text-gray-600">{user.bio}</p>
                        <a href={user.website} className='text-blue-600' target='_blank'>Website: {user.website}</a>
                        <div className="flex space-x-4">
                            <span className="font-semibold">{user.posts.length} posts</span>
                            <span className="font-semibold">{user.followers.length} followers</span>
                            <span className="font-semibold">{user.following.length} following</span>
                        </div>
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
                <div className={`mt-10 grid grid-cols-1  gap-4 ${styles.postContainer}`}>
                    {userPostsLoading ? "Loading..." : <UserPostList posts={userPosts} />}
                </div>
            </div>
        </div>
    );
}

export default UserPage;
