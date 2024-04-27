// UserPage.js
import React, { useEffect } from 'react';
import { fetchUserPostsAsync, postsSelector } from '../../../Redux/Reducer/postsReducer';
import { userDataAsync, usersSelector } from '../../../Redux/Reducer/usersReducer';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserPostList from '../../../Components/User Post List/UserPostList';
import { FaHeart, FaComment } from 'react-icons/fa'; // Import icons
import styles from "./UserPage.module.css"; // Import module CSS

const UserPage = () => {
    const dispatch = useDispatch();
    const { userData, userLoading } = useSelector(usersSelector);
    const { userPosts, userPostsLoading } = useSelector(postsSelector);
    const { userId } = useParams();

    useEffect(() => {
        dispatch(userDataAsync({ userId }));
        dispatch(fetchUserPostsAsync(userId));
    }, [dispatch, userId]);

    if (userLoading) {
        return <div>Loading user...</div>;
    }

    const { user } = userData;

    if (!user) {
        return <div>User not found.</div>;
    }

    return (
        <div className={`bg-gray-100 min-h-screen ${styles.userPage}`}>
            <div className={`max-w-6xl mx-auto px-4 py-8 ${styles.content}`}>
                <div className={`grid grid-cols-4 gap-4 items-start ${styles.userDetails}`}>
                    <div className="col-span-1">
                        <img className="rounded-full w-32 h-32 object-cover" src={user.profilePic} alt={user.username} />
                    </div>
                    <div className="col-span-3 space-y-1">
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <p className="text-gray-600">{user.bio}</p>
                        <div className="flex space-x-4">
                            <span className="font-semibold">{user.posts.length} posts</span>
                            <span className="font-semibold">{user.followers.length} followers</span>
                            <span className="font-semibold">{user.following.length} following</span>
                        </div>
                        {/* Edit Profile and Logout buttons */}
                        <div className="flex justify-end mt-4 space-x-4">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                                Edit Profile
                            </button>
                            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                Logout
                            </button>
                        </div>
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
