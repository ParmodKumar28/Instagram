import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import { RiRepeatLine } from "react-icons/ri";
import { FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deletePostAsync, updatePostAsync } from "../../redux/slices/postsSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import { commentService, likeService } from "../../services";
import CommentList from "./CommentList";
import LikeList from "./LikeList";
import OptionsList from "./OptionsList";

function formatTimeAgo(dateString) {
  if (!dateString) return "";
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
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export function PostCard({ post }) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [showLikeList, setShowLikeList] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post?.caption || "");
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const dispatch = useDispatch();
  const { userId: currentUserId } = useSelector(usersSelector);

  const fetchLikes = useCallback(async () => {
    if (!post?._id) return;
    try {
      const response = await likeService.getLikes(post._id, "Post");
      setLikeList(response.data?.likes || []);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [post?._id]);

  const getComments = useCallback(async () => {
    if (!post?._id) return;
    setCommentsLoading(true);
    try {
      const response = await commentService.getComments(post._id);
      setComments(response.data?.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, [post?._id]);

  useEffect(() => {
    if (post?._id) {
      fetchLikes();
      getComments();
    }
  }, [post?._id, fetchLikes, getComments]);

  useEffect(() => {
    if (likeList && currentUserId) {
      setIsLiked(likeList.some((like) => like.user?._id === currentUserId));
    }
  }, [likeList, currentUserId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await commentService.addComment(post._id, commentText);
      if (response.status === 201) {
        getComments();
        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleToggleLike = async () => {
    try {
      const response = await likeService.toggleLike(post._id, "Post");
      if (response.status === 200) {
        setIsLiked(!isLiked);
        fetchLikes();
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        handleToggleLike();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    setLastTap(now);
  };

  const handleDeletePost = async () => {
    try {
      await dispatch(deletePostAsync(post._id)).unwrap();
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(error.customMessage || "Failed to delete post");
    }
  };

  const handleEditPost = () => {
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleUpdatePost = async () => {
    await dispatch(
      updatePostAsync({
        postId: post._id,
        postData: { ...post, caption: editedCaption },
      })
    );
    setIsEditing(false);
  };

  const isAuthor = currentUserId && post?.user?._id === currentUserId;
  const username = post?.user?.username || post?.user?.name || "user";
  const timeAgo = formatTimeAgo(post?.createdAt);

  return (
    <article className="w-full max-w-[480px] mx-auto bg-white border border-gray-200 rounded-2xl mb-8 select-none shadow-sm overflow-hidden">
      {/* Header with comfortable side padding */}
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-4 sm:py-4 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <Link
            to={`/profile/${post?.user?._id || ""}`}
            className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden"
          >
            <img
              className="w-full h-full rounded-full object-cover"
              src={post?.user?.profilePic || "https://placekitten.com/100/100"}
              alt={username}
            />
          </Link>

          <div className="flex items-center space-x-1.5 leading-tight">
            <Link
              to={`/profile/${post?.user?._id || ""}`}
              className="text-[13px] font-semibold text-gray-900 hover:opacity-75 transition"
            >
              {username}
            </Link>
            {timeAgo && (
              <span className="text-gray-400 text-xs">· {timeAgo}</span>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-700 hover:text-black p-2 rounded-full hover:bg-gray-50 transition"
            aria-label="Post options"
          >
            <FaEllipsisH className="w-4 h-4" />
          </button>
          {showOptions && isAuthor && (
            <OptionsList onDelete={handleDeletePost} onEdit={handleEditPost} />
          )}
        </div>
      </div>

      {/* Media Image */}
      {post?.media && (
        <div className="relative select-none bg-black flex items-center justify-center min-h-[340px] max-h-[620px] overflow-hidden">
          <img
            className="w-full object-cover max-h-[620px]"
            src={post.media}
            alt="Post media"
            onDoubleClick={handleToggleLike}
            onTouchEnd={handleImageTap}
          />

          {/* Double tap heart animation */}
          {showHeart && (
            <FaHeart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF3040] w-28 h-28 animate-heart-beat drop-shadow-2xl pointer-events-none" />
          )}
        </div>
      )}

      {/* Actions Bar with left/right padding */}
      <div className="flex justify-between items-center px-4 pt-3.5 pb-1">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleLike}
            className="flex items-center space-x-1.5 focus:outline-none transition active:scale-125"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            {isLiked ? (
              <FaHeart className="w-[26px] h-[26px] text-[#FF3040] transition-colors" />
            ) : (
              <FaRegHeart className="w-[26px] h-[26px] text-gray-900 hover:text-gray-500 transition-colors" />
            )}
            {likeList.length > 0 && (
              <span className="text-[13px] font-semibold text-gray-900">
                {likeList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-gray-900 hover:text-gray-500 focus:outline-none transition"
            aria-label="Comments"
          >
            <FaRegComment className="w-[25px] h-[25px]" />
          </button>

          <button
            className="flex items-center text-gray-900 hover:text-gray-500 focus:outline-none transition"
            aria-label="Repost"
          >
            <RiRepeatLine className="w-[26px] h-[26px]" />
          </button>

          <button
            className="flex items-center text-gray-900 hover:text-gray-500 focus:outline-none transition"
            aria-label="Share"
          >
            <FiSend className="w-[23px] h-[23px]" />
          </button>
        </div>

        <button
          className="text-gray-900 hover:text-gray-500 focus:outline-none transition"
          aria-label="Bookmark"
        >
          <FaRegBookmark className="w-[23px] h-[23px]" />
        </button>
      </div>

      {/* Caption & Comments Section with proper left and right margins */}
      <div className="px-4 pt-1.5 pb-3.5 space-y-2 text-sm text-gray-900">
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-gray-400 focus:outline-none"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePost}
                className="bg-blue-500 text-white text-xs px-3.5 py-1.5 rounded hover:bg-blue-600 font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        ) : (
          post?.caption && (
            <div>
              <p className="leading-snug text-sm">
                <span className="font-semibold mr-1.5">{username}</span>
                <span>{post.caption}</span>
                {!isCaptionExpanded && post.caption.length > 90 && (
                  <button
                    onClick={() => setIsCaptionExpanded(true)}
                    className="text-gray-500 hover:text-gray-800 ml-1 font-normal"
                  >
                    ... more
                  </button>
                )}
              </p>
            </div>
          )
        )}

        {/* View Comments Expander */}
        {comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-xs text-gray-400 hover:text-gray-600 block pt-1"
          >
            View all {comments.length} comments
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="pt-2 border-t border-gray-100 mt-2">
            <CommentList comments={comments} commentsLoading={commentsLoading} />
          </div>
        )}

        {/* Add comment row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-1.5">
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none py-1"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim()}
            className="text-sky-500 hover:text-sky-700 disabled:opacity-30 text-sm font-semibold"
          >
            Post
          </button>
        </div>
      </div>

      {/* Likes Modal */}
      {showLikeList && (
        <LikeList likeList={likeList} onClose={() => setShowLikeList(false)} />
      )}
    </article>
  );
}

export default PostCard;
