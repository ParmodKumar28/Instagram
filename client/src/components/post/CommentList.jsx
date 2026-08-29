export function CommentList({ comments = [], commentsLoading = false }) {
  if (commentsLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="w-5 h-5 border-2 border-t-gray-400 border-gray-200 rounded-full animate-spin mr-2"></div>
        <p className="text-gray-500 text-sm font-medium">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="max-h-[320px] overflow-y-auto pr-1">
      {comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <div
              key={comment._id || index}
              className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3"
            >
              <div className="flex items-start">
                <img
                  src={comment.user?.profilePic || "https://placekitten.com/100/100"}
                  alt={comment.user?.name || "User"}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />

                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.user?.name || comment.user?.username || "User"}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {comment.timestamp || "Just now"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-gray-200 rounded-lg bg-gray-50">
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
}

export default CommentList;
