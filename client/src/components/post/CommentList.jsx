import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { usersSelector } from "../../redux/slices/usersSlice";
import { commentService } from "../../services";
import { formatTimeAgo } from "../../utils";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

function SingleCommentItem({
  comment,
  currentUserId,
  onReply,
  onCommentDeleted,
  isReply = false,
  isDark = false,
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
            className={`w-full h-full object-cover ${isDark ? "border border-white/20" : ""}`}
          />
        </Link>

        <div className="flex-1 leading-snug">
          <p className={isDark ? "text-white" : "text-gray-900"}>
            <Link
              to={`/profile/${user._id || ""}`}
              className={`font-semibold mr-1.5 inline-block ${
                isDark ? "text-white hover:text-white/80" : "text-gray-900 hover:underline"
              }`}
            >
              {username}
            </Link>
            <span className={`break-words ${isDark ? "text-white/90 font-normal" : "text-gray-800"}`}>
              {comment.content || comment.comment}
            </span>
          </p>

          <div
            className={`flex items-center space-x-3 text-[11px] mt-1 font-medium ${
              isDark ? "text-white/60" : "text-gray-500"
            }`}
          >
            <span>{formatTimeAgo(comment.createdAt || comment.timestamp)}</span>

            {likesCount > 0 && (
              <span className={`font-semibold ${isDark ? "text-white/80" : "text-gray-600"}`}>
                {likesCount} {likesCount === 1 ? "like" : "likes"}
              </span>
            )}

            <button
              type="button"
              onClick={() => onReply && onReply({ commentId: comment.parentComment || comment._id, username })}
              className={`font-semibold transition cursor-pointer ${
                isDark ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Reply
            </button>

            {isAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100 cursor-pointer"
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
          className={`p-1 focus:outline-none transition flex-shrink-0 mt-0.5 cursor-pointer ${
            isDark ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label="Like comment"
        >
          {isLiked ? (
            <IoHeartSharp className="text-[#FF3040] text-sm animate-in zoom-in-50 duration-150" />
          ) : (
            <IoHeartOutline className="text-sm" />
          )}
        </button>
      </div>

      {/* Nested Replies Section */}
      {!isReply && replies.length > 0 && (
        <div className="pl-9 mt-1">
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className={`flex items-center space-x-2 text-[11px] font-semibold transition py-0.5 cursor-pointer ${
              isDark ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className={`w-5 h-[1px] inline-block ${isDark ? "bg-white/30" : "bg-gray-300"}`} />
            <span>
              {showReplies
                ? "Hide replies"
                : `View replies (${replies.length})`}
            </span>
          </button>

          {showReplies && (
            <div className={`space-y-1 mt-1 pl-2.5 border-l ${isDark ? "border-white/15" : "border-gray-100"}`}>
              {replies.map((reply, replyIndex) => (
                <SingleCommentItem
                  key={reply._id || replyIndex}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onCommentDeleted={onCommentDeleted}
                  isReply={true}
                  isDark={isDark}
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
  isDark = false,
}) {
  const { userId: currentUserId } = useSelector(usersSelector);

  if (commentsLoading && (!comments || comments.length === 0)) {
    return (
      <div className="flex justify-center items-center py-4">
        <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-400"}`}>Loading comments...</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className={`py-6 text-center text-xs ${isDark ? "text-white/60" : "text-gray-400"}`}>
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className={`space-y-1 overflow-y-auto pr-1 divide-y ${isDark ? "divide-white/10" : "divide-gray-50"}`}>
      {comments.map((comment, index) => (
        <SingleCommentItem
          key={comment._id || index}
          comment={comment}
          currentUserId={currentUserId}
          onReply={onReply}
          onCommentDeleted={onCommentDeleted}
          isReply={false}
          isDark={isDark}
        />
      ))}
    </div>
  );
}

export default CommentList;

