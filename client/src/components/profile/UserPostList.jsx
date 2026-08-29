import { useState } from "react";
import { FaHeart, FaComment } from "react-icons/fa";
import { IoFilmOutline } from "react-icons/io5";
import PostDetailsModal from "../post/PostDetailsModal";

export function UserPostList({ posts = [] }) {
  const [selectedPost, setSelectedPost] = useState(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500 select-none">
        <div className="w-16 h-16 rounded-full border-2 border-gray-300 mx-auto flex items-center justify-center mb-3">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-400">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">No Posts Yet</h3>
        <p className="text-xs text-gray-400">When posts are shared, they will appear on this profile.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-6 md:gap-7 w-full select-none">
        {posts.map((post) => {
          const isVideo =
            post?.mediaType === "video" ||
            /\.(mp4|webm|ogg|mov|m4v|avi)(\?.*)?$/i.test(post?.media || "") ||
            (typeof post?.media === "string" && post.media.includes("/video/upload/"));

          return (
            <div
              key={post._id}
              onClick={() => setSelectedPost(post)}
              className="group relative aspect-square bg-gray-100 overflow-hidden block cursor-pointer"
            >
              {isVideo ? (
                <video
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  src={post.media}
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={post.media}
                  alt={post.caption || "Post"}
                  loading="lazy"
                />
              )}

              {/* Video Badge on Top Right */}
              {isVideo && (
                <div className="absolute top-2.5 right-2.5 text-white drop-shadow-md z-10">
                  <IoFilmOutline className="text-lg" />
                </div>
              )}

              {/* Hover Overlay with Likes and Comments Count */}
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-6 text-white font-bold text-sm sm:text-base pointer-events-none z-20">
                <div className="flex items-center space-x-1.5">
                  <FaHeart className="text-white text-lg" />
                  <span>{post.likes?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <FaComment className="text-white text-lg" />
                  <span>{post.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Modal on Click */}
      {selectedPost && (
        <PostDetailsModal
          isOpen={true}
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}

export default UserPostList;
