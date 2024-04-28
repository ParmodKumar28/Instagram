// Import statements
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Post.module.css';
import { toast } from 'react-toastify';
import { FaHeart, FaRegComment, FaRegBookmark, FaEllipsisH, FaRegPaperPlane } from 'react-icons/fa';
import CommentList from './Comments List/CommentList';
import LikeList from './Like List/LikeList';
import OptionsList from './Options List/OptionsList';
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { deletePostAsync, updatePostAsync } from '../../Redux/Reducer/postsReducer'; // Import updatePostAsync action
import { Link } from 'react-router-dom';
import BASE_URL from '../../Redux/baseUrl';

function Post({ post }) {
    // State variables
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [likeList, setLikeList] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [showLikeList, setShowLikeList] = useState(false);
    const [isDoubleTapped, setIsDoubleTapped] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [likes, setLikes] = useState([]);
    const [isEditing, setIsEditing] = useState(false); // State variable to manage editing state
    const [editedCaption, setEditedCaption] = useState(post.caption || ''); // Initialize editedCaption with post's caption

    // Dispatcher
    const dispatch = useDispatch();

    // Add comment handler
    const handleAddComment = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/comment/add/${post._id}`, { comment: commentText }, {
                headers: {
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                },
            });
            if (response.statusText === "OK") {
                getComments();
                toast.success("Comment added");
                setCommentText('');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else {
                console.error('Error adding comment:', error);
            }
        }
        setCommentText("");
    };


    // Toggle like handler
    const handleToggleLike = async () => {
        setIsLiked(!isLiked);
        setShowHeart(true);
        setTimeout(() => {
            setShowHeart(false);
        }, 1000);

        try {
            const response = await axios.get(`${BASE_URL}/like/toggle/${post._id}?type=Post`, {
                headers: {
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                },
            });
            if (response.statusText === "OK") {
                await fetchLikes();
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Fetch likes from API
    const fetchLikes = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/like/${post._id}?type=Post`, {
                headers: {
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                },
            });
            if (response.statusText === "OK") {
                setLikeList(response.data.likes);
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    }

    // Handle click on like count
    const handleLikeCountClickOnPost = async () => {
        try {
            if (!showLikeList) {
                const response = await axios.get(`${BASE_URL}/like/${post._id}?type=Post`, {
                    headers: {
                        'auth-token': `${localStorage.getItem('auth-token')}`,
                    },
                });
                const likes = response.data.likes;
                setLikeList(likes);
            }
            setShowLikeList(!showLikeList);
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    };

    // Fetch comments from API
    const getComments = async () => {
        setCommentsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/comment/${post._id}`, {
                headers: {
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                },
            });
            setComments(response.data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    // Handle delete post
    const handleDeletePost = async () => {
        try {
            dispatch(deletePostAsync(post._id));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    // Handle edit post
    const handleEditPost = () => {
        setIsEditing(true); // Set editing state to true when edit is clicked
        setShowOptions(false);
    };

    // Update post
    const handleUpdatePost = async () => {
        try {
            // Dispatch action to update the post
            dispatch(updatePostAsync({ postId: post._id, postData: { ...post, caption: editedCaption } }));
            setIsEditing(false); // Reset editing state after successful update
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    useEffect(() => {
        setIsLiked(likes.some(like => like.postId === post._id));
    }, [likes, post._id]);

    useEffect(() => {
        if (showComments && post._id) {
            getComments();
        }
    }, [showComments, post._id]);

    useEffect(() => {
        if (isDoubleTapped) {
            handleToggleLike();
            setIsDoubleTapped(false);
        }
    }, [isDoubleTapped]);

    useEffect(() => {
        fetchLikes();
        let liked = likeList.find((like) => like.likeable._id && like.user._id);
        setIsLiked(liked ? true : false);
        getComments();
    }, [])

    return (
        <div className="relative my-2 max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
            {/* User Info */}
            <div className="flex items-center justify-between p-4">
                {/* Rendering user info remains the same */}
                <Link to={`/profile/${post.user._id}`}>
                    <div className="flex items-center">
                        <img className="w-10 h-10 rounded-full mr-4" src={post.user.profilePic} alt="User" />
                        <p className="text-sm font-semibold">{post.user.username}</p>
                    </div>
                </Link>

                {/* Options button */}
                <button className="text-gray-700" onClick={() => setShowOptions(!showOptions)}>
                    <FaEllipsisH className="w-6 h-6" />
                </button>

                {/* Conditionally render OptionsList */}
                {showOptions && (
                    <OptionsList onDelete={handleDeletePost} onEdit={handleEditPost} />
                )}
            </div>

            {/* Post image */}
            {post.media && (
                <div className="relative select-none">
                    <img
                        className="w-full"
                        src={post.media}
                        alt="Post"
                        onTouchStart={() => setIsDoubleTapped(true)}
                        onDoubleClick={() => setIsDoubleTapped(true)}
                    />

                    {/* Shwoing heart on double tap */}
                    {showHeart && (
                        <FaHeart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 w-20 h-20 animate-heart transition-all" />
                    )}
                </div>
            )}

            {/* Post actions */}
            <div className="flex justify-between p-4">
                {/* Button's container */}
                <div className="flex items-center gap-2">
                    {/* Heart button */}
                    <button className="text-gray-700">
                        <FaHeart onClick={handleToggleLike}
                            className={`w-6 h-6 ${isLiked ? 'text-red-500' : ''} ${isDoubleTapped ? 'animate-like' : ''}`}
                        />
                        <span className="ml-1" onClick={handleLikeCountClickOnPost}>{likeList.length}</span>
                    </button>

                    {/* Comment button */}
                    <button className="text-gray-700 ml-4" onClick={() => setShowComments(!showComments)}>
                        <FaRegComment className="w-6 h-6" />
                        <span className="ml-1">{comments.length}</span>
                    </button>

                    {/* Share button */}
                    <button className="text-gray-700 ml-4">
                        <FaRegPaperPlane className="w-6 h-6" />
                        <span className="ml-1">{ }</span>
                    </button>
                </div>

                {/* Bookmark button */}
                <button className="text-gray-700">
                    <FaRegBookmark className="w-6 h-6" />
                </button>
            </div>

            {/* Post content */}
            <div className="px-4 pb-2">
                {/* Render post caption */}
                {isEditing ? (
                    <textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 mb-2"
                    />
                ) : (
                    <p className="text-gray-800 text-lg font-semibold mb-2">{post.caption}</p>
                )}

                {/* Render post location */}
                {post.location && (
                    <p className="text-gray-600 mb-2">Location: {post.location}</p>
                )}

                {/* Render comments */}
                {showComments && (
                    <CommentList comments={comments} commentLoading={commentsLoading} />
                )}

                {/* Render add comment input */}
                {showComments && (
                    <div className="flex items-center mt-2">
                        <input
                            type="text"
                            name="comment"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                            placeholder="Add a comment..."
                            required
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
                            onClick={handleAddComment}
                            disabled={commentsLoading}
                        >
                            {commentsLoading ? 'Adding..' : 'Post'}
                        </button>
                    </div>
                )}

                {/* Render edit and delete buttons */}
                {isEditing && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleUpdatePost}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
                        >
                            Update
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Render like list */}
            {showLikeList && likeList.length > 0 && (
                <LikeList likeList={likeList} />
            )}
        </div>
    );
}

export default Post;
