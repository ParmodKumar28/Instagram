import { useState, useEffect, useCallback, useRef } from "react";
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
import CommentList from "./CommentList";
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
  const commentInputRef = useRef(null);
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [likeList, setLikeList] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, username }
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

  const handleReply = ({ commentId, username }) => {
    setReplyingTo({ commentId, username });
    setCommentText(`@${username} `);
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 50);
  };

  const handleCommentDeleted = (deletedCommentId, parentCommentId) => {
    setComments((prevComments) => {
      if (parentCommentId) {
        return prevComments.map((c) => {
          if (c._id === parentCommentId) {
            return {
              ...c,
              replies: (c.replies || []).filter((r) => r._id !== deletedCommentId),
            };
          }
          return c;
        });
      } else {
        return prevComments
          .filter((c) => c._id !== deletedCommentId)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => r._id !== deletedCommentId),
          }));
      }
    });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const textToAdd = commentText;
    const parentId = replyingTo?.commentId || null;

    setCommentText("");
    setReplyingTo(null);

    try {
      const response = await commentService.addComment(
        post._id,
        textToAdd,
        parentId
      );
      if (response.status === 201 && response.data?.comment) {
        const newComment = response.data.comment;
        setComments((prevComments) => {
          if (parentId) {
            return prevComments.map((c) => {
              if (c._id === parentId) {
                const existingReplies = Array.isArray(c.replies) ? c.replies : [];
                return {
                  ...c,
                  replies: [...existingReplies, newComment],
                };
              }
              return c;
            });
          } else {
            return [...prevComments, newComment];
          }
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to post comment");
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

  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      {/* Close button at top-right outside modal */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-50 p-2 focus:outline-none transition"
        aria-label="Close modal"
      >
        <IoClose />
      </button>

      {/* Modal Container */}
      <div
        className="bg-white rounded-xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Media */}
        <div
          className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px] select-none cursor-pointer"
          onDoubleClick={handleDoubleTap}
        >
          {currentPostData.mediaType === "video" ||
          /\.(mp4|webm|ogg|mov|m4v|avi)(\?.*)?$/i.test(currentPostData.media) ||
          (typeof currentPostData.media === "string" && currentPostData.media.includes("/video/upload/")) ? (
            <InstagramVideoPlayer
              src={currentPostData.media}
              className="w-full h-full max-h-[85vh] object-contain"
              autoPlay={true}
              onDoubleTap={handleDoubleTap}
            />
          ) : (
            <img
              src={currentPostData.media}
              alt="Post"
              className="w-full h-full max-h-[85vh] object-contain"
            />
          )}

          {/* Double tap heart animation overlay */}
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <FaHeart className="text-white text-9xl drop-shadow-2xl animate-ping opacity-90 duration-300" />
            </div>
          )}
        </div>

        {/* Right Side: Header, Comments, Actions, Input */}
        <div className="md:w-2/5 flex flex-col justify-between bg-white h-[450px] md:h-auto max-h-[85vh]">
          {/* Post Header */}
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
              aria-label="Post options"
            >
              <IoEllipsisHorizontal className="text-lg" />
            </button>
            {showOptions && (
              <OptionsList
                isAuthor={isAuthor}
                post={currentPostData}
                onDelete={handleDeletePost}
                onClose={() => setShowOptions(false)}
              />
            )}
          </div>
          </div>

          {/* Scrollable Caption & Comments Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-gray-900 scrollbar-none">
            {/* Caption Item */}
            {currentPostData?.caption && (
              <div className="flex items-start space-x-3 pb-3 border-b border-gray-50">
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
            <CommentList
              comments={comments}
              commentsLoading={commentsLoading}
              onReply={handleReply}
              onCommentDeleted={handleCommentDeleted}
            />
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

                <div className="flex items-center space-x-1.5 text-gray-900">
                  <IoChatbubbleOutline className="text-[24px]" />
                  {totalCommentsCount > 0 && (
                    <span className="text-[13px] font-semibold text-gray-900">
                      {totalCommentsCount}
                    </span>
                  )}
                </div>

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

            {/* Replying banner */}
            {replyingTo && (
              <div className="flex items-center justify-between text-xs bg-blue-50/80 border-t border-blue-100 px-4 py-1.5 text-gray-700">
                <span className="truncate">
                  Replying to <span className="font-semibold text-[#0095F6]">@{replyingTo.username}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="text-gray-400 hover:text-gray-700 p-0.5 transition"
                  aria-label="Cancel reply"
                >
                  <IoClose className="text-base" />
                </button>
              </div>
            )}

            {/* Inline Add Comment Input */}
            <div className="relative flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
              <input
                ref={commentInputRef}
                type="text"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none py-1 mr-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
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
