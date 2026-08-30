import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeedStoriesAsync,
  storiesSelector,
} from "../../redux/slices/storiesSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import StoryItem from "./StoryItem";
import StoryViewerModal from "./StoryViewerModal";
import CreateStoryModal from "./CreateStoryModal";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export function StoriesList() {
  const dispatch = useDispatch();
  const { signedUser } = useSelector(usersSelector);
  const { feedStories, loading } = useSelector(storiesSelector);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [activeViewerIndex, setActiveViewerIndex] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFeedStoriesAsync());
  }, [dispatch]);

  // Combine feedStories ensuring logged-in user is always the 1st tray item
  const allStoryGroups = useMemo(() => {
    const selfGroupId = signedUser?._id?.toString();
    const selfGroup = feedStories.find(
      (g) =>
        g.isSelf ||
        (g.user?._id || g.user?.id)?.toString() === selfGroupId
    );

    const otherGroups = feedStories.filter(
      (g) =>
        !g.isSelf &&
        (g.user?._id || g.user?.id)?.toString() !== selfGroupId
    );

    const firstItem = selfGroup || {
      user: signedUser,
      stories: [],
      isSelf: true,
      hasUnviewed: false,
    };

    return [firstItem, ...otherGroups];
  }, [feedStories, signedUser]);

  // Viewable story groups (only groups with stories)
  const viewableStoryGroups = useMemo(() => {
    return allStoryGroups.filter((g) => g.stories && g.stories.length > 0);
  }, [allStoryGroups]);

  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        el.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [checkScrollability, allStoryGroups]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleOpenViewer = (group) => {
    if (!group.stories || group.stories.length === 0) return;
    const idx = viewableStoryGroups.findIndex(
      (g) =>
        (g.user?._id || g.user?.id)?.toString() ===
        (group.user?._id || group.user?.id)?.toString()
    );
    if (idx !== -1) {
      setActiveViewerIndex(idx);
    }
  };

  return (
    <div className="relative w-full max-w-[640px] mx-auto pt-2 pb-4 select-none">
      {/* Left Scroll Chevron Button */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border border-gray-100 rounded-full p-1.5 text-gray-700 hover:text-black z-20 transition duration-150 focus:outline-none hidden sm:flex items-center justify-center text-sm cursor-pointer"
          aria-label="Previous stories"
        >
          <IoChevronBack className="text-base" />
        </button>
      )}

      {/* Stories Scroll Container */}
      <div
        ref={scrollRef}
        className="flex items-center space-x-4 overflow-x-auto scroll-smooth px-2 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {allStoryGroups.map((group, index) => (
          <StoryItem
            key={(group.user?._id || group.user?.id) || index}
            storyGroup={group}
            onClick={() => handleOpenViewer(group)}
            onAddStory={() => setIsCreateOpen(true)}
          />
        ))}
      </div>

      {/* Right Scroll Chevron Button */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border border-gray-100 rounded-full p-1.5 text-gray-700 hover:text-black z-20 transition duration-150 focus:outline-none hidden sm:flex items-center justify-center text-sm cursor-pointer"
          aria-label="Next stories"
        >
          <IoChevronForward className="text-base" />
        </button>
      )}

      {/* Story Viewer Fullscreen Modal */}
      {activeViewerIndex !== null && viewableStoryGroups.length > 0 && (
        <StoryViewerModal
          storyGroups={viewableStoryGroups}
          initialUserIndex={activeViewerIndex}
          isOpen={true}
          onClose={() => setActiveViewerIndex(null)}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

export default StoriesList;
