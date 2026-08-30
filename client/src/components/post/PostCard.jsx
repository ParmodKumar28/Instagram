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
  IoPersonCircle,
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
import { formatTimeAgo, isVideoMedia } from "../../utils";
import CommentList from "./CommentList";
import LikeList from "./LikeList";
import OptionsList from "./OptionsList";
import InstagramVideoPlayer from "./InstagramVideoPlayer";
import EmojiDrawer from "../common/EmojiDrawer";

export function PostCard({ post, onPostDeleted }) {
  const commentInputRef = useRef(null);
  const editTextareaRef = useRef(null);
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
  const [showTags, setShowTags] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post?.caption || "");
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const dispatch = useDispatch();
  const { userId: currentUserId } = useSelector(usersSelector);
  const { savedPostIds = [] } = useSelector(postsSelector);
  const isSaved = savedPostIds.includes(post?._id);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (editTextareaRef.current) {
          editTextareaRef.current.focus();
          const len = editTextareaRef.current.value.length;
          editTextareaRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  }, [isEditing]);

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

  const fetchComments = useCallback(async () => {
    if (!post?._id) return;
    setCommentsLoading(true);
    try {
      const response = await commentService.getComments(post._id);
      if (response.status === 200) {
        setComments(response.data?.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, [post?._id]);

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [fetchLikes, fetchComments]);

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
        const len = commentInputRef.current.value.length;
        commentInputRef.current.setSelectionRange(len, len);
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
    setEditedCaption(post?.caption || "");
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleUpdatePost = async () => {
    setIsSavingPost(true);
    try {
      await dispatch(
        updatePostAsync({
          postId: post._id,
          postData: { ...post, caption: editedCaption },
        })
      ).unwrap();
      toast.success("Post updated");
      setIsEditing(false);
      setShowEditEmojiPicker(false);
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsSavingPost(false);
    }
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
        {isVideoMedia(post?.media, post?.mediaType) ? (
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <FaHeart className="text-[#FF3040] text-9xl drop-shadow-[0_0_35px_rgba(255,48,64,0.75)] animate-insta-heart-pop" />
          </div>
        )}

        {/* Tagged users overlay button & pills */}
        {post?.tags && post.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTags((prev) => !prev);
              }}
              className="bg-black/70 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-xs transition shadow-md cursor-pointer"
              aria-label="View tagged users"
            >
              <IoPersonCircle className="text-xl" />
            </button>

            {/* Tag Pills Overlay */}
            {showTags && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-xs animate-in fade-in zoom-in-95 duration-150">
                {post.tags.map((tagUser) => {
                  const tagId = tagUser?._id || tagUser;
                  const tagUsername = tagUser?.username || tagUser?.name || "user";
                  return (
                    <Link
                      key={tagId}
                      to={`/profile/${tagId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1.5 bg-black/85 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md hover:bg-black transition shadow-lg"
                    >
                      <span>@{tagUsername}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Bar with left/right padding */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleToggleLike}
              className="focus:outline-none transition active:scale-125"
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              {isLiked ? (
                <IoHeartSharp className="text-[27px] text-[#FF3040] transition-colors" />
              ) : (
                <IoHeartOutline className="text-[27px] text-gray-900 hover:text-gray-500 transition-colors" />
              )}
            </button>
            {likeList.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLikes(true)}
                className="text-[13px] font-semibold text-gray-900 hover:text-gray-600 focus:outline-none cursor-pointer"
                aria-label="View likes"
              >
                {likeList.length}
              </button>
            )}
          </div>

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
          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/80 space-y-2 mt-1 relative">
            <div className="flex items-center justify-between pb-0.5 text-xs font-semibold text-gray-700">
              <span>Edit Caption</span>
              <span className="text-[11px] text-gray-400 font-normal">{editedCaption.length}/2200</span>
            </div>

            <div className="relative">
              <textarea
                ref={editTextareaRef}
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                onFocus={(e) => {
                  const len = e.currentTarget.value.length;
                  e.currentTarget.setSelectionRange(len, len);
                }}
                placeholder="Write a caption..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0095F6] resize-none leading-relaxed"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleUpdatePost();
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                    setShowEditEmojiPicker(false);
                  }
                }}
              />

              <div className="flex items-center justify-between pt-1.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEditEmojiPicker((prev) => !prev)}
                    className={`text-gray-400 hover:text-gray-600 text-base p-1.5 rounded-md transition hover:bg-gray-100 cursor-pointer ${
                      showEditEmojiPicker ? "text-[#0095F6]" : ""
                    }`}
                    aria-label="Add emoji to caption"
                  >
                    <BsEmojiSmile />
                  </button>

                  <EmojiDrawer
                    isOpen={showEditEmojiPicker}
                    onClose={() => setShowEditEmojiPicker(false)}
                    onEmojiSelect={(emoji) => setEditedCaption((prev) => prev + emoji)}
                    position="top-left"
                    width={300}
                    height={320}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditedCaption(post?.caption || "");
                      setIsEditing(false);
                      setShowEditEmojiPicker(false);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingPost}
                    onClick={handleUpdatePost}
                    className="px-3.5 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold rounded-md shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingPost ? "Saving..." : "Done"}
                  </button>
                </div>
              </div>
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
