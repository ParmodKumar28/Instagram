import { useState, useRef, useEffect, useCallback } from "react";
import StoryItem from "./StoryItem";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export function StoriesList({ stories }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const defaultStories = [
    {
      _id: "s1",
      user: {
        username: "motofoxyy",
        profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s2",
      user: {
        username: "sanprime_official",
        profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s3",
      user: {
        username: "imsenhe_creative",
        profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s4",
      user: {
        username: "lokesh____wander",
        profilePic: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s5",
      user: {
        username: "lalitrana79",
        profilePic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s6",
      user: {
        username: "saakshrao",
        profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s7",
      user: {
        username: "alina_v",
        profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s8",
      user: {
        username: "david_lens",
        profilePic: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s9",
      user: {
        username: "clara.travels",
        profilePic: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s10",
      user: {
        username: "alex_fitlife",
        profilePic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s11",
      user: {
        username: "maya.studio",
        profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s12",
      user: {
        username: "rohan_music",
        profilePic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s13",
      user: {
        username: "elena_design",
        profilePic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=140&h=140&fit=crop&crop=faces",
      },
    },
    {
      _id: "s14",
      user: {
        username: "samuel.vibe",
        profilePic: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=140&h=140&fit=crop&crop=faces",
      },
    },
  ];

  const displayStories = stories && stories.length > 0 ? stories : defaultStories;

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
  }, [checkScrollability]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full max-w-[640px] mx-auto pt-2 pb-4 select-none">
      {/* Left Scroll Chevron Button */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border border-gray-100 rounded-full p-1.5 text-gray-700 hover:text-black z-20 transition duration-150 focus:outline-none hidden sm:flex items-center justify-center text-sm"
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
        {displayStories.map((story, index) => (
          <StoryItem key={story._id || index} story={story} />
        ))}
      </div>

      {/* Right Scroll Chevron Button */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border border-gray-100 rounded-full p-1.5 text-gray-700 hover:text-black z-20 transition duration-150 focus:outline-none hidden sm:flex items-center justify-center text-sm"
          aria-label="Next stories"
        >
          <IoChevronForward className="text-base" />
        </button>
      )}
    </div>
  );
}

export default StoriesList;
