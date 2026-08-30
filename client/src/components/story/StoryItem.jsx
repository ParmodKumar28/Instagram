import Avatar from "../common/Avatar";

export function StoryItem({ story }) {
  const username = story?.user?.username || story?.user?.name || "user";
  const displayUsername =
    username.length > 10 ? `${username.slice(0, 9)}...` : username;

  return (
    <div className="flex flex-col items-center space-y-2 cursor-pointer flex-shrink-0 group">
      <div className="w-[76px] h-[76px] rounded-full p-[2.5px] ig-story-ring group-hover:scale-105 transition-transform duration-200">
        <Avatar
          src={story?.user?.profilePic}
          alt={username}
          gender={story?.user?.gender}
          username={username}
          className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
        />
      </div>
      <span className="text-xs text-gray-900 tracking-tight max-w-[80px] text-center truncate font-normal">
        {displayUsername}
      </span>
    </div>
  );
}

export default StoryItem;
