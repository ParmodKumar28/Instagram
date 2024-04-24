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
import { deletePostAsync } from '../../Redux/Reducer/postsReducer';

// Base URL for API requests
const BASE_URL = 'http://localhost:8000/api';

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
    const [likes, setLikes] = useState([]);
    const [showOptions, setShowOptions] = useState(false); // Add state for controlling options list visibility

    // Dispatcher
    const dispatch = useDispatch();

    // Add comment handler
    const handleAddComment = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/comment/add/${post._id}`, { comment: commentText });
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
            const response = await axios.get(`${BASE_URL}/like/toggle/${post._id}?type=Post`);
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
            const response = await axios.get(`${BASE_URL}/like/${post._id}?type=Post`);
            if (response.statusText === "OK") {
                setLikeList(response.data.likes);
                // const updatedLikes = isLiked ? likeList.filter(like => like.postId !== post._id) : [...likeList, { postId: post._id }];
                // setLikeList(updatedLikes);
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    }

    // Handle click on like count
    const handleLikeCountClickOnPost = async () => {
        try {
            if (!showLikeList) {
                const response = await axios.get(`${BASE_URL}/like/${post._id}?type=Post`);
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
            const response = await axios.get(`${BASE_URL}/comment/${post._id}`);
            setComments(response.data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleDeletePost = async () => {
        try {
            dispatch(deletePostAsync(post._id));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }

    const handleEditPost = async () => {
        try {
            // You can dispatch an action here to update the post
        } catch (error) {
            console.error('Error editing post:', error);
        }
    }

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

    return (
        <div className="relative my-2 max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
            {/* User Info */}
            <div className="flex items-center justify-between p-4">

                {/* user name and image container */}
                <div className="flex items-center">
                    {/* Profile pic */}
                    <img className="w-10 h-10 rounded-full mr-4" src={post.user.profilePic} alt="User" />
                    {/* Username */}
                    <p className="text-sm font-semibold">{post.user.username}</p>
                </div>

                {/* Options button */}
                <button className="text-gray-700" onClick={() => setShowOptions(!showOptions)}>
                    <FaEllipsisH className="w-6 h-6" />
                </button>

                {/* Conditionally render OptionsList */}
                {/* && post.user._id === Cookies.get("signedUser")._id && */}
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

                {/* Post caption */}
                <p className="text-gray-800 text-lg font-semibold mb-2">{post.caption}</p>

                {/* Post location */}
                {post.location && (
                    <p className="text-gray-600 mb-2">Location: {post.location}</p>
                )}

                {/* When showComment's is true it will render Comment's list component */}
                {showComments && (
                    <CommentList comments={comments} commentLoading={commentsLoading} />
                )}

                {/* When comment's list is on then show add comment input */}
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
            </div>

            {/* When we click on like count's then it render LikeList component */}
            {showLikeList && likeList.length > 0 && (
                <LikeList likeList={likeList} />
            )}
        </div>
    );
}

export default Post;
