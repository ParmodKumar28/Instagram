import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostsAsync, postsSelector } from "../../redux/slices/postsSlice";
import { ColorRing } from "react-loader-spinner";
import PostCard from "./PostCard";

export function PostList() {
  const { posts, postsLoading } = useSelector(postsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPostsAsync());
  }, [dispatch]);

  if (postsLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <ColorRing
          visible={true}
          height="60"
          width="60"
          ariaLabel="loading-posts"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center my-6 max-w-lg mx-auto shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-1">No Posts Yet</h3>
        <p className="text-sm text-gray-500">
          Be the first to share a moment or follow other users to see their posts.
        </p>
      </div>
    );
  }

  return (
    <div className="post-list-container flex flex-col space-y-4 my-2">
      {posts.map((post) => (
        <PostCard post={post} key={post._id || post.id} />
      ))}
    </div>
  );
}

export default PostList;
