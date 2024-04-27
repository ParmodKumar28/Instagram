// UserPostList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment } from 'react-icons/fa'; // Import icons
import styles from "./UserPostList.module.css"; // Import module CSS

const UserPostList = ({ posts }) => {
    return (
        <div className={`grid grid-cols-4 gap-4 ${styles.postContainer}`}>
            {posts.map((post) => (
                <div key={post._id} className={`relative ${styles.postItem}`}>
                    <Link to={`/post/${post._id}`} className={styles.postLink}> 
                        <img className="w-full h-full object-cover" src={post.media} alt={post.caption} />
                    </Link>

                    {/* Post overlay */}
                    <div className={`absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-50 text-white p-2 ${styles.overlay}`}>
                        <p className="text-sm">{post.caption}</p>
                        {/* Icons for likes and comments */}
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center">
                                <FaHeart className="mr-1" />
                                <span>{post.likes.length}</span>
                            </div>
                            <div className="flex items-center">
                                <FaComment className="mr-1" />
                                <span>{post.comments.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserPostList;
