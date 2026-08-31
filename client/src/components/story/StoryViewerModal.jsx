import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  markStoryViewedAsync,
  deleteStoryAsync,
  likeStoryAsync,
  replyStoryAsync,
  fetchFeedStoriesAsync,
} from "../../redux/slices/storiesSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoTrashOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoHeartSharp,
  IoSend,
} from "react-icons/io5";
import Avatar from "../common/Avatar";
import { formatTimeAgo } from "../../utils";
import toast from "react-hot-toast";

const STORY_DURATION_MS = 5000;

export function StoryViewerModal({
  storyGroups = [],
  initialUserIndex = 0,
  isOpen,
  onClose,
}) {
  const dispatch = useDispatch();
  const { signedUser } = useSelector(usersSelector);

  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [replyText, setReplyText] = useState("");

  const currentGroup = storyGroups[userIndex];
  const currentStories = currentGroup?.stories || [];
  const currentStory = currentStories[storyIndex];
  const isSelf =
    currentGroup?.isSelf ||
    (currentGroup?.user?._id || currentGroup?.user?.id)?.toString() ===
      signedUser?._id?.toString();

  const progressIntervalRef = useRef(null);
  const videoRef = useRef(null);

  // Sync initial user index when opened
  useEffect(() => {
    if (isOpen) {
      setUserIndex(initialUserIndex);
      // Start from first unviewed story if not self
      const group = storyGroups[initialUserIndex];
      if (group && !group.isSelf) {
        const firstUnviewedIdx = group.stories.findIndex((s) => !s.isViewedByMe);
        setStoryIndex(firstUnviewedIdx !== -1 ? firstUnviewedIdx : 0);
      } else {
        setStoryIndex(0);
      }
      setProgress(0);
      setShowViewers(false);
    }
  }, [isOpen, initialUserIndex, storyGroups]);

  // Sync like state for active story
  useEffect(() => {
    if (currentStory) {
      setHasLiked(Boolean(currentStory.isLikedByMe));
    }
  }, [currentStory]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && !isSelf && !currentStory.isViewedByMe) {
      dispatch(markStoryViewedAsync(currentStory._id));
    }
  }, [currentStory, isSelf, dispatch]);

  const handleNextStory = useCallback(() => {
    setProgress(0);
    setShowViewers(false);

    if (storyIndex < currentStories.length - 1) {
      setStoryIndex((prev) => prev + 1);
    } else {
      // Advance to next user group if available
      if (userIndex < storyGroups.length - 1) {
        setUserIndex((prev) => prev + 1);
        setStoryIndex(0);
      } else {
        // End of all stories
        onClose();
      }
    }
  }, [storyIndex, currentStories.length, userIndex, storyGroups.length, onClose]);

  const handlePrevStory = useCallback(() => {
    setProgress(0);
    setShowViewers(false);

    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
    } else {
      // Go to previous user group if available
      if (userIndex > 0) {
        const prevGroup = storyGroups[userIndex - 1];
        setUserIndex((prev) => prev - 1);
        setStoryIndex(prevGroup.stories.length - 1);
      }
    }
  }, [storyIndex, userIndex, storyGroups]);

  // Progress Bar timer
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused || showViewers) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const totalSteps = STORY_DURATION_MS / stepMs;
    const increment = 100 / totalSteps;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isOpen, currentStory, isPaused, showViewers, handleNextStory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNextStory();
      if (e.key === "ArrowLeft") handlePrevStory();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNextStory, handlePrevStory, onClose]);

  if (!isOpen || !currentStory || !currentGroup) return null;

  const handleDeleteCurrentStory = async () => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      try {
        await dispatch(deleteStoryAsync(currentStory._id)).unwrap();
        dispatch(fetchFeedStoriesAsync());
        if (currentStories.length <= 1) {
          onClose();
        } else {
          handleNextStory();
        }
      } catch (err) {
        console.error("Delete story error:", err);
      }
    }
  };

  // Sync video play/pause with isPaused and showViewers
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused || showViewers) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, showViewers]);

  const handleSendReaction = async () => {
    try {
      const res = await dispatch(likeStoryAsync(currentStory._id)).unwrap();
      setHasLiked(res.isLiked);
      toast.success(
        res.isLiked
          ? `Liked ${currentGroup?.user?.username || "user"}'s story`
          : "Unliked story"
      );
    } catch (err) {
      console.error("Like story error:", err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const text = replyText.trim();
    setReplyText("");
    setIsPaused(false);
    try {
      await dispatch(replyStoryAsync({ storyId: currentStory._id, text })).unwrap();
    } catch (err) {
      console.error("Story reply error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Previous User Navigation Arrow */}
      {userIndex > 0 && (
        <button
          type="button"
          onClick={handlePrevStory}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full z-40 transition backdrop-blur-sm hidden md:flex items-center justify-center cursor-pointer"
          aria-label="Previous user story"
        >
          <IoChevronBack className="text-2xl" />
        </button>
      )}

      {/* Main Story Stage Container */}
      <div
        className="relative w-full h-[100dvh] sm:h-[92vh] sm:max-h-[92vh] max-w-[430px] sm:aspect-[9/16] bg-black sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Media Background */}
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          {currentStory.mediaType === "video" ? (
            <video
              ref={videoRef}
              src={currentStory.media}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              loop
            />
          ) : (
            <img
              src={currentStory.media}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Left / Right Interactive Tap Zones */}
        <div className="absolute inset-0 z-20 flex">
          <div
            className="w-[35%] h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
          />
          <div
            className="w-[65%] h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
          />
        </div>

        {/* Top Header & Progress Bars */}
        <div className="relative z-30 pt-3 px-3 pb-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Segmented Progress Bars */}
          <div className="flex items-center space-x-1.5 mb-3">
            {currentStories.map((_, idx) => {
              let segmentProgress = 0;
              if (idx < storyIndex) segmentProgress = 100;
              else if (idx === storyIndex) segmentProgress = progress;

              return (
                <div
                  key={idx}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{ width: `${segmentProgress}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* User Info Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2.5">
              <Avatar
                src={currentGroup?.user?.profilePic}
                alt={currentGroup?.user?.username}
                gender={currentGroup?.user?.gender}
                username={currentGroup?.user?.username}
                className="w-8 h-8 rounded-full object-cover border border-white/40"
              />
              <div>
                <p className="font-semibold text-xs leading-none">
                  {currentGroup?.user?.username || "user"}
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">
                  {formatTimeAgo(currentStory.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Author Actions: Delete */}
              {isSelf && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCurrentStory();
                  }}
                  className="p-1.5 text-white/80 hover:text-red-400 rounded-full transition cursor-pointer"
                  title="Delete story"
                >
                  <IoTrashOutline className="text-lg" />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 text-white/80 hover:text-white rounded-full transition cursor-pointer"
                title="Close"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Caption Overlay (if exists) */}
        {currentStory.caption && (
          <div className="relative z-30 px-4 py-2 mx-auto max-w-[90%] bg-black/60 backdrop-blur-md rounded-2xl text-center text-white text-xs mb-2">
            {currentStory.caption}
          </div>
        )}

        {/* Bottom Interaction Area */}
        <div className="relative z-30 px-3.5 sm:px-4 pb-5 sm:pb-4 pt-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex-shrink-0">
          {isSelf ? (
            /* Author View: Viewers Count & Drawer Toggle */
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewers((prev) => !prev);
                }}
                className="flex items-center space-x-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-white/20 transition cursor-pointer"
              >
                <IoEyeOutline className="text-base text-white/80" />
                <span>{currentStory.viewers?.length || 0} Views</span>
              </button>
            </div>
          ) : (
            /* Viewer View: Reply & Heart Reaction */
            <div className="flex items-center space-x-3">
              <form
                onSubmit={(e) => {
                  e.stopPropagation();
                  handleSendReply(e);
                }}
                className="flex-1 flex items-center bg-black/40 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 focus-within:border-white transition min-h-[42px]"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    setIsPaused(true);
                  }}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  placeholder={`Reply to ${currentGroup?.user?.username || "user"}...`}
                  className="w-full bg-transparent text-white placeholder-white/70 text-xs sm:text-sm outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
                {replyText.trim() && (
                  <button
                    type="submit"
                    className="text-white hover:text-[#0095F6] ml-2 text-base cursor-pointer flex-shrink-0"
                  >
                    <IoSend />
                  </button>
                )}
              </form>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendReaction();
                }}
                className="text-white hover:scale-110 active:scale-90 transition p-1.5 cursor-pointer flex-shrink-0 flex items-center justify-center"
                aria-label="Like story"
              >
                {hasLiked ? (
                  <IoHeartSharp className="text-2xl sm:text-3xl text-red-500 animate-in zoom-in-75 duration-150" />
                ) : (
                  <IoHeartOutline className="text-2xl sm:text-3xl" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Viewers Drawer (When author clicks views) */}
        {showViewers && isSelf && (
          <div
            className="absolute inset-x-0 bottom-0 max-h-[60%] bg-black/90 backdrop-blur-xl border-t border-white/20 rounded-t-2xl z-40 p-4 flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Seen by {currentStory.viewers?.length || 0} people
              </span>
              <button
                type="button"
                onClick={() => setShowViewers(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <IoClose className="text-lg" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-2 space-y-2.5">
              {currentStory.viewers && currentStory.viewers.length > 0 ? (
                currentStory.viewers.map((viewerItem, vIdx) => {
                  const viewerUser = viewerItem.user;
                  const vUsername = viewerUser?.username || "user";
                  return (
                    <div
                      key={viewerItem._id || vIdx}
                      className="flex items-center justify-between text-white text-xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Avatar
                          src={viewerUser?.profilePic}
                          alt={vUsername}
                          gender={viewerUser?.gender}
                          username={vUsername}
                          className="w-8 h-8 rounded-full object-cover border border-white/20"
                        />
                        <div className="truncate">
                          <p className="font-semibold truncate">{vUsername}</p>
                          {viewerUser?.name && (
                            <p className="text-[10px] text-white/60 truncate">
                              {viewerUser.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-white/50">
                        {formatTimeAgo(viewerItem.viewedAt)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-white/50">
                  No views yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Next User Navigation Arrow */}
      {userIndex < storyGroups.length - 1 && (
        <button
          type="button"
          onClick={handleNextStory}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full z-40 transition backdrop-blur-sm hidden md:flex items-center justify-center cursor-pointer"
          aria-label="Next user story"
        >
          <IoChevronForward className="text-2xl" />
        </button>
      )}
    </div>
  );
}

export default StoryViewerModal;
