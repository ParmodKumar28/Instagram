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
  IoCameraOutline,
} from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import Avatar from "../../components/common/Avatar";
import EmojiDrawer from "../../components/common/EmojiDrawer";
import StoryViewerModal from "../../components/story/StoryViewerModal";
import LikeList from "../../components/post/LikeList";
import CommentList from "../../components/post/CommentList";
import SharePostModal from "../../components/post/SharePostModal";
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
      <div className="relative w-full h-full min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div
          className="absolute w-[450px] h-[450px] rounded-full blur-[100px] opacity-25 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #DD2A7B 0%, #833AB4 50%, #405DE6 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#DD2A7B] rounded-full animate-spin mb-4 shadow-sm" />
          <p className="text-gray-600 text-xs font-semibold tracking-wide">
            Loading Reels...
          </p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="relative w-full h-full min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center p-6 text-center select-none text-gray-900 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #FD1D1D 0%, #833AB4 50%, #5851DB 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center mb-4 bg-white/80 backdrop-blur-xl shadow-lg">
            <IoMusicalNotes className="text-3xl text-[#DD2A7B]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1.5">No Reels Available</h2>
          <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
            There are no video reels in your feed yet. Create and publish your first video reel!
          </p>
          <Link
            to="/new-post"
            className="px-6 py-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition"
          >
            Create New Reel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100dvh-48px)] md:h-screen bg-[#fafbfc] select-none overflow-hidden">
      {/* Ambient Gradient Blur Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Left Gradient Orb */}
        <div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[120px] opacity-35"
          style={{
            background: "radial-gradient(circle, #FD1D1D 0%, #833AB4 60%, transparent 80%)",
          }}
        />
        {/* Center Right Gradient Orb */}
        <div
          className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-[130px] opacity-30"
          style={{
            background: "radial-gradient(circle, #F56040 0%, #405DE6 60%, transparent 80%)",
          }}
        />
        {/* Bottom Left Gradient Orb */}
        <div
          className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] rounded-full blur-[120px] opacity-25"
          style={{
            background: "radial-gradient(circle, #833AB4 0%, #5851DB 60%, transparent 80%)",
          }}
        />
        {/* Soft frosted overlay for clean white theme blend */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-3xl" />
      </div>

      {/* Floating Right Side Up / Down Navigation Controls (Desktop Only) */}
      {reels.length > 1 && (
        <div className="fixed right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center space-y-3">
          {/* Scroll Up Button */}
          <button
            type="button"
            onClick={handleScrollUp}
            disabled={activeIndex === 0}
            className="w-11 h-11 rounded-full bg-white/80 hover:bg-white active:scale-90 backdrop-blur-xl border border-gray-200/80 text-gray-800 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl"
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
            className="w-11 h-11 rounded-full bg-white/80 hover:bg-white active:scale-90 backdrop-blur-xl border border-gray-200/80 text-gray-800 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl"
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
        className="relative z-10 w-full h-[calc(100dvh-48px)] md:h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none no-scrollbar"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorY: "contain",
          touchAction: "pan-y",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
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
              className="w-full h-[calc(100dvh-48px)] md:h-screen md:py-8 flex items-center justify-center snap-start snap-always flex-shrink-0"
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
  const [showShareModal, setShowShareModal] = useState(false);
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
    fetchLikes();
  }, [fetchLikes]);

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

  const lastTapRef = useRef(0);

  const handleVideoClick = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 350;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      handleDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        handleTogglePlay();
      }, 280);
    }
  };

  const handleDoubleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    handleDoubleTap();
  };

  const handleLikeToggle = async () => {
    const prevLiked = isLiked;
    const nextLiked = !prevLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await likeService.toggleLike(reel._id, "Post");
      if (res.status === 200) {
        fetchLikes();
      } else {
        setIsLiked(prevLiked);
        setLikesCount((prev) => (prevLiked ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error("Failed to toggle like on reel:", err);
      setIsLiked(prevLiked);
      setLikesCount((prev) => (prevLiked ? prev + 1 : Math.max(0, prev - 1)));
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
    <div className="relative w-full h-[calc(100dvh-48px)] md:w-auto md:h-auto flex items-center md:items-end justify-center md:space-x-4 max-w-full flex-shrink-0">
      {/* Video Player Card */}
      <div
        className="relative w-full h-[calc(100dvh-48px)] md:w-[410px] md:h-[720px] md:max-h-[86vh] rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-black md:border md:border-white/10 flex items-center justify-center select-none flex-shrink-0"
        onDoubleClick={handleDoubleClick}
      >
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
          onDoubleClick={handleDoubleClick}
        />

        {/* Play / Pause Center Icon Indicator */}
        {!isPlaying && (
          <div
            onClick={handleVideoClick}
            onDoubleClick={handleDoubleClick}
            className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-auto cursor-pointer z-20"
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

        {/* Mobile Native Top Bar: Reels Title, Mute Toggle & Create Button */}
        <div className="absolute top-0 inset-x-0 pt-3.5 px-4 pb-8 bg-gradient-to-b from-black/80 via-black/25 to-transparent z-30 flex items-center justify-between pointer-events-none md:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Reels
            </span>
          </div>

          <div className="flex items-center space-x-2.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 backdrop-blur-md text-white flex items-center justify-center transition shadow-lg border border-white/15 cursor-pointer"
              aria-label={isMuted ? "Unmute reel" : "Mute reel"}
            >
              {isMuted ? (
                <IoVolumeMuteOutline className="text-lg" />
              ) : (
                <IoVolumeHighOutline className="text-lg" />
              )}
            </button>

            <Link
              to="/new-post"
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 backdrop-blur-md text-white flex items-center justify-center transition shadow-lg border border-white/15 cursor-pointer"
              aria-label="Create reel"
              title="Create reel"
            >
              <IoCameraOutline className="text-xl" />
            </Link>
          </div>
        </div>

        {/* Desktop Top Right Controls: Mute/Unmute */}
        <div className="hidden md:block absolute top-4 right-4 z-20">
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

        {/* Mobile Floating Actions Overlay (Inside video on small screens) */}
        <div className="absolute right-2.5 sm:right-3.5 bottom-10 sm:bottom-12 z-20 flex flex-col items-center space-y-3.5 sm:space-y-4 md:hidden text-white pointer-events-auto">
          {/* Like */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleLikeToggle}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-xl transition cursor-pointer"
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
              className="text-[11px] font-bold mt-1 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] cursor-pointer"
            >
              {likesCount}
            </button>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowComments(true)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-xl transition cursor-pointer"
              aria-label="Comment on reel"
            >
              <IoChatbubbleOutline className="text-2xl text-white" />
            </button>
            <span className="text-[11px] font-bold mt-1 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {comments.length}
            </span>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-xl transition cursor-pointer"
            aria-label="Share reel"
          >
            <IoPaperPlaneOutline className="text-2xl text-white" />
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-xl transition cursor-pointer"
            aria-label="Save reel"
          >
            {isSaved ? (
              <IoBookmarkSharp className="text-2xl text-[#0095F6]" />
            ) : (
              <IoBookmarkOutline className="text-2xl text-white" />
            )}
          </button>

          {/* Rotating Vinyl Disc */}
          <div className="pt-1">
            <div className="w-8 h-8 rounded-full border-2 border-white/90 bg-black flex items-center justify-center shadow-2xl animate-spin [animation-duration:5s]">
              <Avatar
                src={reel.user?.profilePic}
                alt={username}
                gender={reel.user?.gender}
                username={username}
                className="w-4 h-4 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom Left Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 pt-28 pb-4 pl-3.5 sm:pl-4 pr-16 md:pr-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 text-white flex flex-col space-y-2 pointer-events-none">
          {/* Author Header */}
          <div className="flex items-center space-x-2.5 pointer-events-auto">
            {authorHasStories ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStory(authorStoryGroup);
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[2px] ig-story-ring flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
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
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 overflow-hidden hover:opacity-90"
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
              className="font-bold text-xs sm:text-sm text-white hover:underline drop-shadow-md truncate max-w-[130px] sm:max-w-[180px]"
            >
              {username}
            </Link>

            {!isAuthor && (
              <button
                type="button"
                onClick={handleFollowToggle}
                className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer flex-shrink-0 ${
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
            <div className="text-xs text-white/95 drop-shadow-md pointer-events-auto">
              <p className={!isExpandedCaption ? "line-clamp-2 leading-relaxed" : "leading-relaxed"}>
                {reel.caption}
              </p>
              {reel.caption.length > 70 && (
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
          <div className="flex items-center space-x-2 text-[11px] text-white/80 drop-shadow-md max-w-[90%] pointer-events-auto">
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
            className="absolute inset-x-0 bottom-0 max-h-[82%] sm:max-h-full sm:inset-0 rounded-t-3xl sm:rounded-none bg-[#0e0e13]/95 sm:bg-black/90 backdrop-blur-2xl z-40 flex flex-col animate-in slide-in-from-bottom duration-200 border-t border-white/15 sm:border-0 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Handle */}
            <div
              className="w-10 h-1 bg-white/30 rounded-full mx-auto mt-2.5 mb-1 sm:hidden cursor-pointer"
              onClick={() => setShowComments(false)}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-white">
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
                <div className="py-16 text-center text-white/50 text-xs">
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
                <div className="py-16 text-center text-white/50 text-xs">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Comment Input */}
            <form
              onSubmit={handleAddComment}
              className="relative p-3 border-t border-white/10 flex items-center space-x-2 bg-black/90 pb-safe"
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

              {/* Emoji Picker Drawer */}
              <EmojiDrawer
                isOpen={showEmoji}
                onClose={() => setShowEmoji(false)}
                onEmojiSelect={(emoji) => {
                  setCommentText((prev) => prev + emoji);
                  commentInputRef.current?.focus();
                }}
                position="top-right"
                width={280}
                height={300}
                className="shadow-2xl border-white/20"
              />
            </form>
          </div>
        )}
      </div>

      {/* Desktop Side Action Column (Clean and separated beside the reel card on desktop) */}
      <div className="hidden md:flex flex-col items-center space-y-4 pb-2 text-gray-800 flex-shrink-0">
        {/* Like Button & Count */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleLikeToggle}
            className="w-11 h-11 rounded-full bg-white/85 hover:bg-white active:scale-90 backdrop-blur-xl border border-gray-200/80 flex items-center justify-center text-gray-800 transition active:scale-90 hover:scale-105 cursor-pointer shadow-md hover:shadow-lg"
            aria-label="Like reel"
          >
            {isLiked ? (
              <IoHeartSharp className="text-2xl text-[#FF3040] animate-in zoom-in-75 duration-150" />
            ) : (
              <IoHeartOutline className="text-2xl text-gray-800" />
            )}
          </button>
          <button
            type="button"
            onClick={handleOpenLikeList}
            className="text-xs font-bold mt-1 text-gray-700 hover:text-black hover:underline cursor-pointer"
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
            className="w-11 h-11 rounded-full bg-white/85 hover:bg-white active:scale-90 backdrop-blur-xl border border-gray-200/80 flex items-center justify-center text-gray-800 transition active:scale-90 hover:scale-105 cursor-pointer shadow-md hover:shadow-lg"
            aria-label="Comment on reel"
          >
            <IoChatbubbleOutline className="text-2xl text-gray-800" />
          </button>
          <span className="text-xs font-bold mt-1 text-gray-700">
            {comments.length}
          </span>
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="w-11 h-11 rounded-full bg-white/85 hover:bg-white active:scale-90 backdrop-blur-xl border border-gray-200/80 flex items-center justify-center text-gray-800 transition active:scale-90 hover:scale-105 cursor-pointer shadow-md hover:shadow-lg"
          aria-label="Share reel"
        >
          <IoPaperPlaneOutline className="text-2xl text-gray-800" />
        </button>

        {/* Save / Bookmark */}
        <button
          type="button"
          onClick={handleSaveToggle}
          className="w-11 h-11 rounded-full bg-white/85 hover:bg-white active:scale-90 backdrop-blur-xl border border-gray-200/80 flex items-center justify-center text-gray-800 transition active:scale-90 hover:scale-105 cursor-pointer shadow-md hover:shadow-lg"
          aria-label="Save reel"
        >
          {isSaved ? (
            <IoBookmarkSharp className="text-2xl text-[#0095F6]" />
          ) : (
            <IoBookmarkOutline className="text-2xl text-gray-800" />
          )}
        </button>

        {/* Audio Vinyl Album Cover */}
        <div className="pt-2">
          <div className="w-10 h-10 rounded-full border-2 border-white bg-black flex items-center justify-center shadow-lg animate-spin [animation-duration:5s]">
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

      {/* Share Post Modal */}
      <SharePostModal
        post={reel}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

export default ReelsPage;
