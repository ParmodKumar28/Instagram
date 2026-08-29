export function StoryItem({ story }) {
  return (
    <div className="flex flex-col items-center space-y-1 cursor-pointer">
      <div className="w-16 h-16 rounded-full p-[2px] ig-story-ring hover:scale-105 transition-transform duration-200">
        <img
          src={story?.user?.profilePic || "https://placekitten.com/100/100"}
          alt={story?.user?.name || "User story"}
          className="w-full h-full rounded-full object-cover border-2 border-white"
        />
      </div>
      <span className="text-xs text-gray-700 truncate w-16 text-center">
        {story?.user?.username || story?.user?.name || "User"}
      </span>
    </div>
  );
}

export default StoryItem;
