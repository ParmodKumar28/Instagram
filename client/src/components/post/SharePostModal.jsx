import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  IoClose,
  IoSearchOutline,
  IoLinkOutline,
  IoShareSocialOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import Avatar from "../common/Avatar";
import { usersSelector } from "../../redux/slices/usersSlice";
import {
  chatSelector,
  fetchConversationsAsync,
  sendMessageAsync,
} from "../../redux/slices/chatSlice";
import { userService, followerService } from "../../services";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";

export function SharePostModal({ post, isOpen, onClose }) {
  const dispatch = useDispatch();
  const { signedUser, userId: currentUserId } = useSelector(usersSelector);
  const { conversations = [] } = useSelector(chatSelector);
  const { isOnline } = useSocket();

  const [followingUsers, setFollowingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load conversations and following list on open
  useEffect(() => {
    if (!isOpen) return;

    if (conversations.length === 0) {
      dispatch(fetchConversationsAsync());
    }

    const loadFollowing = async () => {
      const uId = currentUserId || signedUser?._id;
      if (!uId) return;
      try {
        const res = await followerService.getFollowing(uId);
        const list = res.data?.following || [];
        const extracted = list
          .map((item) => item.following || item.user || item)
          .filter(Boolean);
        setFollowingUsers(extracted);
      } catch (err) {
        console.error("Failed to load following list:", err);
      }
    };

    loadFollowing();
  }, [isOpen, dispatch, currentUserId, signedUser?._id, conversations.length]);

  // Combined default contacts: recent conversation partners + followed users
  const defaultUsers = useMemo(() => {
    const list = [];
    const seenIds = new Set();
    const myIdStr = (currentUserId || signedUser?._id)?.toString();

    // 1. Add recent conversation partners first
    conversations.forEach((conv) => {
      const part = conv.participant;
      const id = (part?._id || part?.id)?.toString();
      if (id && id !== myIdStr && !seenIds.has(id)) {
        seenIds.add(id);
        list.push(part);
      }
    });

    // 2. Add following users who are not already added
    followingUsers.forEach((u) => {
      const id = (u._id || u.id)?.toString();
      if (id && id !== myIdStr && !seenIds.has(id)) {
        seenIds.add(id);
        list.push(u);
      }
    });

    return list;
  }, [conversations, followingUsers, currentUserId, signedUser?._id]);

  // Live search users when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(searchQuery);
        if (res?.data?.users) {
          const myIdStr = (currentUserId || signedUser?._id)?.toString();
          const filtered = res.data.users.filter(
            (u) => (u._id || u.id)?.toString() !== myIdStr
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Failed to search users:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, signedUser?._id]);

  if (!isOpen || !post) return null;

  const displayUsers = searchQuery.trim() ? searchResults : defaultUsers;
  const postUrl = `${window.location.origin}/post/${post._id}`;

  const toggleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post?.user?.username || "Instagram Clone user"}`,
          text: post?.caption || "Check out this post on Instagram Clone!",
          url: postUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSend = async () => {
    if (selectedUserIds.length === 0 || isSending) return;
    setIsSending(true);

    const shareText = customMessage.trim()
      ? `${customMessage.trim()}\n${postUrl}`
      : postUrl;

    try {
      let sentCount = 0;
      for (const recipientId of selectedUserIds) {
        const formData = new FormData();
        formData.append("recipientId", recipientId);
        formData.append("text", shareText);

        const res = await dispatch(sendMessageAsync(formData)).unwrap();
        if (res?.message) {
          sentCount++;
        }
      }

      if (sentCount > 0) {
        toast.success(
          `Shared with ${sentCount} ${sentCount === 1 ? "person" : "people"}`
        );
        setSelectedUserIds([]);
        setCustomMessage("");
        onClose();
      }
    } catch (err) {
      console.error("Failed to share post:", err);
      toast.error(typeof err === "string" ? err : "Failed to send post");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-8" />
          <h2 className="text-base font-semibold text-gray-900">Share</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center bg-[#EFEFEF] rounded-xl px-3 py-2 text-sm text-gray-900 focus-within:ring-1 focus-within:ring-gray-300">
            <IoSearchOutline className="text-gray-500 text-lg mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-black text-xs ml-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-transparent min-h-[220px] max-h-[340px]">
          {displayUsers.length > 0 ? (
            displayUsers.map((user) => {
              const uId = (user._id || user.id)?.toString();
              if (!uId) return null;
              const isSelected = selectedUserIds.includes(uId);
              const uname = user.username || user.name || "User";
              const userOnline = isOnline(uId);

              return (
                <div
                  key={uId}
                  onClick={() => toggleSelectUser(uId)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={user.profilePic}
                        username={uname}
                        gender={user.gender}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200"
                      />
                      {userOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {uname}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {user.name || `@${uname}`}
                      </span>
                    </div>
                  </div>

                  {/* Selection Checkbox Pill */}
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#0095F6] border-[#0095F6] text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">
              {searchQuery ? "No accounts found" : "No recent contacts"}
            </div>
          )}
        </div>

        {/* Message Input when 1+ users selected */}
        {selectedUserIds.length > 0 && (
          <div className="px-3 pt-2 pb-1 border-t border-gray-100 bg-gray-50">
            <input
              type="text"
              placeholder="Write a message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-400"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
          {selectedUserIds.length > 0 ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="w-full py-2.5 bg-[#0095F6] hover:bg-[#1877F2] active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition duration-150 shadow-sm flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              {isSending ? "Sending..." : `Send (${selectedUserIds.length})`}
            </button>
          ) : (
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-800 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <IoCheckmarkCircle className="text-base text-green-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <IoLinkOutline className="text-base text-gray-700" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-800 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                <IoShareSocialOutline className="text-base text-gray-700" />
                <span>Share via...</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SharePostModal;
