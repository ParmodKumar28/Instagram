import { IoAddCircle } from "react-icons/io5";
import Avatar from "../common/Avatar";

export function StoryItem({ storyGroup, onClick, onAddStory }) {
  const user = storyGroup?.user;
  const isSelf = storyGroup?.isSelf;
  const hasStories = storyGroup?.stories && storyGroup.stories.length > 0;
  const hasUnviewed = storyGroup?.hasUnviewed;

  const username = isSelf ? "Your story" : user?.username || user?.name || "user";
  const displayUsername =
    username.length > 10 ? `${username.slice(0, 9)}...` : username;

  const handleClick = () => {
    if (isSelf && !hasStories) {
      onAddStory?.();
    } else {
      onClick?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center space-y-1.5 cursor-pointer flex-shrink-0 group"
    >
      <div className="relative">
        {/* Avatar Ring Container */}
        <div
          className={`w-[72px] h-[72px] rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
            hasStories
              ? hasUnviewed
                ? "ig-story-ring"
                : "border-2 border-gray-300"
              : "p-0"
          }`}
        >
          <Avatar
            src={user?.profilePic}
            alt={username}
            gender={user?.gender}
            username={username}
            className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
          />
        </div>

        {/* Plus Badge for Self */}
        {isSelf && (
          <div
            onClick={(e) => {
              if (hasStories) {
                e.stopPropagation();
                onAddStory?.();
              }
            }}
            className="absolute bottom-0.5 right-0.5 bg-white rounded-full p-0.5 shadow-sm text-[#0095F6] hover:scale-110 transition cursor-pointer"
            title="Add to story"
          >
            <IoAddCircle className="text-xl" />
          </div>
        )}
      </div>

      <span
        className={`text-xs tracking-tight max-w-[76px] text-center truncate ${
          isSelf ? "font-semibold text-gray-800" : "font-normal text-gray-900"
        }`}
      >
        {displayUsername}
      </span>
    </div>
  );
}

export default StoryItem;
