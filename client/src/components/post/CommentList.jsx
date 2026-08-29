import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { usersSelector } from "../../redux/slices/usersSlice";
import { commentService } from "../../services";
import toast from "react-hot-toast";

function formatTimeAgo(dateString) {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function CommentList({
  comments = [],
  commentsLoading = false,
  onCommentDeleted,
}) {
  const { userId: currentUserId } = useSelector(usersSelector);

  if (commentsLoading) {
    return (
      <div className="flex justify-center items-center py-3">
        <p className="text-gray-400 text-xs">Loading comments...</p>
      </div>
    );
  }

  const handleDelete = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      toast.success("Comment deleted");
      if (onCommentDeleted) onCommentDeleted();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="py-2 text-center text-xs text-gray-400">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
      {comments.map((comment, index) => {
        const user = comment.user || {};
        const username = user.username || user.name || "user";
        const isAuthor = currentUserId && (user._id === currentUserId || user === currentUserId);

        return (
          <div key={comment._id || index} className="flex items-start space-x-2.5 text-xs group">
            <Link
              to={`/profile/${user._id || ""}`}
              className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
            >
              <img
                src={user.profilePic || "https://placekitten.com/100/100"}
                alt={username}
                className="w-full h-full object-cover"
              />
            </Link>

            <div className="flex-1 leading-snug">
              <p>
                <Link
                  to={`/profile/${user._id || ""}`}
                  className="font-semibold mr-1.5 text-gray-900 hover:underline"
                >
                  {username}
                </Link>
                <span className="text-gray-800">{comment.content || comment.comment}</span>
              </p>
              <div className="flex items-center space-x-2.5 text-[11px] text-gray-400 mt-0.5">
                <span>{formatTimeAgo(comment.createdAt || comment.timestamp)}</span>
                {isAuthor && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CommentList;
