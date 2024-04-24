import React from 'react'
import { FaHeart } from 'react-icons/fa'

const CommentList = ({ comments, commentsLoading, }) => {
    return (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {commentsLoading ? (
                <p>Loading comments...</p>
            ) : (
                comments && comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <div key={index} className="mb-2">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center">
                                    <img className="w-6 h-6 rounded-full mr-2" src={comment.user.profilePic} alt="User" />
                                    <p className="text-gray-600 font-medium">{comment.user.username}:</p>
                                </div>
                                <button
                                    className="text-gray-700"
                                // onClick={() => handleLikeComment(index)}
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
    )
}

export default CommentList