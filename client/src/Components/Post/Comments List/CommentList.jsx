import { useState } from 'react';

const CommentList = ({ comments = [], commentsLoading = false }) => {
  // For handling comment actions
  const [activeComment, setActiveComment] = useState(null);

  console.log(comments, commentsLoading);

  if (commentsLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="w-5 h-5 border-2 border-t-gray-300 border-gray-200 rounded-full animate-spin mr-2"></div>
        <p className="text-gray-500 text-sm font-medium">Loading comments</p>
      </div>
    );
  }

  return (
    <div className="max-h-[320px] overflow-y-auto pr-1">
      {comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition-shadow duration-200"
              onMouseEnter={() => setActiveComment(index)}
              onMouseLeave={() => setActiveComment(null)}
            >
              <div className="flex items-start p-3">
                <img
                  src={comment.user.profilePic}
                  alt={`${comment.user.name}`}
                  className="w-8 h-8 rounded-full object-cover border border-gray-100"
                />
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{comment.user.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {comment.timestamp || '2h ago'}
                      </span>
                    </div>
                    
                    <button
                      className={`flex items-center text-xs font-medium ${
                        comment.liked ? 'text-red-500' : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill={comment.liked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {comment.likes}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {comment.content}
                  </p>
                  
                  {activeComment === index && (
                    <div className="flex items-center mt-2 text-xs">
                      <button className="text-gray-500 hover:text-gray-700 font-medium mr-4">
                        Reply
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 font-medium">
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-gray-200 rounded-md bg-gray-50">
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
            />
          </svg>
          <p className="font-medium text-gray-600">No comments yet</p>
          <p className="text-xs text-gray-500 mt-1">Start the conversation</p>
        </div>
      )}
    </div>
  );
};

export default CommentList;