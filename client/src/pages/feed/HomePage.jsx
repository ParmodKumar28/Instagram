import StoriesList from "../../components/story/StoriesList";
import PostList from "../../components/post/PostList";

export function HomePage() {
  return (
    <div className="max-w-lg mx-auto py-2">
      <StoriesList />
      <PostList />
    </div>
  );
}

export default HomePage;
