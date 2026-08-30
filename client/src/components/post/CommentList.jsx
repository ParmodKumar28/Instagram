import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { usersSelector } from "../../redux/slices/usersSlice";
import { commentService } from "../../services";
import Avatar from "../common/Avatar";
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

function SingleCommentItem({
  comment,
  currentUserId,
  onReply,
  onCommentDeleted,
  isReply = false,
}) {
  const user = comment.user || {};
  const username = user.username || user.name || "user";
  const isAuthor =
    currentUserId &&
    (user._id === currentUserId ||
      user === currentUserId ||
      comment.user === currentUserId);

  const initialLikes = Array.isArray(comment.likes) ? comment.likes : [];
  const [likesCount, setLikesCount] = useState(initialLikes.length);
  const [isLiked, setIsLiked] = useState(
    initialLikes.some(
      (like) =>
        (like?.user && (like.user === currentUserId || like.user._id === currentUserId)) ||
        like === currentUserId ||
        like?._id === currentUserId
    )
  );
  const [showReplies, setShowReplies] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const handleToggleLike = async () => {
    if (isLikeLoading) return;
    setIsLikeLoading(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await commentService.toggleLikeComment(comment._id);
    } catch (error) {
      console.error("Failed to like comment:", error);
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error("Failed to update like");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await commentService.deleteComment(comment._id);
      toast.success("Comment deleted");
      if (onCommentDeleted) onCommentDeleted(comment._id, comment.parentComment);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const replies = Array.isArray(comment.replies) ? comment.replies : [];

  return (
    <div className={`group text-xs ${isReply ? "py-1.5" : "py-2"}`}>
      <div className="flex items-start justify-between space-x-2.5">
        <Link
          to={`/profile/${user._id || ""}`}
          className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
        >
          <Avatar
            src={user.profilePic}
            alt={username}
            gender={user.gender}
            username={username}
            className="w-full h-full object-cover"
          />
        </Link>

        <div className="flex-1 leading-snug">
          <p className="text-gray-900">
            <Link
              to={`/profile/${user._id || ""}`}
              className="font-semibold mr-1.5 text-gray-900 hover:underline inline-block"
            >
              {username}
            </Link>
            <span className="text-gray-800 break-words">
              {comment.content || comment.comment}
            </span>
          </p>

          <div className="flex items-center space-x-3 text-[11px] text-gray-500 mt-1 font-medium">
            <span>{formatTimeAgo(comment.createdAt || comment.timestamp)}</span>

            {likesCount > 0 && (
              <span className="font-semibold text-gray-600">
                {likesCount} {likesCount === 1 ? "like" : "likes"}
              </span>
            )}

            <button
              type="button"
              onClick={() => onReply && onReply({ commentId: comment.parentComment || comment._id, username })}
              className="font-semibold text-gray-500 hover:text-gray-900 transition"
            >
              Reply
            </button>

            {isAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Comment Like Heart Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition flex-shrink-0 mt-0.5"
          aria-label="Like comment"
        >
          {isLiked ? (
            <IoHeartSharp className="text-red-500 text-sm animate-in zoom-in-50 duration-150" />
          ) : (
            <IoHeartOutline className="text-sm hover:text-gray-600" />
          )}
        </button>
      </div>

      {/* Nested Replies Section */}
      {!isReply && replies.length > 0 && (
        <div className="pl-9 mt-1">
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center space-x-2 text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition py-0.5"
          >
            <span className="w-5 h-[1px] bg-gray-300 inline-block" />
            <span>
              {showReplies
                ? "Hide replies"
                : `View replies (${replies.length})`}
            </span>
          </button>

          {showReplies && (
            <div className="space-y-1 mt-1 border-l border-gray-100 pl-2.5">
              {replies.map((reply, replyIndex) => (
                <SingleCommentItem
                  key={reply._id || replyIndex}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onCommentDeleted={onCommentDeleted}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CommentList({
  comments = [],
  commentsLoading = false,
  onReply,
  onCommentDeleted,
}) {
  const { userId: currentUserId } = useSelector(usersSelector);

  if (commentsLoading && (!comments || comments.length === 0)) {
    return (
      <div className="flex justify-center items-center py-4">
        <p className="text-gray-400 text-xs">Loading comments...</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-gray-400">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto pr-1 divide-y divide-gray-50">
      {comments.map((comment, index) => (
        <SingleCommentItem
          key={comment._id || index}
          comment={comment}
          currentUserId={currentUserId}
          onReply={onReply}
          onCommentDeleted={onCommentDeleted}
          isReply={false}
        />
      ))}
    </div>
  );
}

export default CommentList;

