import { useState, useEffect } from 'react';
import { FaHeart, FaRegComment, FaRegBookmark, FaEllipsisH, FaRegPaperPlane } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addCommentAsync, commentsSelector, getCommentsAsync } from '../../Redux/Reducer/commentsReducer';
import './Post.module.css'

function Post({ post }) {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const dispatch = useDispatch();


    // Retrieve comments state using useSelector
    const { comments, commentsLoading } = useSelector(commentsSelector);

    const handleAddComment = () => {
        dispatch(addCommentAsync({ postId: post._id, comment: commentText }))
        setCommentText("");
    };


    useEffect(() => {
        if (showComments && post._id) { // Load comments only once when showComments is true
            dispatch(getCommentsAsync(post._id));
        }
    }, [showComments, post._id, dispatch]);

    const handleLikeComment = (index) => {
        const updatedComments = [...comments];
        updatedComments[index].likes += 1;
        // Update the comments state with the modified comment
        // setComments(updatedComments);
    };

    return (
        <div className="my-2 max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
            {/* User Info */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    <img className="w-10 h-10 rounded-full mr-4" src={post.user.profilePic} alt="User" />
                    <p className="text-sm font-semibold">{post.user.username}</p>
                </div>
                <button className="text-gray-700">
                    <FaEllipsisH className="w-6 h-6" />
                </button>
            </div>

            {/* Post image */}
            {post.media && (
                <img className="w-full" src={post.media} alt="Post" />
            )}

            {/* Post actions */}
            <div className="flex justify-between p-4">
                {/* Like, Comment, Share */}
                <div className="flex items-center">
                    <button className="text-gray-700">
                        <FaHeart className="w-6 h-6" />
                    </button>
                    <button className="text-gray-700 ml-4" onClick={() => setShowComments(!showComments)}>
                        <FaRegComment className="w-6 h-6" />
                    </button>
                    <button className="text-gray-700 ml-4">
                        <FaRegPaperPlane className="w-6 h-6" />
                    </button>
                </div>
                {/* Bookmark icon */}
                <button className="text-gray-700">
                    <FaRegBookmark className="w-6 h-6" />
                </button>
            </div>

            {/* Post content */}
            <div className="px-4 pb-2">
                {/* Post caption */}
                <p className="text-gray-800 text-lg font-semibold mb-2">{post.caption}</p>
                {/* Location */}
                {post.location && (
                    <p className="text-gray-600 mb-2">Location: {post.location}</p>
                )}

                {/* Post comments */}
                {showComments && (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}> {/* Adjust maxHeight as needed */}
                        {/* Check if comments is defined before mapping */}
                        {commentsLoading ? (
                            // Show loader while comments are loading
                            <p>Loading comments...</p>
                        ) : (
                            comments && comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <div key={index} className="mb-2">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center">
                                                <img className="w-6 h-6 rounded-full mr-2" src={comment.user.profilePic} alt="User" />
                                                <p className="text-gray-600 font-medium">{comment.user.name}:</p>
                                            </div>
                                            <button
                                                className="text-gray-700"
                                                onClick={() => handleLikeComment(index)}
                                            >
                                                <FaHeart className="w-4 h-4" />
                                                <span className="ml-1">{comment.likes}</span>
                                            </button>
                                        </div>
                                        <p className="text-gray-700">{comment.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-700">No comments yet.</p>
                            )
                        )}
                    </div>
                )}




                {/* Add comment */}
                {showComments && (
                    <div className="flex items-center mt-2">
                        <input
                            type="text"
                            name='comment'
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
        </div>
    );
}

export default Post;
