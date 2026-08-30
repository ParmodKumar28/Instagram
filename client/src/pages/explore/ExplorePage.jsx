import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoCloseCircle,
  IoHeartSharp,
  IoChatbubbleSharp,
  IoFilmOutline,
  IoImagesOutline,
  IoClose,
} from "react-icons/io5";
import Avatar from "../../components/common/Avatar";
import PostDetailsModal from "../../components/post/PostDetailsModal";
import { postService, userService } from "../../services";
import { isVideoMedia } from "../../utils";

const RECENT_SEARCHES_KEY = "insta_recent_searches";

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "photos" | "videos"
  const [selectedPost, setSelectedPost] = useState(null);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load recent searches:", err);
    }
  }, []);

  // Fetch explore posts
  useEffect(() => {
    const fetchExplorePosts = async () => {
      setIsLoading(true);
      try {
        const res = await postService.getAllPosts();
        if (res.data?.posts) {
          setPosts(res.data.posts);
        } else if (Array.isArray(res.data)) {
          setPosts(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch explore posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExplorePosts();
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(searchQuery.trim());
        if (res.data?.users) {
          setSearchResults(res.data.users);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveToRecent = (user) => {
    const userId = user._id || user.id;
    const filtered = recentSearches.filter(
      (item) => (item._id || item.id) !== userId
    );
    const updated = [
      {
        _id: userId,
        username: user.username,
        name: user.name,
        profilePic: user.profilePic,
        gender: user.gender,
      },
      ...filtered,
    ].slice(0, 15);

    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save recent search:", err);
    }
  };

  const handleSelectUser = (user) => {
    saveToRecent(user);
    setIsSearchFocused(false);
    navigate(`/profile/${user._id || user.id}`);
  };

  const handleRemoveRecent = (e, userId) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = recentSearches.filter(
      (item) => (item._id || item.id) !== userId
    );
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to remove recent search:", err);
    }
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error("Failed to clear recent searches:", err);
    }
  };

  // Filter explore posts
  const filteredPosts = useMemo(() => {
    if (activeFilter === "photos") {
      return posts.filter((p) => !isVideoMedia(p.media, p.mediaType));
    }
    if (activeFilter === "videos") {
      return posts.filter((p) => isVideoMedia(p.media, p.mediaType));
    }
    return posts;
  }, [posts, activeFilter]);

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFAFA] pb-16 md:pb-10 pt-4 md:pt-6">
      <div className="max-w-[960px] mx-auto px-2 sm:px-4">
        {/* Search Bar Section */}
        <div ref={searchContainerRef} className="relative max-w-xl mx-auto mb-6 z-30">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400 pointer-events-none flex items-center">
              <IoSearchOutline className="text-xl" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search users..."
              className="w-full bg-[#EFEFEF] hover:bg-[#EAEAEA] focus:bg-white text-gray-900 text-sm rounded-2xl pl-12 pr-10 py-3 outline-none border border-transparent focus:border-gray-300 shadow-2xs transition-all placeholder-gray-400"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                aria-label="Clear search text"
              >
                <IoCloseCircle className="text-lg" />
              </button>
            )}
          </div>

          {/* Search Dropdown / Recent Searches */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-dropdown border border-gray-100 max-h-[380px] overflow-y-auto z-40 p-2 animate-in fade-in zoom-in-95 duration-150 scrollbar-none">
              {searchQuery.trim() ? (
                /* Live Search Results */
                <div>
                  {isSearching ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((user) => {
                        const userId = user._id || user.id;
                        const username = user.username || user.name || "user";
                        return (
                          <div
                            key={userId}
                            onClick={() => handleSelectUser(user)}
                            className="flex items-center space-x-3.5 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition"
                          >
                            <Avatar
                              src={user.profilePic}
                              alt={username}
                              gender={user.gender}
                              username={username}
                              className="w-11 h-11 rounded-full object-cover border border-gray-100 flex-shrink-0"
                            />
                            <div className="truncate leading-tight flex-1">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {username}
                              </p>
                              {user.name && (
                                <p className="text-xs text-gray-500 truncate mt-0.5 font-normal">
                                  {user.name}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-gray-400 text-sm">
                      <p className="font-medium text-gray-700">No results found.</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try searching with a different keyword.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Recent Searches */
                <div>
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-50">
                    <span className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                      Recent
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllRecent}
                        className="text-xs font-semibold text-[#0095F6] hover:text-[#1877F2] cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {recentSearches.length > 0 ? (
                    <div className="space-y-1 mt-1.5">
                      {recentSearches.map((user) => {
                        const userId = user._id || user.id;
                        const username = user.username || user.name || "user";
                        return (
                          <div
                            key={userId}
                            onClick={() => handleSelectUser(user)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition group"
                          >
                            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                              <Avatar
                                src={user.profilePic}
                                alt={username}
                                gender={user.gender}
                                username={username}
                                className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0"
                              />
                              <div className="truncate leading-tight">
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                  {username}
                                </p>
                                {user.name && (
                                  <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {user.name}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleRemoveRecent(e, userId)}
                              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full transition cursor-pointer"
                              aria-label={`Remove ${username} from recent`}
                            >
                              <IoClose className="text-base" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-xs font-medium">
                      No recent searches.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-black text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("photos")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeFilter === "photos"
                ? "bg-black text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Photos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("videos")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeFilter === "videos"
                ? "bg-black text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Reels & Videos
          </button>
        </div>

        {/* Explore Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-200 animate-pulse rounded-sm md:rounded-lg"
              />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {filteredPosts.map((post) => {
              const isVideo = isVideoMedia(post.media, post.mediaType);
              const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
              const commentsCount = Array.isArray(post.comments)
                ? post.comments.length
                : 0;

              return (
                <div
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="relative group aspect-square bg-black cursor-pointer overflow-hidden rounded-xs md:rounded-lg"
                >
                  {isVideo ? (
                    <video
                      src={post.media}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={post.media}
                      alt="Explore media"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Media Type Icon in top-right */}
                  <div className="absolute top-2 right-2 text-white drop-shadow-md z-10">
                    {isVideo ? (
                      <IoFilmOutline className="text-lg" />
                    ) : (
                      post.tags &&
                      post.tags.length > 0 && (
                        <IoImagesOutline className="text-base opacity-90" />
                      )
                    )}
                  </div>

                  {/* Dark hover overlay with like & comment counts */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-6 text-white font-bold text-sm z-20">
                    <div className="flex items-center space-x-1.5">
                      <IoHeartSharp className="text-xl text-white" />
                      <span>{likesCount}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <IoChatbubbleSharp className="text-lg text-white" />
                      <span>{commentsCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <IoSearchOutline className="text-3xl" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Posts Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {activeFilter !== "all"
                ? `No ${activeFilter} found in the explore feed right now.`
                : "Explore feed is currently empty. Create a post to get started!"}
            </p>
          </div>
        )}
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

export default ExplorePage;
