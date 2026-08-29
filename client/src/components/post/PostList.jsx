import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostsAsync, postsSelector } from "../../redux/slices/postsSlice";
import PostCard from "./PostCard";
import PostSkeleton from "../common/skeletons/PostSkeleton";

export function PostList() {
  const { posts, postsLoading } = useSelector(postsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPostsAsync());
  }, [dispatch]);

  if (postsLoading) {
    return (
      <div className="flex flex-col space-y-4 my-2">
        <PostSkeleton />
        <PostSkeleton />
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
