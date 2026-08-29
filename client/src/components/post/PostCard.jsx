import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deletePostAsync, updatePostAsync } from "../../redux/slices/postsSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import { commentService, likeService } from "../../services";
import CommentList from "./CommentList";
import LikeList from "./LikeList";
import OptionsList from "./OptionsList";

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
        toast.success(response.data.msg || "Comment added");
        setCommentText("");
      }
    } catch (error) {
      toast.error(error.customMessage || "Error adding comment");
    }
  };

  const handleToggleLike = async () => {
    setIsLiked((prev) => !prev);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);

    try {
      await likeService.toggleLike(post._id, "Post");
      fetchLikes();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleLikeCountClick = (e) => {
    e.stopPropagation();
    if (!showLikeList) fetchLikes();
    setShowLikeList(!showLikeList);
  };

  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleToggleLike();
    }
    setLastTap(now);
  };

  const handleDeletePost = () => {
    dispatch(deletePostAsync(post._id));
    setShowOptions(false);
  };

  const handleEditPost = () => {
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleUpdatePost = () => {
    dispatch(
      updatePostAsync({
        postId: post._id,
        postData: { ...post, caption: editedCaption },
      })
    );
    setIsEditing(false);
  };

  const isAuthor = currentUserId && post?.user?._id === currentUserId;

  return (
    <div className="relative my-4 w-full max-w-lg mx-auto ig-card">
      {/* Header: User Info */}
      <div className="flex items-center justify-between p-3.5 border-b border-ig-border-light">
        <Link
          to={`/profile/${post?.user?._id}`}
          className="flex items-center space-x-3 hover:opacity-80 transition"
        >
          <div className="w-9 h-9 rounded-full p-[1.5px] ig-story-ring">
            <img
              className="w-full h-full rounded-full object-cover border border-white"
              src={post?.user?.profilePic || "https://placekitten.com/100/100"}
              alt={post?.user?.username || "User"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-ig-text-primary leading-tight">
              {post?.user?.username || post?.user?.name || "Instagram User"}
            </p>
            {post?.user?.name && (
              <p className="text-xs text-ig-text-muted">{post.user.name}</p>
            )}
          </div>
        </Link>

        {isAuthor && (
          <div className="relative">
            <button
              className="text-ig-text-secondary hover:text-ig-text-primary p-1.5 rounded-full hover:bg-gray-100 transition"
              onClick={() => setShowOptions(!showOptions)}
            >
              <FaEllipsisH className="w-4 h-4" />
            </button>
            {showOptions && (
              <OptionsList
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            )}
          </div>
        )}
      </div>

      {/* Media Content */}
      {post?.media && (
        <div className="relative select-none bg-black flex items-center justify-center min-h-[250px] max-h-[500px] overflow-hidden">
          <img
            className="w-full object-cover max-h-[500px]"
            src={post.media}
            alt="Post content"
            onDoubleClick={handleToggleLike}
            onTouchEnd={handleImageTap}
          />
          {showHeart && (
            <FaHeart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF3040] w-24 h-24 animate-heart-beat drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]" />
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleLike}
            className="flex items-center space-x-1 transition duration-150 transform active:scale-125 focus:outline-none"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            {isLiked ? (
              <FaHeart className="w-6 h-6 text-[#FF3040] transition-colors duration-150" />
            ) : (
              <FaRegHeart className="w-6 h-6 text-gray-800 hover:text-gray-500 transition-colors duration-150" />
            )}
            <span
              className="text-xs font-semibold text-gray-900 ml-1 cursor-pointer"
              onClick={handleLikeCountClick}
            >
              {likeList.length}
            </span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition"
          >
            <FaRegComment className="w-5 h-5" />
            <span className="text-xs font-semibold text-gray-800 ml-1">
              {comments.length}
            </span>
          </button>
        </div>

        <button className="text-gray-700 hover:text-gray-900 transition">
          <FaRegBookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Caption & Comments Section */}
      <div className="px-4 pb-3 pt-1">
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePost}
                className="bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
              >
                Update
              </button>
            </div>
          </div>
        ) : (
          post?.caption && (
            <p className="text-sm text-gray-800 mt-1">
              <span className="font-semibold text-gray-900 mr-2">
                {post.user?.username || post.user?.name}
              </span>
              {post.caption}
            </p>
          )
        )}

        {/* Inline Comment Box & List */}
        {showComments && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
            <CommentList
              comments={comments}
              commentsLoading={commentsLoading}
            />

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-full transition"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Likes Modal */}
      {showLikeList && (
        <LikeList
          likeList={likeList}
          onClose={() => setShowLikeList(false)}
        />
      )}
    </div>
  );
}

export default PostCard;
