import { useRef } from "react";
import StoryItem from "./StoryItem";
import { ChevronRight } from "lucide-react";

export function StoriesList({ stories }) {
  const scrollRef = useRef(null);

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
  ];

  const displayStories = stories && stories.length > 0 ? stories : defaultStories;

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full max-w-[630px] mx-auto pt-4 pb-2 mb-2 select-none">
      <div
        ref={scrollRef}
        className="flex items-center space-x-4 overflow-x-auto scrollbar-none px-2 py-1"
      >
        {displayStories.map((story, index) => (
          <StoryItem key={story._id || index} story={story} />
        ))}
      </div>

      {/* Right Scroll Arrow Button matching screenshot */}
      <button
        onClick={handleScrollRight}
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md border border-gray-100 rounded-full p-1 text-gray-700 hover:text-black z-10 transition duration-150 focus:outline-none"
        aria-label="Next stories"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default StoriesList;
