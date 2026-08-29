export function StoryItem({ story }) {
  const username = story?.user?.username || story?.user?.name || "user";
  const displayUsername =
    username.length > 9 ? `${username.slice(0, 8)}...` : username;

  return (
    <div className="flex flex-col items-center space-y-1.5 cursor-pointer flex-shrink-0 group">
      <div className="w-[66px] h-[66px] rounded-full p-[2.5px] ig-story-ring group-hover:scale-105 transition-transform duration-200">
        <img
          src={story?.user?.profilePic || "https://placekitten.com/100/100"}
          alt={username}
          className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
        />
      </div>
      <span className="text-[11px] text-gray-900 tracking-tight max-w-[70px] text-center truncate font-normal">
        {displayUsername}
      </span>
    </div>
  );
}

export default StoryItem;
