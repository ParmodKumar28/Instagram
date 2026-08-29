import StoriesList from "../../components/story/StoriesList";
import PostList from "../../components/post/PostList";
import FeedSuggestionsSidebar from "../../components/feed/FeedSuggestionsSidebar";

export function HomePage() {
  return (
    <div className="w-full max-w-[1100px] mx-auto flex justify-center pt-2 sm:pt-6 px-4 sm:px-6">
      {/* Main Center Feed Column */}
      <div className="w-full max-w-[640px] flex flex-col items-center">
        {/* Top Stories Bar (Wide spacious tray matching official desktop Instagram) */}
        <div className="w-full mb-2">
          <StoriesList />
        </div>

        {/* Posts Feed (Centered comfortable post width) */}
        <div className="w-full max-w-[480px]">
          <PostList />
        </div>
      </div>

      {/* Right Desktop Suggestions Sidebar */}
      <div className="hidden lg:block ml-16 flex-shrink-0">
        <FeedSuggestionsSidebar />
      </div>
    </div>
  );
}

export default HomePage;
