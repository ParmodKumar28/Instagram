import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
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
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import {
  deletePostAsync,
  updatePostAsync,
  toggleSavePostAsync,
  postsSelector,
} from "../../redux/slices/postsSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import { commentService, likeService } from "../../services";
import CommentList from "./CommentList";
import LikeList from "./LikeList";
import OptionsList from "./OptionsList";
import InstagramVideoPlayer from "./InstagramVideoPlayer";
import EmojiDrawer from "../common/EmojiDrawer";

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

export function PostCard({ post, onPostDeleted }) {
  const commentInputRef = useRef(null);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, username }
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [showLikes, setShowLikes] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post?.caption || "");
  const [lastTap, setLastTap] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const dispatch = useDispatch();
  const { userId: currentUserId } = useSelector(usersSelector);
  const { savedPostIds = [] } = useSelector(postsSelector);
  const isSaved = savedPostIds.includes(post?._id);

  const handleToggleSave = () => {
    if (post?._id) {
      dispatch(toggleSavePostAsync(post._id));
    }
  };

  const fetchLikes = useCallback(async () => {
    try {
      const response = await likeService.getLikes(post._id, "Post");
      if (response.status === 200) {
        setLikeList(response.data?.likes || []);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [post?._id]);

  const getComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const response = await commentService.getComments(post._id);
      if (response.status === 200) {
        setComments(response.data?.comments || []);
      }
    } catch (error) {
      console.error("Error getting comments:", error);
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
      setIsLiked(
        likeList.some(
          (like) => (like.user?._id || like.user) === currentUserId
        )
      );
    }
  }, [likeList, currentUserId]);

  const handleReply = ({ commentId, username }) => {
    setReplyingTo({ commentId, username });
    setCommentText(`@${username} `);
    setShowComments(true);
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
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
    setShowComments(true);

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
    if (!isLiked) {
      handleToggleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };

  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleDoubleTap();
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

  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
    0
  );

  return (
    <article className="w-full max-w-[480px] mx-auto bg-white border border-gray-200 rounded-2xl mb-8 select-none shadow-sm overflow-hidden">
      {/* Header with comfortable side padding */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-4 sm:py-3.5 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <Link
            to={`/profile/${post?.user?._id || ""}`}
            className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden"
          >
            <Avatar
              src={post?.user?.profilePic}
              alt={username}
              gender={post?.user?.gender}
              username={username}
              className="w-full h-full rounded-full object-cover"
            />
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              to={`/profile/${post?.user?._id || ""}`}
              className="font-semibold text-xs text-gray-900 hover:underline"
            >
              {username}
            </Link>
            {timeAgo && (
              <>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-xs">{timeAgo}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-gray-500 hover:text-gray-800 p-1"
          aria-label="Options"
        >
          <IoEllipsisHorizontal className="text-lg" />
        </button>
      </div>

      {showOptions && (
        <OptionsList
          isAuthor={isAuthor}
          post={post}
          onDelete={handleDeletePost}
          onEdit={handleEditPost}
          onClose={() => setShowOptions(false)}
        />
      )}

      {/* Media (Video or Image) */}
      <div
        className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={handleImageTap}
      >
        {post?.mediaType === "video" ||
        /\.(mp4|webm|ogg|mov|m4v|avi)(\?.*)?$/i.test(post.media) ||
        (typeof post.media === "string" && post.media.includes("/video/upload/")) ? (
          <InstagramVideoPlayer
            src={post.media}
            className="w-full h-full"
            autoPlay={false}
            onDoubleTap={handleDoubleTap}
          />
        ) : (
          <img
            className="w-full h-full object-cover"
            src={post.media}
            alt="Post media"
          />
        )}

        {/* Double tap heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <FaHeart className="text-white text-8xl drop-shadow-2xl animate-ping opacity-90 duration-300" />
          </div>
        )}
      </div>

      {/* Actions Bar with left/right padding */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleLike}
            className="flex items-center space-x-1.5 focus:outline-none transition active:scale-125"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            {isLiked ? (
              <IoHeartSharp className="text-[27px] text-[#FF3040] transition-colors" />
            ) : (
              <IoHeartOutline className="text-[27px] text-gray-900 hover:text-gray-500 transition-colors" />
            )}
            {likeList.length > 0 && (
              <span className="text-[13px] font-semibold text-gray-900">
                {likeList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1.5 text-gray-900 hover:text-gray-500 focus:outline-none transition"
            aria-label="Comments"
          >
            <IoChatbubbleOutline className="text-[25px]" />
            {totalCommentsCount > 0 && (
              <span className="text-[13px] font-semibold text-gray-900">
                {totalCommentsCount}
              </span>
            )}
          </button>

          <button
            className="flex items-center text-gray-900 hover:text-gray-500 focus:outline-none transition"
            aria-label="Share"
          >
            <IoPaperPlaneOutline className="text-[25px]" />
          </button>
        </div>

        <button
          onClick={handleToggleSave}
          className="text-gray-900 hover:text-gray-500 focus:outline-none transition"
          aria-label="Bookmark"
        >
          {isSaved ? (
            <IoBookmarkSharp className="text-[25px] text-black" />
          ) : (
            <IoBookmarkOutline className="text-[25px]" />
          )}
        </button>
      </div>

      {/* Caption & Comments Section with proper left and right margins */}
      <div className="px-4 pt-1.5 pb-3.5 space-y-2 text-sm text-gray-900">
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePost}
                className="px-3 py-1 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          post?.caption && (
            <div className="leading-snug">
              <Link
                to={`/profile/${post?.user?._id || ""}`}
                className="font-semibold mr-2 text-[13px] hover:underline"
              >
                {username}
              </Link>
              <span className="text-[13px] font-normal text-gray-900">
                {post.caption}
              </span>
            </div>
          )
        )}

        {/* View all comments link */}
        {totalCommentsCount > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-xs text-gray-400 font-medium hover:text-gray-600 transition block pt-0.5"
          >
            View all {totalCommentsCount} comment{totalCommentsCount > 1 ? "s" : ""}
          </button>
        )}

        {/* Comments drawer */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100 max-h-60 overflow-y-auto space-y-2">
            {commentsLoading ? (
              <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
            ) : (
              <CommentList
                comments={comments}
                onReply={handleReply}
                onCommentDeleted={handleCommentDeleted}
              />
            )}
          </div>
        )}

        {/* Replying banner */}
        {replyingTo && (
          <div className="flex items-center justify-between text-xs bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-lg text-gray-700 animate-in fade-in duration-150">
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

        {/* Add comment input */}
        <div className="relative pt-2 flex items-center justify-between border-t border-gray-100">
          <input
            ref={commentInputRef}
            type="text"
            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
            className="flex-1 text-xs text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none py-1 mr-2"
          />
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`text-gray-400 hover:text-gray-600 text-sm cursor-pointer p-0.5 transition ${
                showEmojiPicker ? "text-[#0095F6]" : ""
              }`}
              aria-label="Add emoji"
            >
              <BsEmojiSmile />
            </button>

            {commentText.trim() && (
              <button
                onClick={handleAddComment}
                className="text-[#0095F6] hover:text-[#1877F2] text-xs font-semibold"
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
            width={300}
            height={340}
          />
        </div>
      </div>

      {showLikes && (
        <LikeList likes={likeList} onClose={() => setShowLikes(false)} />
      )}
    </article>
  );
}

export default PostCard;
