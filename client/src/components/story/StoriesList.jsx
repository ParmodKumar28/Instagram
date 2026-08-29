import StoryItem from "./StoryItem";

export function StoriesList({ stories = [] }) {
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className="flex space-x-4 overflow-x-auto py-3 px-2 bg-white border border-gray-200 rounded-xl mb-4 scrollbar-none">
      {stories.map((story, index) => (
        <StoryItem key={story._id || index} story={story} />
      ))}
    </div>
  );
}

export default StoriesList;
