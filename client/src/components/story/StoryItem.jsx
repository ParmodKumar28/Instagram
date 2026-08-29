export function StoryItem({ story }) {
  return (
    <div className="flex flex-col items-center space-y-1 cursor-pointer">
      <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
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
