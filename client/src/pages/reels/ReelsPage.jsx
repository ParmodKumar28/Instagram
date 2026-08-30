import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  IoHeartOutline,
  IoHeartSharp,
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
  IoBookmarkOutline,
  IoBookmarkSharp,
  IoVolumeMuteOutline,
  IoVolumeHighOutline,
  IoPlay,
  IoMusicalNotes,
  IoClose,
  IoChevronUp,
  IoChevronDown,
} from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import Avatar from "../../components/common/Avatar";
import EmojiDrawer from "../../components/common/EmojiDrawer";
import StoryViewerModal from "../../components/story/StoryViewerModal";
import LikeList from "../../components/post/LikeList";
import CommentList from "../../components/post/CommentList";
import { usersSelector } from "../../redux/slices/usersSlice";
import {
  toggleSavePostAsync,
  postsSelector,
} from "../../redux/slices/postsSlice";
import {
  followersSelector,
  toggleFollowAsync,
  unfollowUserAsync,
} from "../../redux/slices/followersSlice";
import { storiesSelector } from "../../redux/slices/storiesSlice";
import { postService, likeService, commentService } from "../../services";
import toast from "react-hot-toast";

export function ReelsPage() {
  const dispatch = useDispatch();
  const { userId: currentUserId, signedUser } = useSelector(usersSelector);
  const { savedPostIds = [] } = useSelector(postsSelector);
  const { following = [] } = useSelector(followersSelector);
  const { feedStories = [] } = useSelector(storiesSelector);

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);

  const containerRef = useRef(null);

  // Fetch reels from API
  const fetchReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getReels();
      if (res.data?.reels && res.data.reels.length > 0) {
        setReels(res.data.reels);
      } else {
        // Fallback to getAllPosts filtering videos
        const allRes = await postService.getAllPosts();
        const allPosts = allRes.data?.posts || allRes.data || [];
        const videoPosts = allPosts.filter(
          (p) =>
            p.mediaType === "video" ||
            /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(p.media || "")
        );
        setReels(videoPosts);
      }
    } catch (err) {
      console.error("Failed to load reels:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Observer to track which reel is currently centered in viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.children);
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      let closestIdx = 0;
      let minDistance = Infinity;

      children.forEach((child, idx) => {
        const childCenter = child.offsetTop + child.clientHeight / 2;
        const viewportCenter = containerTop + containerHeight / 2;
        const distance = Math.abs(childCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      if (closestIdx !== activeIndex && closestIdx < reels.length) {
        setActiveIndex(closestIdx);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeIndex, reels.length]);

  const scrollToReel = (index) => {
    if (index >= 0 && index < reels.length) {
      const target = containerRef.current?.children[index];
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleScrollUp = () => {
    scrollToReel(activeIndex - 1);
  };

  const handleScrollDown = () => {
    scrollToReel(activeIndex + 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleScrollDown();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScrollUp();
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, reels.length]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#07060A] flex flex-col items-center justify-center overflow-hidden">
        <div className="w-12 h-12 border-3 border-white/20 border-t-[#DD2A7B] rounded-full animate-spin mb-4" />
        <p className="text-white/70 text-xs font-medium tracking-wide">
          Loading Reels...
        </p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="relative min-h-screen bg-[#07060A] flex flex-col items-center justify-center p-6 text-center select-none text-white overflow-hidden">
        <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-4 bg-white/5 backdrop-blur-md shadow-2xl">
          <IoMusicalNotes className="text-3xl text-white/80" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1.5">No Reels Available</h2>
        <p className="text-xs text-white/60 max-w-sm mb-6 leading-relaxed">
          There are no video reels in your feed yet. Create and publish your first video reel!
        </p>
        <Link
          to="/new-post"
          className="px-6 py-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-bold rounded-xl shadow-xl hover:opacity-95 transition"
        >
          Create New Reel
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#050508] min-h-screen select-none overflow-hidden">
      {/* Clean Subtle Ambient Background Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(35, 18, 55, 0.45) 0%, rgba(13, 8, 22, 0.6) 50%, rgba(5, 5, 8, 1) 100%)",
        }}
      />

      {/* Floating Right Side Up / Down Navigation Controls (No count displayed) */}
      {reels.length > 1 && (
        <div className="fixed right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center space-y-3">
          {/* Scroll Up Button */}
          <button
            type="button"
            onClick={handleScrollUp}
            disabled={activeIndex === 0}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shadow-xl"
            title="Previous reel"
            aria-label="Previous reel"
          >
            <IoChevronUp className="text-2xl" />
          </button>

          {/* Scroll Down Button */}
          <button
            type="button"
            onClick={handleScrollDown}
            disabled={activeIndex === reels.length - 1}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shadow-xl"
            title="Next reel"
            aria-label="Next reel"
          >
            <IoChevronDown className="text-2xl" />
          </button>
        </div>
      )}

      {/* Snapping Vertical Reels Container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none py-2"
      >
        {reels.map((reel, index) => {
          const isActive = index === activeIndex;
          const isSaved = savedPostIds.includes(reel._id);

          // Check if author has active stories in feedStories
          const authorStoryGroup = feedStories.find(
            (g) =>
              (g.user?._id || g.user?.id)?.toString() ===
              (reel.user?._id || reel.user)?.toString()
          );
          const authorHasStories = Boolean(
            authorStoryGroup &&
              authorStoryGroup.stories &&
              authorStoryGroup.stories.length > 0
          );

          return (
            <div
              key={reel._id}
              className="w-full min-h-screen py-4 md:py-8 flex items-center justify-center snap-start snap-always"
            >
              <SingleReelCard
                reel={reel}
                isActive={isActive}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((prev) => !prev)}
                currentUserId={currentUserId}
                signedUser={signedUser}
                isSaved={isSaved}
                authorStoryGroup={authorStoryGroup}
                authorHasStories={authorHasStories}
                onOpenStory={(group) => setActiveStoryGroup(group)}
                following={following}
              />
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal if user clicks story ring on author avatar */}
      {activeStoryGroup && (
        <StoryViewerModal
          storyGroups={[activeStoryGroup]}
          initialUserIndex={0}
          isOpen={true}
          onClose={() => setActiveStoryGroup(null)}
        />
      )}
    </div>
  );
}

function SingleReelCard({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  currentUserId,
  signedUser,
  isSaved,
  authorStoryGroup,
  authorHasStories,
  onOpenStory,
  following,
}) {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const commentInputRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [likeList, setLikeList] = useState(reel.likes || []);
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    (reel.likes || []).some(
      (l) => (l.user?._id || l.user || l)?.toString() === currentUserId?.toString()
    )
  );
  const [showLikes, setShowLikes] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  // Comments state matching PostCard
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(reel.comments || []);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, username }
  const [showEmoji, setShowEmoji] = useState(false);

  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFollowed, setIsFollowed] = useState(
    (following || []).some(
      (u) =>
        (u.following?._id || u.following || u._id)?.toString() ===
        (reel.user?._id || reel.user)?.toString()
    )
  );

  const username = reel.user?.username || reel.user?.name || "user";
  const isAuthor =
    currentUserId &&
    (reel.user?._id || reel.user)?.toString() === currentUserId.toString();

  // Fetch likes from server
  const fetchLikes = useCallback(async () => {
    try {
      const res = await likeService.getLikes(reel._id, "Post");
      const list = res.data?.likes || [];
      setLikeList(list);
      setLikesCount(list.length);
      setIsLiked(
        list.some(
          (l) =>
            (l.user?._id || l.user || l)?.toString() === currentUserId?.toString()
        )
      );
    } catch (err) {
      console.error("Error fetching likes for reel:", err);
    }
  }, [reel._id, currentUserId]);

  // Fetch comments from server
  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const res = await commentService.getComments(reel._id);
      if (res.data?.comments) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments for reel:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [reel._id]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  // Play / Pause video based on active scroll status
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Double tap detected
      handleDoubleTap();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        handleTogglePlay();
      }, 250);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const res = await likeService.toggleLike(reel._id, "Post");
      if (res.status === 200) {
        setIsLiked((prev) => !prev);
        fetchLikes();
      }
    } catch (err) {
      console.error("Failed to toggle like on reel:", err);
    }
  };

  const handleDoubleTap = () => {
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);

    if (!isLiked) {
      handleLikeToggle();
    }
  };

  const handleOpenLikeList = async (e) => {
    e.stopPropagation();
    await fetchLikes();
    setShowLikes(true);
  };

  const handleSaveToggle = async () => {
    try {
      await dispatch(toggleSavePostAsync(reel._id)).unwrap();
    } catch (err) {
      console.error("Save toggle error:", err);
    }
  };

  const handleShareReel = () => {
    const url = `${window.location.origin}/post/${reel._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Reel link copied to clipboard!");
    } else {
      toast.success("Reel link ready to share");
    }
  };

  const handleFollowToggle = async () => {
    const authorId = reel.user?._id || reel.user;
    try {
      if (isFollowed) {
        await dispatch(unfollowUserAsync(authorId));
        setIsFollowed(false);
      } else {
        await dispatch(toggleFollowAsync(authorId));
        setIsFollowed(true);
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  // Reply handlers
  const handleReply = (arg1, arg2) => {
    const commentId = typeof arg1 === "object" ? arg1?.commentId : arg1;
    const replyUsername = typeof arg1 === "object" ? arg1?.username : arg2 || "user";
    setReplyingTo({ commentId, username: replyUsername });
    setShowComments(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCommentDeleted = (deletedCommentId) => {
    setComments((prev) =>
      prev
        .filter((c) => c._id !== deletedCommentId)
        .map((c) => ({
          ...c,
          replies: Array.isArray(c.replies)
            ? c.replies.filter((r) => r._id !== deletedCommentId)
            : [],
        }))
    );
  };

  const handleAddComment = async (e) => {
    e?.preventDefault?.();
    if (!commentText.trim()) return;

    const textToAdd = commentText.trim();
    const parentId = replyingTo?.commentId || null;

    setCommentText("");
    setReplyingTo(null);
    setShowEmoji(false);

    try {
      const response = await commentService.addComment(
        reel._id,
        textToAdd,
        parentId
      );
      if (response.status === 201 && response.data?.comment) {
        const newComment = response.data.comment;
        setComments((prevComments) => {
          if (parentId) {
            return prevComments.map((c) => {
              if (c._id === parentId) {
                const existingReplies = Array.isArray(c.replies)
                  ? c.replies
                  : [];
                return {
                  ...c,
                  replies: [...existingReplies, newComment],
                };
              }
              return c;
            });
          } else {
            return [newComment, ...prevComments];
          }
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className="flex items-end justify-center space-x-3 sm:space-x-4 max-w-full">
      {/* Video Player Card */}
      <div className="relative w-[340px] sm:w-[380px] md:w-[410px] h-[580px] sm:h-[660px] md:h-[720px] max-h-[86vh] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 flex items-center justify-center">
        {/* Video Stream Element */}
        <video
          ref={videoRef}
          src={reel.media}
          className="w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onClick={handleVideoClick}
        />

        {/* Play / Pause Center Icon Indicator */}
        {!isPlaying && (
          <div
            onClick={handleTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-auto cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-black/65 backdrop-blur-md flex items-center justify-center text-white text-3xl shadow-lg border border-white/20">
              <IoPlay className="translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Double-tap Floating Heart Animation */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <FaHeart className="text-[#FF3040] text-9xl drop-shadow-[0_0_35px_rgba(255,48,64,0.85)] animate-insta-heart-pop" />
          </div>
        )}

        {/* Top Controls: Mute/Unmute */}
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="bg-black/50 hover:bg-black/75 backdrop-blur-md text-white p-2.5 rounded-full transition shadow-md border border-white/15 cursor-pointer"
            aria-label={isMuted ? "Unmute reel" : "Mute reel"}
          >
            {isMuted ? (
              <IoVolumeMuteOutline className="text-xl" />
            ) : (
              <IoVolumeHighOutline className="text-xl" />
            )}
          </button>
        </div>

        {/* Bottom Left Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 pt-20 pb-4 px-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 text-white flex flex-col space-y-2.5 pointer-events-auto">
          {/* Author Header */}
          <div className="flex items-center space-x-3">
            {authorHasStories ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStory(authorStoryGroup);
                }}
                className="w-10 h-10 rounded-full p-[2px] ig-story-ring flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                title={`View ${username}'s story`}
              >
                <Avatar
                  src={reel.user?.profilePic}
                  alt={username}
                  gender={reel.user?.gender}
                  username={username}
                  className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
                />
              </div>
            ) : (
              <Link
                to={`/profile/${reel.user?._id || ""}`}
                className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden hover:opacity-90"
              >
                <Avatar
                  src={reel.user?.profilePic}
                  alt={username}
                  gender={reel.user?.gender}
                  username={username}
                  className="w-full h-full rounded-full object-cover"
                />
              </Link>
            )}

            <Link
              to={`/profile/${reel.user?._id || ""}`}
              className="font-bold text-xs text-white hover:underline drop-shadow-md truncate max-w-[140px]"
            >
              {username}
            </Link>

            {!isAuthor && (
              <button
                type="button"
                onClick={handleFollowToggle}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer flex-shrink-0 ${
                  isFollowed
                    ? "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    : "bg-[#0095F6] hover:bg-[#1877F2] text-white shadow-xs"
                }`}
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Caption */}
          {reel.caption && (
            <div className="text-xs text-white/95 drop-shadow-md pr-2">
              <p className={!isExpandedCaption ? "line-clamp-2 leading-relaxed" : "leading-relaxed"}>
                {reel.caption}
              </p>
              {reel.caption.length > 80 && (
                <button
                  type="button"
                  onClick={() => setIsExpandedCaption((prev) => !prev)}
                  className="text-white/70 text-[11px] font-semibold mt-0.5 hover:underline cursor-pointer"
                >
                  {isExpandedCaption ? "less" : "...more"}
                </button>
              )}
            </div>
          )}

          {/* Audio Track Bar */}
          <div className="flex items-center space-x-2 text-[11px] text-white/80 drop-shadow-md max-w-[85%]">
            <IoMusicalNotes className="text-xs flex-shrink-0 animate-pulse text-[#FD1D1D]" />
            <span className="truncate">Original audio • {username}</span>
          </div>
        </div>

        {/* Video Scrubber Progress Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Slide-Up Comments Drawer */}
        {showComments && (
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-xl z-40 flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 text-white">
              <span className="text-xs font-bold uppercase tracking-wider">
                Comments ({comments.length})
              </span>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="text-white/70 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            {/* Replying To Banner */}
            {replyingTo && (
              <div className="flex items-center justify-between text-xs bg-blue-900/40 border-b border-blue-500/30 px-3.5 py-1.5 text-blue-200">
                <span className="truncate">
                  Replying to <span className="font-semibold text-white">@{replyingTo.username}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="text-blue-300 hover:text-white p-0.5"
                >
                  <IoClose className="text-base" />
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-none">
              {commentsLoading ? (
                <div className="py-20 text-center text-white/50 text-xs">
                  Loading comments...
                </div>
              ) : comments.length > 0 ? (
                <CommentList
                  comments={comments}
                  onReply={handleReply}
                  onCommentDeleted={handleCommentDeleted}
                  isDark={true}
                />
              ) : (
                <div className="py-20 text-center text-white/50 text-xs">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Comment Input */}
            <form
              onSubmit={handleAddComment}
              className="relative p-3 border-t border-white/10 flex items-center space-x-2 bg-black/80"
            >
              <Avatar
                src={signedUser?.profilePic}
                alt={signedUser?.username}
                gender={signedUser?.gender}
                username={signedUser?.username}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  replyingTo
                    ? `Reply to @${replyingTo.username}...`
                    : "Add a comment..."
                }
                className="flex-1 bg-white/10 text-white placeholder-white/50 text-xs rounded-full px-3.5 py-2 outline-none border border-transparent focus:border-white/30 transition"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmoji((prev) => !prev);
                }}
                className="text-white/70 hover:text-white text-lg p-1 cursor-pointer transition active:scale-90"
                title="Choose an emoji"
                aria-label="Choose an emoji"
              >
                <BsEmojiSmile />
              </button>
              {commentText.trim() && (
                <button
                  type="submit"
                  className="text-[#0095F6] hover:text-[#1877F2] font-bold text-xs cursor-pointer px-2"
                >
                  Post
                </button>
              )}

              {/* Emoji Picker Drawer placed directly relative to input form */}
              <EmojiDrawer
                isOpen={showEmoji}
                onClose={() => setShowEmoji(false)}
                onEmojiSelect={(emoji) => {
                  setCommentText((prev) => prev + emoji);
                  commentInputRef.current?.focus();
                }}
                position="top-right"
                width={280}
                height={320}
                className="shadow-2xl border-white/20"
              />
            </form>
          </div>
        )}
      </div>

      {/* Side Action Column (Clean and separated beside the reel card) */}
      <div className="flex flex-col items-center space-y-4 pb-2 text-white">
        {/* Like Button & Count (Clicking count opens LikeList modal) */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleLikeToggle}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-90 hover:scale-105 cursor-pointer shadow-md"
            aria-label="Like reel"
          >
            {isLiked ? (
              <IoHeartSharp className="text-2xl text-[#FF3040] animate-in zoom-in-75 duration-150" />
            ) : (
              <IoHeartOutline className="text-2xl text-white" />
            )}
          </button>
          <button
            type="button"
            onClick={handleOpenLikeList}
            className="text-xs font-bold mt-1 text-white/90 hover:underline cursor-pointer"
            title="View likes"
          >
            {likesCount}
          </button>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-90 hover:scale-105 cursor-pointer shadow-md"
            aria-label="Comment on reel"
          >
            <IoChatbubbleOutline className="text-2xl text-white" />
          </button>
          <span className="text-xs font-bold mt-1 text-white/90">
            {comments.length}
          </span>
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={handleShareReel}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-90 hover:scale-105 cursor-pointer shadow-md"
          aria-label="Share reel"
        >
          <IoPaperPlaneOutline className="text-2xl text-white" />
        </button>

        {/* Save / Bookmark */}
        <button
          type="button"
          onClick={handleSaveToggle}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-90 hover:scale-105 cursor-pointer shadow-md"
          aria-label="Save reel"
        >
          {isSaved ? (
            <IoBookmarkSharp className="text-2xl text-[#0095F6]" />
          ) : (
            <IoBookmarkOutline className="text-2xl text-white" />
          )}
        </button>

        {/* Audio Vinyl Album Cover */}
        <div className="pt-2">
          <div className="w-10 h-10 rounded-full border-2 border-white/80 bg-black flex items-center justify-center shadow-lg animate-spin [animation-duration:5s]">
            <Avatar
              src={reel.user?.profilePic}
              alt={username}
              gender={reel.user?.gender}
              username={username}
              className="w-6 h-6 rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Like List Modal */}
      {showLikes && (
        <LikeList likes={likeList} onClose={() => setShowLikes(false)} />
      )}
    </div>
  );
}

export default ReelsPage;
