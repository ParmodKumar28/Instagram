import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoSearchOutline, IoClose, IoCloseCircle } from "react-icons/io5";
import Avatar from "../common/Avatar";
import { userService } from "../../services";

const RECENT_SEARCHES_KEY = "insta_recent_searches";

export function SearchDrawer({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Autofocus input on drawer open & clear query
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 150);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
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
        setIsLoading(false);
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
    onClose();
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 w-full sm:w-[400px] md:left-[84px] bg-white z-50 shadow-2xl flex flex-col border-r border-gray-200 animate-in slide-in-from-left duration-250 select-none">
        {/* Header & Search Input Box */}
        <div className="pt-6 pb-4 px-6 border-b border-gray-100 flex flex-col space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Search
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black p-1 text-2xl rounded-full hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close search"
            >
              <IoClose />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              <IoSearchOutline className="text-lg" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#EFEFEF] hover:bg-[#EAEAEA] focus:bg-white text-gray-900 text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none border border-transparent focus:border-gray-300 transition-all"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                aria-label="Clear search text"
              >
                <IoCloseCircle className="text-base" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-none">
          {searchQuery.trim() ? (
            /* Search Results */
            <div>
              {isLoading ? (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3.5 p-2 animate-pulse"
                    >
                      <div className="w-11 h-11 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="w-28 h-3.5 bg-gray-200 rounded" />
                        <div className="w-20 h-3 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))}
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
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition active:bg-gray-100"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                          <Avatar
                            src={user.profilePic}
                            alt={username}
                            gender={user.gender}
                            username={username}
                            className="w-11 h-11 rounded-full object-cover border border-gray-100 flex-shrink-0"
                          />
                          <div className="truncate leading-tight">
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
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-gray-400 text-sm">
                  <p className="font-medium text-gray-700">No results found.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try searching for another username or name.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Recent Searches Section */
            <div>
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <span className="font-bold text-sm text-gray-900">Recent</span>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllRecent}
                    className="text-xs font-semibold text-[#0095F6] hover:text-[#1877F2] cursor-pointer transition"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {recentSearches.length > 0 ? (
                <div className="space-y-1">
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
                            className="w-11 h-11 rounded-full object-cover border border-gray-100 flex-shrink-0"
                          />
                          <div className="truncate leading-tight">
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

                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecent(e, userId)}
                          className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full transition cursor-pointer"
                          aria-label={`Remove ${username} from recent searches`}
                        >
                          <IoClose className="text-base" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 text-center text-gray-400 text-sm">
                  <p className="font-semibold text-gray-500">No recent searches.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchDrawer;
