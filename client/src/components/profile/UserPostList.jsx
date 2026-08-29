import { Link } from "react-router-dom";
import { FaHeart, FaComment } from "react-icons/fa";

export function UserPostList({ posts = [] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-sm font-medium">No posts shared yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4 md:gap-6 w-full">
      {posts.map((post) => (
        <Link
          to={`/post/${post._id}`}
          key={post._id}
          className="group relative aspect-square bg-gray-100 overflow-hidden rounded-md sm:rounded-lg block"
        >
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={post.media}
            alt={post.caption || "Post"}
            loading="lazy"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-6 text-white font-bold text-sm sm:text-base pointer-events-none">
            <div className="flex items-center space-x-1">
              <FaHeart className="text-white" />
              <span>{post.likes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaComment className="text-white" />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default UserPostList;
