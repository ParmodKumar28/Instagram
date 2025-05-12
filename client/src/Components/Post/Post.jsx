import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import './Post.module.css';
import { toast } from 'react-hot-toast';
import { FaHeart, FaRegComment, FaRegBookmark, FaEllipsisH, FaRegPaperPlane } from 'react-icons/fa';
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { deletePostAsync, updatePostAsync } from '../../Redux/Reducer/postsReducer';
import { Link } from 'react-router-dom';
import BASE_URL from '../../Redux/baseUrl';

// Lazy-loaded components
const CommentList = lazy(() => import('./Comments List/CommentList'));
const LikeList = lazy(() => import('./Like List/LikeList'));
const OptionsList = lazy(() => import('./Options List/OptionsList'));

function Post({ post }) {
    // State's
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [likeList, setLikeList] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [showLikeList, setShowLikeList] = useState(false);
    // Removed isDoubleTapped state.
    const [lastTap, setLastTap] = useState(0); // For double-tap detection
    const [showHeart, setShowHeart] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [likes, setLikes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCaption, setEditedCaption] = useState(post.caption || '');

    // Dispatcher
    const dispatch = useDispatch();

    // Get current user id from cookies (adjust if needed)
    const currentUserId = Cookies.get("userId") || "";

    // Event handler for adding comment
    const handleAddComment = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/comment/add/${post._id}`,
                { comment: commentText },
                {
                    headers: { 'auth-token': `${localStorage.getItem('auth-token')}` },
                }
            );
            if (response.status === 201) {
                getComments();
                toast.success(response.data.msg);
                setCommentText('');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error adding comment');
        }
    };

    // Toggle like state and show heart animation
    const handleToggleLike = async () => {
        // Optimistically update liked state.
        setIsLiked(prev => !prev);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);

        try {
            await axios.get(`${BASE_URL}/like/toggle/${post._id}?type=Post`, {
                headers: { 'auth-token': `${localStorage.getItem('auth-token')}` },
            });
            fetchLikes();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Fetch likes for the post
    const fetchLikes = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/like/${post._id}?type=Post`, {
                headers: { 'auth-token': `${localStorage.getItem('auth-token')}` },
            });
            setLikeList(response.data.likes);
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    };

    // Toggle the like list modal
    const handleLikeCountClickOnPost = async (e) => {
        e.stopPropagation();
        if (!showLikeList) fetchLikes();
        setShowLikeList(!showLikeList);
    };

    // Fetch comments for the post
    const getComments = async () => {
        setCommentsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/comment/${post._id}`, {
                headers: { 'auth-token': `${localStorage.getItem('auth-token')}` },
            });
            setComments(response.data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleDeletePost = () => dispatch(deletePostAsync(post._id));

    const handleEditPost = () => {
        setIsEditing(true);
        setShowOptions(false);
    };

    const handleUpdatePost = () => {
        dispatch(updatePostAsync({ postId: post._id, postData: { ...post, caption: editedCaption } }));
        setIsEditing(false);
    };

    // On component mount, fetch likes and comments
    useEffect(() => {
        fetchLikes();
        getComments();
        // Removed the setting of isLiked here.
    }, []);

    // Update isLiked whenever likeList changes.
    useEffect(() => {
        // Check if the current user is among the likers.
        setIsLiked(likeList.some(like => like.user && like.user._id === currentUserId));
    }, [likeList, currentUserId]);

    // Handler for detecting double taps on mobile devices.
    const handleImageTap = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300; // milliseconds
        if (now - lastTap < DOUBLE_TAP_DELAY) {
            handleToggleLike();
        }
        setLastTap(now);
    };

    return (
        <div className="relative my-2 w-11/12 md:max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
            {/* User Info */}
            <div className="flex items-center justify-between p-4">
                <Link to={`/profile/${post.user._id}`}>
                    <div className="flex items-center">
                        <img className="w-10 h-10 rounded-full mr-4" src={post.user.profilePic} alt="User" />
                        <p className="text-sm font-semibold text-slate-600">{post.user.username}</p>
                    </div>
                </Link>
                <button className="text-gray-700" onClick={() => setShowOptions(!showOptions)}>
                    <FaEllipsisH className="w-6 h-6" />
                </button>
                {showOptions && (
                    <Suspense fallback={<p>Loading...</p>}>
                        <OptionsList onDelete={handleDeletePost} onEdit={handleEditPost} />
                    </Suspense>
                )}
            </div>

            {/* Post Image */}
            {post.media && (
                <div className="relative select-none">
                    <img
                        className="w-full"
                        src={post.media}
                        alt="Post"
                        onDoubleClick={handleToggleLike}
                        onTouchEnd={handleImageTap}
                    />
                    {showHeart && (
                        <FaHeart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 w-20 h-20 animate-heart" />
                    )}
                </div>
            )}

            {/* Post Actions */}
            <div className="flex justify-between p-4">
                <div className="flex items-center gap-2">
                    <button onClick={handleToggleLike} className={`text-gray-700 ${isLiked ? 'text-red-500' : ''}`}>
                        <FaHeart className="w-6 h-6" />
                        <span className="ml-1" onClick={(e) => handleLikeCountClickOnPost(e)}>
                            {likeList.length}
                        </span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="text-gray-700">
                        <FaRegComment className="w-6 h-6" />
                        <span className="ml-1">{comments.length}</span>
                    </button>
                </div>
                <button className="text-gray-700">
                    <FaRegBookmark className="w-6 h-6" />
                </button>
            </div>

            {/* Post Caption and Comments */}
            <div className="px-4 pb-2">
                {isEditing ? (
                    <textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                ) : (
                    <p className="text-gray-800">{post.caption}</p>
                )}
                {showComments && (
                    <Suspense fallback={<p>Loading comments...</p>}>
                        <CommentList comments={comments} commentLoading={commentsLoading} />
                    </Suspense>
                )}
                {showComments && (
                    <div className="flex mt-2">
                        <input
                            type="text"
                            className="flex-grow border border-gray-300 rounded-md p-2"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <button onClick={handleAddComment} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md">
                            Post
                        </button>
                    </div>
                )}
                {isEditing && (
                    <div className="flex justify-end">
                        <button onClick={handleUpdatePost} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                            Update
                        </button>
                        <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md">
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {showLikeList && likeList.length > 0 && (
                <Suspense fallback={<p>Loading likes...</p>}>
                    <LikeList likeList={likeList} onClose={() => setShowLikeList(false)} />
                </Suspense>
            )}
        </div>
    );
}

export default Post;