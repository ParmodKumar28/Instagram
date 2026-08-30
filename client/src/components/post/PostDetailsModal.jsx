import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  IoHeartOutline,
  IoHeartSharp,
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
  IoBookmarkOutline,
  IoBookmarkSharp,
  IoEllipsisHorizontal,
  IoClose,
} from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import { commentService, likeService, postService } from "../../services";
import { usersSelector } from "../../redux/slices/usersSlice";
import { deletePostAsync, toggleSavePostAsync, postsSelector } from "../../redux/slices/postsSlice";
import OptionsList from "./OptionsList";
import InstagramVideoPlayer from "./InstagramVideoPlayer";
import Avatar from "../common/Avatar";
import EmojiDrawer from "../common/EmojiDrawer";
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
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export function PostDetailsModal({ post: initialPost, isOpen = true, onClose }) {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [likeList, setLikeList] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showHeart, setShowHeart] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const dispatch = useDispatch();
  const { userId: currentUserId } = useSelector(usersSelector);
  const { savedPostIds = [] } = useSelector(postsSelector);

  const currentPostId = post?._id || initialPost?._id;
  const isSaved = savedPostIds.includes(currentPostId);

  const handleToggleSave = () => {
    if (currentPostId) {
      dispatch(toggleSavePostAsync(currentPostId));
    }
  };

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

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
    setTimeout(() => setShowHeart(false), 900);
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

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await dispatch(deletePostAsync(post._id));
      onClose();
    }
  };

  if (!isOpen || (!post && !initialPost)) return null;

  const currentPostData = post || initialPost;
  const author = currentPostData.user || {};
  const isAuthor = currentUserId && (author._id === currentUserId || author === currentUserId);
  const username = author.username || author.name || "user";
  const timeAgo = formatTimeAgo(currentPostData.createdAt);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200"
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
        {/* Left Column: Media (Video or Image) */}
        <div
          className="flex-1 bg-black flex items-center justify-center relative overflow-hidden md:h-full cursor-pointer select-none min-h-[300px]"
          onDoubleClick={handleDoubleTap}
        >
          {currentPostData?.mediaType === "video" ||
          /\.(mp4|webm|ogg|mov|m4v|avi)(\?.*)?$/i.test(currentPostData?.media || "") ||
          (typeof currentPostData?.media === "string" && currentPostData.media.includes("/video/upload/")) ? (
            <InstagramVideoPlayer
              src={currentPostData.media}
              onDoubleTap={handleDoubleTap}
              className="w-full h-full object-contain max-h-[620px] bg-black"
            />
          ) : (
            <img
              src={currentPostData?.media}
              alt={currentPostData?.caption || "Post media"}
              className="w-full h-full object-contain max-h-[620px]"
            />
          )}

          {/* Double tap Heart popup */}
          {showHeart && (
            <div className="absolute top-1/2 left-1/2 pointer-events-none z-30">
              <FaHeart className="text-white fill-white w-28 h-28 animate-heart-beat drop-shadow-[0_0_25px_rgba(0,0,0,0.6)]" />
            </div>
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
                <Avatar
                  src={author.profilePic}
                  alt={username}
                  gender={author.gender}
                  username={username}
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
                <IoEllipsisHorizontal className="text-lg" />
              </button>
              {showOptions && isAuthor && (
                <OptionsList onDelete={handleDeletePost} onEdit={() => {}} />
              )}
            </div>
          </div>

          {/* Scrollable Caption & Comments Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-gray-900 scrollbar-none">
            {/* Caption Item */}
            {currentPostData?.caption && (
              <div className="flex items-start space-x-3">
                <Link
                  to={`/profile/${author._id || ""}`}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                >
                  <Avatar
                    src={author.profilePic}
                    alt={username}
                    gender={author.gender}
                    username={username}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="leading-snug flex-1">
                  <p>
                    <Link
                      to={`/profile/${author._id || ""}`}
                      onClick={onClose}
                      className="font-semibold mr-1.5 hover:underline"
                    >
                      {username}
                    </Link>
                    <span>{currentPostData.caption}</span>
                  </p>
                  <span className="text-gray-400 text-xs mt-1 block">{timeAgo}</span>
                </div>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((comment) => {
                const commentUser = comment.user || {};
                const commentUsername = commentUser.username || commentUser.name || "user";
                const isCommentAuthor = currentUserId && (commentUser._id === currentUserId || commentUser === currentUserId);
                const canDelete = isCommentAuthor || isAuthor;

                return (
                  <div key={comment._id} className="flex items-start space-x-3 group">
                    <Link
                      to={`/profile/${commentUser._id || ""}`}
                      onClick={onClose}
                      className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                    >
                      <Avatar
                        src={commentUser.profilePic}
                        alt={commentUsername}
                        gender={commentUser.gender}
                        username={commentUsername}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 leading-snug">
                      <p>
                        <Link
                          to={`/profile/${commentUser._id || ""}`}
                          onClick={onClose}
                          className="font-semibold mr-1.5 hover:underline"
                        >
                          {commentUsername}
                        </Link>
                        <span className="text-gray-900">{comment.content || comment.comment}</span>
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                        <span>{formatTimeAgo(comment.createdAt)}</span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="hover:text-red-500 font-medium transition opacity-0 group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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
                    <IoHeartSharp className="text-[26px] text-[#FF3040] transition-colors" />
                  ) : (
                    <IoHeartOutline className="text-[26px] text-gray-900 hover:text-gray-500 transition-colors" />
                  )}
                </button>

                <button className="text-gray-900 hover:text-gray-500 transition">
                  <IoChatbubbleOutline className="text-[24px]" />
                </button>

                <button className="text-gray-900 hover:text-gray-500 transition">
                  <IoPaperPlaneOutline className="text-[24px]" />
                </button>
              </div>

              <button
                onClick={handleToggleSave}
                className="text-gray-900 hover:text-gray-500 transition"
              >
                {isSaved ? (
                  <IoBookmarkSharp className="text-[24px] text-black" />
                ) : (
                  <IoBookmarkOutline className="text-[24px]" />
                )}
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
            <div className="relative flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
              <input
                type="text"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none py-1 mr-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddComment();
                }}
              />
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-0.5 transition ${
                    showEmojiPicker ? "text-[#0095F6]" : ""
                  }`}
                  aria-label="Add emoji"
                >
                  <BsEmojiSmile />
                </button>

                {commentText.trim() && (
                  <button
                    onClick={handleAddComment}
                    className="text-[#0095F6] hover:text-[#1877F2] text-sm font-semibold"
                  >
                    Post
                  </button>
                )}
              </div>

              <EmojiDrawer
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onEmojiSelect={(emoji) => setCommentText((prev) => prev + emoji)}
                position="top-right"
                width={320}
                height={350}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailsModal;
