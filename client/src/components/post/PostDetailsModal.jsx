import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import { RiRepeatLine } from "react-icons/ri";
import { FiSend } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { commentService, likeService, postService } from "../../services";
import { usersSelector } from "../../redux/slices/usersSlice";
import { deletePostAsync } from "../../redux/slices/postsSlice";
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

export function PostDetailsModal({ post: initialPost, onClose }) {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [likeList, setLikeList] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const dispatch = useDispatch();
  const { userId: currentUserId } = useSelector(usersSelector);

  // Fetch full fresh post data from backend
  const fetchFullPost = useCallback(async () => {
    if (!initialPost?._id) return;
    try {
      const response = await postService.getSinglePost(initialPost._id);
      if (response?.data?.post) {
        setPost(response.data.post);
      }
    } catch (error) {
      console.error("Error fetching full post details:", error);
    }
  }, [initialPost?._id]);

  const fetchLikes = useCallback(async () => {
    if (!initialPost?._id) return;
    try {
      const response = await likeService.getLikes(initialPost._id, "Post");
      setLikeList(response.data?.likes || []);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [initialPost?._id]);

  const fetchComments = useCallback(async () => {
    if (!initialPost?._id) return;
    setCommentsLoading(true);
    try {
      const response = await commentService.getComments(initialPost._id);
      setComments(response.data?.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, [initialPost?._id]);

  useEffect(() => {
    if (initialPost?._id) {
      fetchFullPost();
      fetchLikes();
      fetchComments();
    }
  }, [initialPost?._id, fetchFullPost, fetchLikes, fetchComments]);

  useEffect(() => {
    if (likeList && currentUserId) {
      setIsLiked(likeList.some((like) => (like.user?._id || like.user) === currentUserId));
    }
  }, [likeList, currentUserId]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  const handleDoubleTap = () => {
    if (!isLiked) handleToggleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await commentService.addComment(post._id, commentText);
      if (response.status === 201) {
        fetchComments();
        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await dispatch(deletePostAsync(post._id)).unwrap();
      toast.success("Post deleted successfully");
      onClose();
    } catch (error) {
      toast.error(error.customMessage || "Failed to delete post");
    }
  };

  const author = post?.user || {};
  const isAuthor = currentUserId && (author._id || author) === currentUserId;
  const username = author.username || author.name || "user";
  const timeAgo = formatTimeAgo(post?.createdAt);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-3 sm:p-6 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Right Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-50 focus:outline-none p-1"
        aria-label="Close modal"
      >
        <IoClose />
      </button>

      {/* Main Two-Column Modal Container */}
      <div
        className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row max-w-[1000px] w-full max-h-[90vh] md:h-[620px] shadow-2xl relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Media Image */}
        <div
          className="flex-1 bg-black flex items-center justify-center relative overflow-hidden md:h-full cursor-pointer select-none min-h-[300px]"
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={post?.media}
            alt={post?.caption || "Post media"}
            className="w-full h-full object-contain max-h-[620px]"
          />

          {/* Double tap Heart popup */}
          {showHeart && (
            <FaHeart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF3040] w-28 h-28 animate-heart-beat drop-shadow-2xl pointer-events-none" />
          )}
        </div>

        {/* Right Column: Author, Comments & Actions */}
        <div className="w-full md:w-[420px] flex flex-col justify-between bg-white border-l border-gray-100 h-full max-h-[620px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Link
                to={`/profile/${author._id || ""}`}
                onClick={onClose}
                className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
              >
                <img
                  src={author.profilePic || "https://placekitten.com/100/100"}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              </Link>
              <Link
                to={`/profile/${author._id || ""}`}
                onClick={onClose}
                className="text-sm font-semibold text-gray-900 hover:underline"
              >
                {username}
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-700 hover:text-black p-1.5 rounded-full hover:bg-gray-50 transition"
              >
                <FaEllipsisH className="w-3.5 h-3.5" />
              </button>
              {showOptions && isAuthor && (
                <OptionsList onDelete={handleDeletePost} onEdit={() => {}} />
              )}
            </div>
          </div>

          {/* Scrollable Caption & Comments Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-gray-900 scrollbar-none">
            {/* Caption Item */}
            {post?.caption && (
              <div className="flex items-start space-x-3">
                <Link
                  to={`/profile/${author._id || ""}`}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                >
                  <img
                    src={author.profilePic || "https://placekitten.com/100/100"}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="leading-snug">
                  <p>
                    <Link
                      to={`/profile/${author._id || ""}`}
                      onClick={onClose}
                      className="font-semibold mr-1.5 hover:underline"
                    >
                      {username}
                    </Link>
                    <span>{post.caption}</span>
                  </p>
                  {timeAgo && (
                    <span className="text-gray-400 text-xs mt-1 block">
                      {timeAgo}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs">
                No comments yet. Start the conversation.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3">
                  <Link
                    to={`/profile/${comment.user?._id || ""}`}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                  >
                    <img
                      src={comment.user?.profilePic || "https://placekitten.com/100/100"}
                      alt={comment.user?.username || "user"}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 leading-snug">
                    <p>
                      <Link
                        to={`/profile/${comment.user?._id || ""}`}
                        onClick={onClose}
                        className="font-semibold mr-1.5 hover:underline"
                      >
                        {comment.user?.username || comment.user?.name || "user"}
                      </Link>
                      <span>{comment.comment}</span>
                    </p>
                    <span className="text-gray-400 text-xs mt-1 block">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Actions & Input */}
          <div className="border-t border-gray-100">
            {/* Action Bar */}
            <div className="flex justify-between items-center px-4 pt-3 pb-1">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleToggleLike}
                  className="focus:outline-none transition active:scale-125"
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  {isLiked ? (
                    <FaHeart className="w-6 h-6 text-[#FF3040] transition-colors" />
                  ) : (
                    <FaRegHeart className="w-6 h-6 text-gray-900 hover:text-gray-500 transition-colors" />
                  )}
                </button>

                <button className="text-gray-900 hover:text-gray-500 transition">
                  <FaRegComment className="w-6 h-6" />
                </button>

                <button className="text-gray-900 hover:text-gray-500 transition">
                  <RiRepeatLine className="w-6 h-6" />
                </button>

                <button className="text-gray-900 hover:text-gray-500 transition">
                  <FiSend className="w-5 h-5" />
                </button>
              </div>

              <button className="text-gray-900 hover:text-gray-500 transition">
                <FaRegBookmark className="w-5 h-5" />
              </button>
            </div>

            {/* Likes Tally & Timestamp */}
            <div className="px-4 pb-2">
              <p className="font-semibold text-sm text-gray-900">
                {likeList.length} {likeList.length === 1 ? "like" : "likes"}
              </p>
              {timeAgo && (
                <span className="text-gray-400 text-[10px] uppercase font-medium tracking-wider">
                  {timeAgo} AGO
                </span>
              )}
            </div>

            {/* Inline Add Comment Input */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
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
                className="text-sky-500 hover:text-sky-700 disabled:opacity-30 text-sm font-semibold ml-2"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailsModal;
