import StoriesList from "../../components/story/StoriesList";
import PostList from "../../components/post/PostList";
import FeedSuggestionsSidebar from "../../components/feed/FeedSuggestionsSidebar";

export function HomePage() {
  return (
    <div className="w-full max-w-[1100px] mx-auto flex justify-center pt-6 px-4">
      {/* Main Center Feed Column */}
      <div className="w-full max-w-[650px] flex flex-col items-center">
        {/* Top Stories Bar */}
        <StoriesList />

        {/* Posts Feed */}
        <div className="w-full">
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
