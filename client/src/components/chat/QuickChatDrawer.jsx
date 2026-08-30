import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  IoPaperPlaneOutline,
  IoPaperPlaneSharp,
  IoClose,
  IoChevronBack,
  IoChevronDown,
  IoChevronUp,
  IoSearchOutline,
  IoHeartOutline,
  IoImageOutline,
} from "react-icons/io5";
import { FiMaximize2 } from "react-icons/fi";
import { PiPaperPlaneTiltFill } from "react-icons/pi";
import { RiEditBoxLine } from "react-icons/ri";
import { BsEmojiSmile } from "react-icons/bs";
import Avatar from "../common/Avatar";
import EmojiDrawer from "../common/EmojiDrawer";
import StoryViewerModal from "../story/StoryViewerModal";
import { usersSelector } from "../../redux/slices/usersSlice";
import {
  fetchConversationsAsync,
  getOrCreateConversationAsync,
  fetchMessagesAsync,
  sendMessageAsync,
  markSeenAsync,
  chatSelector,
} from "../../redux/slices/chatSlice";
import { storiesSelector } from "../../redux/slices/storiesSlice";
import { userService } from "../../services";
import { formatTimeAgo } from "../../utils";
import toast from "react-hot-toast";

export function QuickChatDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { signedUser, userId: currentUserId } = useSelector(usersSelector);
  const {
    conversations = [],
    messages = [],
    loadingConversations,
    loadingMessages,
    sendingMessage,
  } = useSelector(chatSelector);
  const { feedStories = [] } = useSelector(storiesSelector);

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const prevChatIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);

  // Total unread count across conversations
  const totalUnreadCount = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0
  );

  // Fetch conversations on mount & when expanded
  useEffect(() => {
    dispatch(fetchConversationsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (isExpanded) {
      dispatch(fetchConversationsAsync());
    }
  }, [isExpanded, dispatch]);

  // Load messages when selectedChat changes
  useEffect(() => {
    if (selectedChat?._id && isExpanded) {
      dispatch(fetchMessagesAsync(selectedChat._id));
      dispatch(markSeenAsync(selectedChat._id));
    }
  }, [selectedChat?._id, isExpanded, dispatch]);

  // Polling while expanded
  useEffect(() => {
    if (isExpanded) {
      pollingRef.current = setInterval(() => {
        dispatch(fetchConversationsAsync());
        if (selectedChat?._id) {
          dispatch(fetchMessagesAsync(selectedChat._id));
        }
      }, 4000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isExpanded, selectedChat?._id, dispatch]);

  // Handle scroll position to avoid jumping when user has scrolled up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Considered near bottom if within 120px
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Smart scroll effect: only scroll down when opening new chat or when a new message arrives and user is near bottom
  useEffect(() => {
    if (!selectedChat?._id) {
      prevChatIdRef.current = null;
      prevMessagesLengthRef.current = 0;
      return;
    }

    const isNewChat = prevChatIdRef.current !== selectedChat._id;
    const hasNewMessage = messages.length > prevMessagesLengthRef.current;

    if (isNewChat) {
      prevChatIdRef.current = selectedChat._id;
      isNearBottomRef.current = true;
      setTimeout(() => scrollToBottom("auto"), 60);
    } else if (hasNewMessage && isNearBottomRef.current) {
      scrollToBottom("smooth");
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, selectedChat?._id, scrollToBottom]);

  // Search users for new chat
  useEffect(() => {
    if (!showNewChat) {
      setUserSearchResults([]);
      return;
    }

    if (!userSearchQuery.trim()) {
      setSearchLoading(true);
      userService
        .getSuggestedUsers()
        .then((res) => {
          setUserSearchResults(res.data?.users || res.data || []);
        })
        .catch((err) => {
          console.error("Suggested users error:", err);
        })
        .finally(() => setSearchLoading(false));
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await userService.searchUsers(userSearchQuery.trim());
        setUserSearchResults(res.data?.users || res.data || []);
      } catch (err) {
        console.error("User search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [userSearchQuery, showNewChat]);

  // File handling
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
  };

  // Send message
  const handleSendMessage = async (textToSend = null) => {
    const textContent = textToSend !== null ? textToSend : messageText.trim();
    if ((!textContent && !selectedFile) || sendingMessage || !selectedChat)
      return;

    const recipient = selectedChat.participant;
    const recipientId = recipient?._id || recipient?.id;
    if (!recipientId) return;

    const formData = new FormData();
    formData.append("recipientId", recipientId);
    if (textContent) {
      formData.append("text", textContent);
    }
    if (selectedFile) {
      formData.append("media", selectedFile);
      formData.append(
        "mediaType",
        selectedFile.type.startsWith("video") ? "video" : "image"
      );
    }

    const text = messageText;
    setMessageText("");
    handleRemoveFile();
    setShowEmoji(false);

    try {
      await dispatch(sendMessageAsync(formData)).unwrap();
      dispatch(fetchConversationsAsync());
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      setMessageText(text);
    }
  };

  const handleSendHeart = () => {
    handleSendMessage("❤️");
  };

  const handleSelectUserToChat = async (user) => {
    setShowNewChat(false);
    setUserSearchQuery("");
    const uid = user?._id || user?.id;
    if (!uid) return;
    try {
      const res = await dispatch(getOrCreateConversationAsync(uid)).unwrap();
      if (res?._id) {
        setSelectedChat(res);
        dispatch(setActiveConversation(res));
        dispatch(fetchMessagesAsync(res._id));
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const uname = conv.participant?.username || "";
    const name = conv.participant?.name || "";
    return (
      uname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const participant =
    selectedChat?.participant ||
    selectedChat?.participants?.find(
      (p) => (p?._id || p)?.toString() !== currentUserId?.toString()
    ) ||
    selectedChat?.participants?.[0] ||
    null;
  const participantName =
    participant?.username || participant?.name || "User";

  return (
    <>
      {/* ========================================================
          COLLAPSED STATE: Sleek Floating Chip / Pill Widget
         ======================================================== */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-5 right-6 sm:right-8 z-40 bg-white/95 backdrop-blur-md border border-gray-200/90 hover:border-gray-400 shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] rounded-full px-4 py-2.5 flex items-center space-x-3 cursor-pointer transition-all duration-200 select-none group active:scale-95"
          title="Open Messages"
        >
          {/* Direct Paper Airplane Icon with optional red notification dot */}
          <div className="relative flex items-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <PiPaperPlaneTiltFill className="text-sm translate-x-[0.5px] -translate-y-[0.5px]" />
            </div>
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF3040] text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-1 flex items-center justify-center ring-2 ring-white animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </div>

          <span className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight">
            Messages
          </span>

          {/* User Avatar + subtle Chevron */}
          <div className="flex items-center space-x-1.5 pl-1 border-l border-gray-200/80">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
              <Avatar
                src={signedUser?.profilePic}
                alt={signedUser?.username}
                gender={signedUser?.gender}
                username={signedUser?.username}
                className="w-full h-full object-cover"
              />
            </div>
            <IoChevronUp className="text-xs text-gray-400 group-hover:text-black transition" />
          </div>
        </div>
      )}

      {/* ========================================================
          EXPANDED STATE: Official Instagram Floating Messenger Dock
         ======================================================== */}
      {isExpanded && (
        <div className="fixed bottom-0 right-4 sm:right-10 z-40 w-[350px] sm:w-[380px] h-[520px] max-h-[82vh] bg-white rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.18)] border border-gray-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 select-none">
          {/* VIEW 1: Active Chat Inside Dock */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedChat(null)}
                    className="p-1 text-gray-700 hover:text-black rounded-full transition cursor-pointer"
                    title="Back to all messages"
                  >
                    <IoChevronBack className="text-xl" />
                  </button>

                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Avatar
                      src={participant?.profilePic}
                      alt={participantName}
                      gender={participant?.gender}
                      username={participantName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <Link
                      to={`/profile/${participant?._id || ""}`}
                      className="font-bold text-xs text-gray-900 hover:underline truncate max-w-[140px]"
                    >
                      {participantName}
                    </Link>
                    <span className="text-[10px] text-gray-400">Active</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedChat?._id) {
                        navigate(`/messages/${selectedChat._id}`);
                      } else if (participant?._id) {
                        navigate(`/messages?user=${participant._id}`);
                      } else {
                        navigate("/messages");
                      }
                      setIsExpanded(false);
                    }}
                    className="p-1.5 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    title="Open in full screen"
                  >
                    <FiMaximize2 className="text-[17px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    title="Minimize"
                  >
                    <IoChevronDown className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-white scrollbar-none flex flex-col"
              >
                {/* Mini Profile Card */}
                <div className="py-4 flex flex-col items-center text-center border-b border-gray-100 mb-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                    <Avatar
                      src={participant?.profilePic}
                      alt={participantName}
                      gender={participant?.gender}
                      username={participantName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-gray-900">
                    {participant?.name || participantName}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {participantName} • Instagram
                  </p>
                </div>

                {loadingMessages && messages.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Loading messages...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMine =
                      (msg.sender?._id || msg.sender)?.toString() ===
                      currentUserId?.toString();

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex flex-col ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`px-3.5 py-2 text-xs leading-relaxed max-w-[80%] break-words shadow-2xs ${
                            isMine
                              ? "bg-gradient-to-r from-[#7000FF] via-[#A800E0] to-[#E1306C] text-white rounded-[18px] rounded-br-[3px]"
                              : "bg-[#EFEFEF] text-gray-900 rounded-[18px] rounded-bl-[3px]"
                          }`}
                        >
                          {msg.media && (
                            <img
                              src={msg.media}
                              alt="Attachment"
                              className="mb-1 rounded-lg max-h-36 object-cover"
                            />
                          )}
                          {msg.text && (
                            <p className={msg.text === "❤️" ? "text-2xl" : ""}>
                              {msg.text}
                            </p>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                          {formatTimeAgo(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No messages yet. Say hello!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Preview Bar */}
              {filePreview && (
                <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-8 h-8 object-cover rounded-md"
                    />
                    <span className="text-xs text-gray-600 truncate max-w-[160px]">
                      {selectedFile?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-black"
                  >
                    <IoClose className="text-base" />
                  </button>
                </div>
              )}

              {/* Message Input Pill Form */}
              <div className="p-3 bg-white border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative border border-[#DBDBDB] rounded-full px-3 py-1.5 flex items-center space-x-2 focus-within:border-gray-400 transition"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEmoji((prev) => !prev);
                    }}
                    className="text-gray-800 hover:text-black text-xl cursor-pointer"
                    title="Emoji"
                  >
                    <BsEmojiSmile />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder-gray-500"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {messageText.trim() || selectedFile ? (
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="text-[#0095F6] hover:text-[#1877F2] font-semibold text-xs px-1 cursor-pointer"
                    >
                      Send
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:text-black text-xl cursor-pointer"
                        title="Photo"
                      >
                        <IoImageOutline />
                      </button>
                      <button
                        type="button"
                        onClick={handleSendHeart}
                        className="hover:text-red-500 text-xl cursor-pointer"
                        title="Heart"
                      >
                        <IoHeartOutline />
                      </button>
                    </div>
                  )}

                  <EmojiDrawer
                    isOpen={showEmoji}
                    onClose={() => setShowEmoji(false)}
                    onEmojiSelect={(emoji) => {
                      setMessageText((prev) => prev + emoji);
                      inputRef.current?.focus();
                    }}
                    position="top-left"
                    width={260}
                    height={280}
                  />
                </form>
              </div>
            </div>
          ) : (
            /* VIEW 2: Conversation List View Inside Dock */
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-1.5 cursor-pointer">
                  <h3 className="font-bold text-sm text-gray-900 truncate">
                    {signedUser?.username || "messages"}
                  </h3>
                  <IoChevronDown className="text-xs text-gray-600" />
                </div>

                <div className="flex items-center space-x-1 text-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowNewChat(true)}
                    className="p-1.5 hover:text-black rounded-full hover:bg-gray-100 transition cursor-pointer"
                    title="New Message"
                  >
                    <RiEditBoxLine className="text-xl" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/messages");
                      setIsExpanded(false);
                    }}
                    className="p-1.5 text-gray-700 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    title="Open in full screen"
                  >
                    <FiMaximize2 className="text-[17px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 text-gray-700 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    title="Minimize"
                  >
                    <IoChevronDown className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-3.5 py-2.5 border-b border-gray-100">
                <div className="flex items-center bg-[#EFEFEF] rounded-xl px-3 py-1.5 text-gray-500">
                  <IoSearchOutline className="text-sm mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-900 outline-none placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-black"
                    >
                      <IoClose className="text-xs" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conversations Feed */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-none">
                {loadingConversations && conversations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    const convPart = conv.participant;
                    const uname =
                      convPart?.username || convPart?.name || "User";
                    const lastMsg = conv.lastMessage?.text || "Started a chat";
                    const hasUnread = (conv.unreadCount || 0) > 0;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => setSelectedChat(conv)}
                        className="flex items-center justify-between px-3.5 py-3 hover:bg-[#FAFAFA] transition cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <Avatar
                              src={convPart?.profilePic}
                              alt={uname}
                              gender={convPart?.gender}
                              username={uname}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col min-w-0 flex-1 leading-snug">
                            <span
                              className={`text-xs truncate ${
                                hasUnread
                                  ? "font-bold text-gray-900"
                                  : "font-semibold text-gray-800"
                              }`}
                            >
                              {uname}
                            </span>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span
                                className={`text-[11px] truncate max-w-[150px] ${
                                  hasUnread
                                    ? "font-bold text-black"
                                    : "text-gray-500"
                                }`}
                              >
                                {lastMsg}
                              </span>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">
                                • {formatTimeAgo(conv.updatedAt || conv.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {hasUnread && (
                          <div className="w-2 h-2 rounded-full bg-[#0095F6] ml-2 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-xs text-gray-400">
                    {searchQuery ? "No chats found" : "No messages yet"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Chat Search Overlay Dialog */}
          {showNewChat && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h4 className="font-bold text-xs text-gray-900">New message</h4>
                <button
                  type="button"
                  onClick={() => setShowNewChat(false)}
                  className="text-gray-500 hover:text-black p-1"
                >
                  <IoClose className="text-xl" />
                </button>
              </div>

              <div className="p-3 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-[#EFEFEF] rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-gray-50">
                {searchLoading ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Searching...
                  </div>
                ) : userSearchResults.length > 0 ? (
                  userSearchResults.map((u) => {
                    const uname = u.username || u.name || "user";
                    return (
                      <div
                        key={u._id}
                        onClick={() => handleSelectUserToChat(u)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Avatar
                            src={u.profilePic}
                            alt={uname}
                            gender={u.gender}
                            username={uname}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-gray-900">
                            {uname}
                          </span>
                        </div>
                        <span className="text-[#0095F6] text-xs font-semibold">
                          Chat
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-gray-400">
                    {userSearchQuery ? "No user found" : "Type a username"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <StoryViewerModal
          storyGroups={[activeStoryGroup]}
          initialUserIndex={0}
          isOpen={true}
          onClose={() => setActiveStoryGroup(null)}
        />
      )}
    </>
  );
}

export default QuickChatDrawer;
