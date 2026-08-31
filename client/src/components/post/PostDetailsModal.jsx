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
  IoPersonCircle,
  IoPersonOutline,
} from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import { commentService, likeService, postService, userService } from "../../services";
import { usersSelector } from "../../redux/slices/usersSlice";
import { deletePostAsync, toggleSavePostAsync, updatePostAsync, postsSelector } from "../../redux/slices/postsSlice";
import { formatTimeAgo, isVideoMedia } from "../../utils";
import OptionsList from "./OptionsList";
import InstagramVideoPlayer from "./InstagramVideoPlayer";
import Avatar from "../common/Avatar";
import CommentList from "./CommentList";
import LikeList from "./LikeList";
import StoryViewerModal from "../story/StoryViewerModal";
import SharePostModal from "./SharePostModal";
import EmojiDrawer from "../common/EmojiDrawer";
import toast from "react-hot-toast";

export function PostDetailsModal({ post: initialPost, isOpen = true, onClose }) {
  const commentInputRef = useRef(null);
  const editTextareaRef = useRef(null);
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [likeList, setLikeList] = useState([]);
  const [showLikes, setShowLikes] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, username }
  const [showHeart, setShowHeart] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(initialPost?.caption || "");
  const [editedTags, setEditedTags] = useState(initialPost?.tags || []);
  const [editTagQuery, setEditTagQuery] = useState("");
  const [editSearchResults, setEditSearchResults] = useState([]);
  const [isSearchingEditTags, setIsSearchingEditTags] = useState(false);
  const [showEditTagInput, setShowEditTagInput] = useState(false);
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const dispatch = useDispatch();
  const { userId: currentUserId, signedUser } = useSelector(usersSelector);
  const { savedPostIds = [] } = useSelector(postsSelector);

  const currentPostId = post?._id || initialPost?._id;
  const isSaved = savedPostIds.includes(currentPostId);

  useEffect(() => {
    if (!editTagQuery.trim()) {
      setEditSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingEditTags(true);
      try {
        const res = await userService.searchUsers(editTagQuery);
        if (res.data?.users) {
          const filtered = res.data.users.filter(
            (u) =>
              u._id !== signedUser?._id &&
              !editedTags.some((tagged) => (tagged._id || tagged) === u._id)
          );
          setEditSearchResults(filtered);
        }
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setIsSearchingEditTags(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [editTagQuery, signedUser?._id, editedTags]);

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
    if (currentPostId) {
      dispatch(toggleSavePostAsync(currentPostId));
    }
  };

  useEffect(() => {
    setPost(initialPost);
    setEditedCaption(initialPost?.caption || "");
  }, [initialPost]);

  // Fetch full fresh post data from backend
  const fetchFullPost = useCallback(async () => {
    const postId = initialPost?._id || post?._id;
    if (!postId) return;
    try {
      const response = await postService.getPostById(postId);
      if (response?.data?.post) {
        setPost(response.data.post);
      }
    } catch (error) {
      console.error("Error fetching full post details:", error);
    }
  }, [initialPost?._id, post?._id]);

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

  const lastTapRef = useRef(0);

  const handleToggleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeList((prev) => {
      if (nextLiked) {
        return [...prev, { user: signedUser || { _id: currentUserId } }];
      } else {
        return prev.filter(
          (l) => (l.user?._id || l.user)?.toString() !== currentUserId?.toString()
        );
      }
    });

    try {
      const response = await likeService.toggleLike(post._id, "Post");
      if (response.status === 200) {
        fetchLikes();
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(!nextLiked);
      fetchLikes();
    }
  };

  const handleDoubleTap = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);

    if (!isLiked) {
      handleToggleLike();
    }
  };

  const handleTouchTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 350;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleDoubleTap(e);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleReply = ({ commentId, username }) => {
    setReplyingTo({ commentId, username });
    setCommentText(`@${username} `);
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
    const targetPostId = post?._id || initialPost?._id;

    if (!targetPostId) return;

    setCommentText("");
    setReplyingTo(null);

    try {
      const response = await commentService.addComment(
        targetPostId,
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

  const handleEditPost = () => {
    setEditedCaption(currentPostData?.caption || "");
    setEditedTags(currentPostData?.tags || []);
    setEditTagQuery("");
    setEditSearchResults([]);
    setShowEditTagInput(false);
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleEditAddTag = (user) => {
    if (!editedTags.some((u) => (u._id || u) === user._id)) {
      setEditedTags((prev) => [...prev, user]);
    }
    setEditTagQuery("");
    setEditSearchResults([]);
  };

  const handleEditRemoveTag = (userId) => {
    setEditedTags((prev) => prev.filter((u) => (u._id || u) !== userId));
  };

  const handleUpdatePost = async () => {
    setIsSavingPost(true);
    try {
      const res = await dispatch(
        updatePostAsync({
          postId: post._id,
          postData: {
            ...post,
            caption: editedCaption,
            tags: editedTags.map((u) => u._id || u),
          },
        })
      ).unwrap();
      const updated = res?.updatedPost || res;
      setPost((prev) => ({
        ...prev,
        caption: editedCaption,
        tags: updated?.tags || editedTags,
      }));
      toast.success("Post updated");
      setIsEditing(false);
      setShowEditEmojiPicker(false);
      setShowEditTagInput(false);
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsSavingPost(false);
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
  const isPostAuthorSelf = Boolean(
    currentUserId &&
      (currentPostData?.user === currentUserId ||
        currentPostData?.user === signedUser?._id ||
        currentPostData?.user?._id === currentUserId ||
        currentPostData?.user?._id === signedUser?._id ||
        (!currentPostData?.user && initialPost?._id))
  );

  const author =
    typeof currentPostData?.user === "object" && currentPostData?.user !== null
      ? currentPostData.user
      : isPostAuthorSelf
      ? signedUser || {}
      : {};

  const authorId =
    author._id ||
    author.id ||
    (typeof currentPostData?.user === "string" ? currentPostData.user : "") ||
    "";

  const isAuthor = Boolean(
    currentUserId &&
      (authorId === currentUserId?.toString() ||
        author === currentUserId ||
        isPostAuthorSelf)
  );

  const username =
    author.username ||
    author.name ||
    (isPostAuthorSelf ? signedUser?.username || signedUser?.name : "") ||
    "user";
  const timeAgo = formatTimeAgo(currentPostData?.createdAt);

  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      {/* Close button at top-right outside modal (Tablet / Desktop) */}
      <button
        onClick={onClose}
        className="hidden sm:block absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-[100] p-2 focus:outline-none transition cursor-pointer"
        aria-label="Close modal"
      >
        <IoClose />
      </button>

      {/* Modal Container */}
      <div
        className="bg-white rounded-none sm:rounded-2xl overflow-hidden max-w-5xl w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] flex flex-col md:flex-row shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header with Author & Close (Mobile Only) */}
        <div className="h-12 px-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white md:hidden">
          <div className="flex items-center space-x-2.5">
            <Link
              to={authorId ? `/profile/${authorId}` : "#"}
              onClick={authorId ? onClose : undefined}
              className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
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
              to={authorId ? `/profile/${authorId}` : "#"}
              onClick={authorId ? onClose : undefined}
              className="text-xs font-semibold text-gray-900 hover:underline truncate max-w-[150px]"
            >
              {username}
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-700 hover:text-black p-1.5 rounded-full"
              aria-label="Post options"
            >
              <IoEllipsisHorizontal className="text-lg" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-700 hover:text-black p-1.5 rounded-full"
              aria-label="Close modal"
            >
              <IoClose className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Left Side: Media */}
        <div
          className="w-full md:w-3/5 bg-black flex items-center justify-center relative h-[36vh] sm:h-[45vh] md:h-auto md:min-h-[520px] select-none cursor-pointer flex-shrink-0"
          onClick={handleTouchTap}
          onDoubleClick={handleDoubleTap}
        >
          {isVideoMedia(currentPostData.media, currentPostData.mediaType) ? (
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
              className="w-full h-full max-h-[85vh] object-contain pointer-events-none"
            />
          )}

          {/* Double tap heart animation overlay */}
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <FaHeart className="text-[#FF3040] text-9xl drop-shadow-[0_0_35px_rgba(255,48,64,0.75)] animate-insta-heart-pop" />
            </div>
          )}

          {/* Tagged users overlay button & pills */}
          {currentPostData?.tags && currentPostData.tags.length > 0 && (
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
                  {currentPostData.tags.map((tagUser) => {
                    const tagId = tagUser?._id || tagUser;
                    const tagUsername = tagUser?.username || tagUser?.name || "user";
                    return (
                      <Link
                        key={tagId}
                        to={`/profile/${tagId}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
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

        {/* Right Side: Header, Comments, Actions, Input */}
        <div className="w-full md:w-2/5 flex flex-col justify-between bg-white flex-1 min-h-0 overflow-hidden">
          {/* Desktop Post Header */}
          <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Link
                to={authorId ? `/profile/${authorId}` : "#"}
                onClick={authorId ? onClose : undefined}
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
                to={authorId ? `/profile/${authorId}` : "#"}
                onClick={authorId ? onClose : undefined}
                className="text-sm font-semibold text-gray-900 hover:underline"
              >
                {username}
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-700 hover:text-black p-1.5 rounded-full hover:bg-gray-50 transition cursor-pointer"
                aria-label="Post options"
              >
                <IoEllipsisHorizontal className="text-lg" />
              </button>
            </div>
          </div>

          {/* Scrollable Caption & Comments Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-xs sm:text-sm text-gray-900 scrollbar-none min-h-0">
            {/* Caption Edit Form */}
            {isEditing ? (
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/80 space-y-2 mb-3 relative">
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
                        data-emoji-trigger="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditEmojiPicker((prev) => !prev);
                        }}
                        className={`text-gray-400 hover:text-gray-600 text-base p-1.5 rounded-md transition hover:bg-gray-100 cursor-pointer ${
                          showEditEmojiPicker ? "text-[#0095F6]" : ""
                        }`}
                        aria-label="Add emoji to caption"
                        title="Add emoji"
                      >
                        <BsEmojiSmile />
                      </button>

                      <EmojiDrawer
                        isOpen={showEditEmojiPicker}
                        onClose={() => setShowEditEmojiPicker(false)}
                        onEmojiSelect={(emoji) => setEditedCaption((prev) => prev + emoji)}
                        position="bottom-left"
                        width={280}
                        height={290}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditedCaption(currentPostData?.caption || "");
                          setEditedTags(currentPostData?.tags || []);
                          setIsEditing(false);
                          setShowEditEmojiPicker(false);
                          setShowEditTagInput(false);
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

                {/* Tag / Untag People in Edit */}
                <div className="pt-2 border-t border-gray-200/80">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none py-1"
                    onClick={() => setShowEditTagInput((prev) => !prev)}
                  >
                    <span className="text-xs font-semibold text-gray-700 flex items-center space-x-1">
                      <span>Tagged People</span>
                      {editedTags.length > 0 && (
                        <span className="text-[11px] text-[#0095F6] font-bold">
                          ({editedTags.length})
                        </span>
                      )}
                    </span>
                    <IoPersonOutline className="text-gray-500 text-sm" />
                  </div>

                  {/* Tagged users chips */}
                  {editedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 my-1.5">
                      {editedTags.map((tagUser) => {
                        const tagId = tagUser?._id || tagUser;
                        const tagUsername =
                          tagUser?.username || tagUser?.name || "user";
                        return (
                          <span
                            key={tagId}
                            className="inline-flex items-center space-x-1 bg-white text-gray-800 text-[11px] px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs"
                          >
                            <Avatar
                              src={tagUser?.profilePic}
                              alt={tagUsername}
                              gender={tagUser?.gender}
                              username={tagUsername}
                              className="w-3.5 h-3.5 rounded-full object-cover"
                            />
                            <span className="font-medium">@{tagUsername}</span>
                            <button
                              type="button"
                              onClick={() => handleEditRemoveTag(tagId)}
                              className="text-gray-400 hover:text-red-500 ml-0.5 cursor-pointer"
                              aria-label={`Untag ${tagUsername}`}
                            >
                              <IoClose className="text-xs" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Search user to tag input & dropdown */}
                  {showEditTagInput && (
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        value={editTagQuery}
                        onChange={(e) => setEditTagQuery(e.target.value)}
                        placeholder="Search user to tag..."
                        className="w-full bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0095F6]"
                      />

                      {isSearchingEditTags && (
                        <div className="py-1.5 text-center text-[11px] text-gray-400">
                          Searching...
                        </div>
                      )}

                      {editSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-36 overflow-y-auto divide-y divide-gray-50">
                          {editSearchResults.map((user) => (
                            <div
                              key={user._id}
                              onClick={() => handleEditAddTag(user)}
                              className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 cursor-pointer transition"
                            >
                              <Avatar
                                src={user.profilePic}
                                alt={user.username}
                                gender={user.gender}
                                username={user.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-gray-900 truncate">
                                  {user.username}
                                </span>
                                {user.name && (
                                  <span className="text-[10px] text-gray-400 truncate">
                                    {user.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {editTagQuery.trim() &&
                        !isSearchingEditTags &&
                        editSearchResults.length === 0 && (
                          <div className="py-1 text-center text-[11px] text-gray-400">
                            No users found
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              currentPostData?.caption && (
                <div className="flex items-start space-x-3 pb-3 border-b border-gray-50">
                  <Link
                    to={authorId ? `/profile/${authorId}` : "#"}
                    onClick={authorId ? onClose : undefined}
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
                        to={authorId ? `/profile/${authorId}` : "#"}
                        onClick={authorId ? onClose : undefined}
                        className="font-semibold mr-1.5 hover:underline"
                      >
                        {username}
                      </Link>
                      <span>{currentPostData.caption}</span>
                    </p>
                    <span className="text-gray-400 text-xs mt-1 block">{timeAgo}</span>
                  </div>
                </div>
              )
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

                <button
                  onClick={() => setShowShareModal(true)}
                  className="text-gray-900 hover:text-gray-500 transition active:scale-110 cursor-pointer"
                  aria-label="Share post"
                >
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
              {likeList.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowLikes(true)}
                  className="font-semibold text-sm text-gray-900 hover:underline cursor-pointer focus:outline-none"
                >
                  {likeList.length} {likeList.length === 1 ? "like" : "likes"}
                </button>
              ) : (
                <p className="text-xs text-gray-400">Be the first to like this</p>
              )}
              {timeAgo && (
                <span className="text-gray-400 text-[10px] uppercase font-medium tracking-wider block mt-0.5">
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
                  data-emoji-trigger="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker((prev) => !prev);
                  }}
                  className={`text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-0.5 transition ${
                    showEmojiPicker ? "text-[#0095F6]" : ""
                  }`}
                  aria-label="Add emoji"
                  title="Add emoji"
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

      {showOptions && (
        <OptionsList
          isAuthor={isAuthor}
          post={currentPostData}
          onDelete={handleDeletePost}
          onEdit={isAuthor ? handleEditPost : null}
          onClose={() => setShowOptions(false)}
        />
      )}

      {showLikes && (
        <LikeList likeList={likeList} onClose={() => setShowLikes(false)} />
      )}

      {/* Share Post Modal */}
      <SharePostModal
        post={post || initialPost}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

export default PostDetailsModal;
