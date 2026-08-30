import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import {
  IoPaperPlaneOutline,
  IoPaperPlaneSharp,
  IoSearchOutline,
  IoImageOutline,
  IoClose,
  IoInformationCircleOutline,
  IoChevronBack,
  IoChevronDown,
  IoTrashOutline,
  IoHeartOutline,
  IoHeartSharp,
  IoCallOutline,
  IoVideocamOutline,
} from "react-icons/io5";
import { RiEditBoxLine } from "react-icons/ri";
import { BsEmojiSmile } from "react-icons/bs";
import Avatar from "../../components/common/Avatar";
import EmojiDrawer from "../../components/common/EmojiDrawer";
import StoryViewerModal from "../../components/story/StoryViewerModal";
import { usersSelector } from "../../redux/slices/usersSlice";
import {
  fetchConversationsAsync,
  getOrCreateConversationAsync,
  fetchMessagesAsync,
  sendMessageAsync,
  markSeenAsync,
  deleteMessageAsync,
  setActiveConversation,
  chatSelector,
} from "../../redux/slices/chatSlice";
import { storiesSelector } from "../../redux/slices/storiesSlice";
import { userService } from "../../services";
import { formatTimeAgo } from "../../utils";
import toast from "react-hot-toast";

export function DirectMessagesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId, userId: routeUserId } = useParams();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("user") || routeUserId;

  const { signedUser, userId: currentUserId } = useSelector(usersSelector);
  const {
    conversations = [],
    activeConversation,
    messages = [],
    loadingConversations,
    loadingMessages,
    sendingMessage,
  } = useSelector(chatSelector);
  const { feedStories = [] } = useSelector(storiesSelector);

  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("primary"); // "primary" | "general"

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const prevChatIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const pollingRef = useRef(null);

  // Load user conversations on mount
  useEffect(() => {
    dispatch(fetchConversationsAsync());
  }, [dispatch]);

  // Handle chatId / targetUserId routing changes
  useEffect(() => {
    if (chatId && chatId !== "inbox") {
      const existing = conversations.find((c) => c._id === chatId);
      if (existing) {
        dispatch(setActiveConversation(existing));
        dispatch(fetchMessagesAsync(existing._id));
      } else {
        dispatch(fetchMessagesAsync(chatId)).then((res) => {
          if (res.payload?.messages) {
            const found = conversations.find((c) => c._id === chatId);
            if (found) {
              dispatch(setActiveConversation(found));
            } else {
              dispatch(setActiveConversation({ _id: chatId }));
            }
          }
        });
      }
    } else if (targetUserId && targetUserId !== currentUserId) {
      dispatch(getOrCreateConversationAsync(targetUserId)).then((res) => {
        if (res.payload?._id) {
          dispatch(setActiveConversation(res.payload));
          dispatch(fetchMessagesAsync(res.payload._id));
          navigate(`/messages/${res.payload._id}`, { replace: true });
        }
      });
    } else {
      // Direct /messages route with no active chat selected
      dispatch(setActiveConversation(null));
    }
  }, [chatId, targetUserId, currentUserId, dispatch, navigate]);

  // Sync conversation details once conversations list arrives if activeConversation is partial
  useEffect(() => {
    if (chatId && chatId !== "inbox" && conversations.length > 0) {
      const existing = conversations.find((c) => c._id === chatId);
      if (existing && (!activeConversation?.participant || activeConversation._id !== existing._id)) {
        dispatch(setActiveConversation(existing));
      }
    }
  }, [chatId, conversations, activeConversation, dispatch]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation?._id) {
      dispatch(fetchMessagesAsync(activeConversation._id));
      dispatch(markSeenAsync(activeConversation._id));
    }
  }, [dispatch, activeConversation?._id]);

  // Periodic polling for fresh messages in active conversation
  useEffect(() => {
    if (activeConversation?._id) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        dispatch(fetchMessagesAsync(activeConversation._id));
        dispatch(fetchConversationsAsync());
      }, 4000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [dispatch, activeConversation?._id]);

  // Handle scroll position to prevent jumping when user scrolls up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
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

  // Smart scroll: scroll down on opening new chat or when user is already at the bottom
  useEffect(() => {
    if (!activeConversation?._id) {
      prevChatIdRef.current = null;
      prevMessagesLengthRef.current = 0;
      return;
    }

    const isNewChat = prevChatIdRef.current !== activeConversation._id;
    const hasNewMessage = messages.length > prevMessagesLengthRef.current;

    if (isNewChat) {
      prevChatIdRef.current = activeConversation._id;
      isNearBottomRef.current = true;
      setTimeout(() => scrollToBottom("auto"), 60);
    } else if (hasNewMessage && isNearBottomRef.current) {
      scrollToBottom("smooth");
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, activeConversation?._id, scrollToBottom]);

  // File selection
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
    if ((!textContent && !selectedFile) || sendingMessage) return;

    const recipient = activeConversation?.participant;
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

    const currentText = messageText;
    setMessageText("");
    handleRemoveFile();
    setShowEmoji(false);

    try {
      await dispatch(sendMessageAsync(formData)).unwrap();
      dispatch(fetchConversationsAsync());
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      setMessageText(currentText);
    }
  };

  // Send heart reaction message (like official Instagram Direct)
  const handleSendHeart = () => {
    handleSendMessage("❤️");
  };

  const handleUnsendMessage = async (messageId) => {
    if (window.confirm("Unsend this message?")) {
      try {
        await dispatch(deleteMessageAsync(messageId)).unwrap();
        dispatch(fetchConversationsAsync());
      } catch (err) {
        console.error("Failed to unsend message:", err);
      }
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.participant?.name || "";
    const uname = conv.participant?.username || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeParticipant =
    activeConversation?.participant ||
    activeConversation?.participants?.find(
      (p) => (p?._id || p)?.toString() !== currentUserId?.toString()
    ) ||
    activeConversation?.participants?.[0] ||
    null;
  const activeUsername =
    activeParticipant?.username || activeParticipant?.name || "User";

  // Check if active participant has active stories
  const activeStoryGroupItem = feedStories.find(
    (g) =>
      (g.user?._id || g.user?.id)?.toString() ===
      (activeParticipant?._id || activeParticipant?.id)?.toString()
  );
  const activeParticipantHasStory = Boolean(
    activeStoryGroupItem &&
      activeStoryGroupItem.stories &&
      activeStoryGroupItem.stories.length > 0
  );

  return (
    <div className="w-full h-full h-screen max-h-screen bg-white flex overflow-hidden select-none">
      {/* ========================================================
          LEFT COLUMN: Conversations Sidebar (Instagram Direct Inbox)
         ======================================================== */}
      <div
        className={`w-full md:w-[350px] lg:w-[390px] border-r border-gray-200 flex flex-col bg-white flex-shrink-0 h-full ${
          activeConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Left Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center space-x-1.5 cursor-pointer">
            <h1 className="font-bold text-xl text-gray-900 truncate">
              {signedUser?.username || "messages"}
            </h1>
            <IoChevronDown className="text-sm text-gray-600" />
          </div>

          <button
            type="button"
            onClick={() => setShowNewChatModal(true)}
            className="p-1.5 text-gray-900 hover:text-gray-600 rounded-full transition cursor-pointer"
            title="New message"
            aria-label="New message"
          >
            <RiEditBoxLine className="text-2xl" />
          </button>
        </div>

        {/* Notes Row (Instagram Direct Notes Bar) */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center space-x-4 overflow-x-auto scrollbar-none">
          {/* Current user note */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="relative mb-1">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200">
                <Avatar
                  src={signedUser?.profilePic}
                  alt={signedUser?.username}
                  gender={signedUser?.gender}
                  username={signedUser?.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-gray-100 text-[10px] text-gray-500 font-medium px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs whitespace-nowrap">
                + Note...
              </span>
            </div>
            <span className="text-[11px] text-gray-500 truncate max-w-[60px]">
              Your note
            </span>
          </div>

          {/* Friends notes preview */}
          {feedStories.slice(0, 4).map((storyGroup) => {
            const u = storyGroup.user;
            const uname = u?.username || "friend";
            return (
              <div
                key={u?._id || uname}
                onClick={() => setActiveStoryGroup(storyGroup)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                <div className="relative mb-1">
                  <div className="w-14 h-14 rounded-full p-[2px] ig-story-ring flex-shrink-0">
                    <Avatar
                      src={u?.profilePic}
                      alt={uname}
                      gender={u?.gender}
                      username={uname}
                      className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-gray-700 truncate max-w-[60px]">
                  {uname}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tab Selection: Messages / Requests */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 text-xs font-semibold">
          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={() => setActiveTab("primary")}
              className={`pb-1 transition cursor-pointer ${
                activeTab === "primary"
                  ? "text-gray-900 border-b-2 border-black"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Messages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`pb-1 transition cursor-pointer ${
                activeTab === "general"
                  ? "text-gray-900 border-b-2 border-black"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Requests
            </button>
          </div>
        </div>

        {/* Search Conversations Input */}
        <div className="px-4 py-2">
          <div className="flex items-center bg-[#EFEFEF] rounded-xl px-3.5 py-2 text-gray-500 focus-within:ring-1 focus-within:ring-gray-300 transition">
            <IoSearchOutline className="text-base mr-2 flex-shrink-0 text-gray-400" />
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
                className="text-gray-400 hover:text-gray-700"
              >
                <IoClose className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-none">
          {loadingConversations && conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Loading messages...
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const participant = conv.participant;
              const isSelected = activeConversation?._id === conv._id;
              const uname = participant?.username || participant?.name || "User";
              const lastMsgText = conv.lastMessage?.text || "Started a chat";
              const hasUnread = (conv.unreadCount || 0) > 0;

              // Check if participant has active stories
              const partStoryGroup = feedStories.find(
                (g) =>
                  (g.user?._id || g.user?.id)?.toString() ===
                  (participant?._id || participant?.id)?.toString()
              );
              const hasStory = Boolean(
                partStoryGroup &&
                  partStoryGroup.stories &&
                  partStoryGroup.stories.length > 0
              );

              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    dispatch(setActiveConversation(conv));
                    dispatch(markSeenAsync(conv._id));
                    navigate(`/messages/${conv._id}`);
                  }}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAFA] transition cursor-pointer ${
                    isSelected ? "bg-[#EFEFEF]/80" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    {/* Participant Avatar */}
                    {hasStory ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStoryGroup(partStoryGroup);
                        }}
                        className="w-14 h-14 rounded-full p-[2px] ig-story-ring flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <Avatar
                          src={participant?.profilePic}
                          alt={uname}
                          gender={participant?.gender}
                          username={uname}
                          className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                        <Avatar
                          src={participant?.profilePic}
                          alt={uname}
                          gender={participant?.gender}
                          username={uname}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    )}

                    {/* Participant Info & Last Message */}
                    <div className="flex flex-col min-w-0 flex-1 leading-snug">
                      <span
                        className={`text-sm truncate ${
                          hasUnread
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-900"
                        }`}
                      >
                        {uname}
                      </span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span
                          className={`text-xs truncate max-w-[170px] ${
                            hasUnread
                              ? "font-semibold text-black"
                              : "text-gray-500"
                          }`}
                        >
                          {lastMsgText}
                        </span>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                          • {formatTimeAgo(conv.updatedAt || conv.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unread blue dot */}
                  {hasUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0095F6] ml-2 flex-shrink-0" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: Active Chat Feed or Instagram Empty State
         ======================================================== */}
      <div
        className={`flex-1 flex flex-col bg-white overflow-hidden h-full ${
          activeConversation ? "flex" : "hidden md:flex"
        }`}
      >
        {activeConversation ? (
          /* Active Chat View */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3.5">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setActiveConversation(null));
                    navigate("/messages");
                  }}
                  className="md:hidden p-1 text-gray-800 hover:text-black mr-1 cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <IoChevronBack className="text-2xl" />
                </button>

                {/* Recipient Avatar */}
                {activeParticipantHasStory ? (
                  <div
                    onClick={() => setActiveStoryGroup(activeStoryGroupItem)}
                    className="w-11 h-11 rounded-full p-[2px] ig-story-ring flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    title={`View ${activeUsername}'s story`}
                  >
                    <Avatar
                      src={activeParticipant?.profilePic}
                      alt={activeUsername}
                      gender={activeParticipant?.gender}
                      username={activeUsername}
                      className="w-full h-full rounded-full object-cover border border-white bg-white"
                    />
                  </div>
                ) : (
                  <Link
                    to={`/profile/${activeParticipant?._id || ""}`}
                    className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                  >
                    <Avatar
                      src={activeParticipant?.profilePic}
                      alt={activeUsername}
                      gender={activeParticipant?.gender}
                      username={activeUsername}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </Link>
                )}

                {/* Recipient Name & Active Status */}
                <Link
                  to={`/profile/${activeParticipant?._id || ""}`}
                  className="flex flex-col min-w-0"
                >
                  <span className="font-bold text-sm text-gray-900 hover:underline truncate">
                    {activeUsername}
                  </span>
                  <span className="text-[11px] text-gray-400 truncate">
                    {activeParticipant?.name || "Active now"}
                  </span>
                </Link>
              </div>

              {/* Header Right Action Icons */}
              <div className="flex items-center space-x-3 text-gray-800">
                <button
                  type="button"
                  onClick={() => toast("Audio calling coming soon!", { icon: "📞" })}
                  className="p-2 hover:text-gray-500 rounded-full transition cursor-pointer"
                  title="Audio call"
                >
                  <IoCallOutline className="text-2xl" />
                </button>
                <button
                  type="button"
                  onClick={() => toast("Video calling coming soon!", { icon: "📹" })}
                  className="p-2 hover:text-gray-500 rounded-full transition cursor-pointer"
                  title="Video call"
                >
                  <IoVideocamOutline className="text-2xl" />
                </button>
                <Link
                  to={`/profile/${activeParticipant?._id || ""}`}
                  className="p-2 hover:text-gray-500 rounded-full transition"
                  title="Details"
                >
                  <IoInformationCircleOutline className="text-2xl" />
                </Link>
              </div>
            </div>

            {/* Messages Feed Stream */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-white scrollbar-none flex flex-col"
            >
              {/* Profile Card Banner at top of chat */}
              <div className="py-8 flex flex-col items-center text-center border-b border-gray-100 mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                  <Avatar
                    src={activeParticipant?.profilePic}
                    alt={activeUsername}
                    gender={activeParticipant?.gender}
                    username={activeUsername}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {activeParticipant?.name || activeUsername}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeUsername} • Instagram
                </p>
                <Link
                  to={`/profile/${activeParticipant?._id || ""}`}
                  className="mt-4 bg-[#EFEFEF] hover:bg-[#DBDBDB] text-gray-900 font-semibold text-xs px-4 py-1.5 rounded-lg transition"
                >
                  View profile
                </Link>
              </div>

              {loadingMessages && messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  Loading conversation history...
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isMine =
                    (msg.sender?._id || msg.sender)?.toString() ===
                    currentUserId?.toString();
                  const isLatestSent =
                    isMine && index === messages.length - 1;

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col group ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`relative flex items-center space-x-1.5 max-w-[75%] sm:max-w-[65%] ${
                          isMine ? "flex-row-reverse space-x-reverse" : "flex-row"
                        }`}
                      >
                        {/* Message Bubble with Official Instagram Styling */}
                        <div
                          className={`px-4 py-2.5 text-sm leading-relaxed break-words shadow-2xs ${
                            isMine
                              ? "bg-gradient-to-r from-[#7000FF] via-[#A800E0] to-[#E1306C] text-white rounded-[22px] rounded-br-[4px]"
                              : "bg-[#EFEFEF] text-gray-900 rounded-[22px] rounded-bl-[4px]"
                          }`}
                        >
                          {/* Media preview */}
                          {msg.media && (
                            <div className="mb-2 rounded-xl overflow-hidden max-w-[280px]">
                              {msg.mediaType === "video" ? (
                                <video
                                  src={msg.media}
                                  controls
                                  className="w-full rounded-xl object-cover"
                                />
                              ) : (
                                <img
                                  src={msg.media}
                                  alt="Attachment"
                                  className="w-full rounded-xl object-cover"
                                />
                              )}
                            </div>
                          )}

                          {msg.text && (
                            <p className={msg.text === "❤️" ? "text-3xl py-1" : ""}>
                              {msg.text}
                            </p>
                          )}
                        </div>

                        {/* Unsend Action on hover for My Messages */}
                        {isMine && (
                          <button
                            type="button"
                            onClick={() => handleUnsendMessage(msg._id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer"
                            title="Unsend message"
                          >
                            <IoTrashOutline className="text-base" />
                          </button>
                        )}
                      </div>

                      {/* Timestamp & Read Receipt */}
                      <div
                        className={`text-[10px] text-gray-400 mt-1 flex items-center space-x-1 ${
                          isMine ? "pr-1" : "pl-1"
                        }`}
                      >
                        <span>{formatTimeAgo(msg.createdAt)}</span>
                        {isLatestSent && msg.seen && (
                          <span className="text-gray-500 font-medium ml-1">
                            • Seen
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  No messages yet. Send a message to start chatting!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Media Attachment Live Preview Bar */}
            {filePreview && (
              <div className="px-5 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  />
                  <span className="text-xs text-gray-600 truncate max-w-[200px]">
                    {selectedFile?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-gray-700 p-1"
                >
                  <IoClose className="text-lg" />
                </button>
              </div>
            )}

            {/* Instagram Rounded-Pill Message Input Bar */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative border border-[#DBDBDB] rounded-full px-4 py-2.5 flex items-center space-x-3 focus-within:border-gray-400 transition"
              >
                {/* Emoji Picker Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmoji((prev) => !prev);
                  }}
                  className="text-gray-800 hover:text-black text-2xl cursor-pointer transition active:scale-90 flex-shrink-0"
                  title="Add emoji"
                >
                  <BsEmojiSmile />
                </button>

                {/* Message Text Input */}
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-500"
                />

                {/* Media File Attachment Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {messageText.trim() || selectedFile ? (
                  /* Send Button */
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="text-[#0095F6] hover:text-[#1877F2] font-semibold text-sm cursor-pointer transition disabled:opacity-50 flex-shrink-0 px-1"
                  >
                    {sendingMessage ? "..." : "Send"}
                  </button>
                ) : (
                  /* Photo & Instant Heart Buttons when empty */
                  <div className="flex items-center space-x-3 flex-shrink-0 text-gray-800">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:text-black text-2xl cursor-pointer transition active:scale-90"
                      title="Attach photo or video"
                    >
                      <IoImageOutline />
                    </button>
                    <button
                      type="button"
                      onClick={handleSendHeart}
                      className="hover:text-red-500 text-2xl cursor-pointer transition active:scale-125"
                      title="Send heart"
                    >
                      <IoHeartOutline />
                    </button>
                  </div>
                )}

                {/* Emoji Drawer */}
                <EmojiDrawer
                  isOpen={showEmoji}
                  onClose={() => setShowEmoji(false)}
                  onEmojiSelect={(emoji) => {
                    setMessageText((prev) => prev + emoji);
                    messageInputRef.current?.focus();
                  }}
                  position="top-left"
                  width={300}
                  height={340}
                />
              </form>
            </div>
          </div>
        ) : (
          /* Empty State: No Chat Selected (Matching Official Instagram Direct) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-24 h-24 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
              <IoPaperPlaneOutline className="text-5xl text-gray-900 translate-x-1 -translate-y-0.5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your messages</h2>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Send private photos and messages to a friend or group.
            </p>
            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-sm px-5 py-2 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
            >
              Send message
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onSelectUser={(selectedUser) => {
            setShowNewChatModal(false);
            const uid = selectedUser?._id || selectedUser?.id;
            if (uid) {
              dispatch(getOrCreateConversationAsync(uid)).then(
                (res) => {
                  if (res.payload?._id) {
                    dispatch(setActiveConversation(res.payload));
                    dispatch(fetchMessagesAsync(res.payload._id));
                    navigate(`/messages/${res.payload._id}`);
                  }
                }
              );
            }
          }}
        />
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
    </div>
  );
}

// Sub-component: New Chat User Picker Modal (Instagram style)
function NewChatModal({ onClose, onSelectUser }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(true);
      userService
        .getSuggestedUsers()
        .then((res) => {
          setResults(res.data?.users || res.data || []);
        })
        .catch((err) => console.error("Suggested users error:", err))
        .finally(() => setLoading(false));
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await userService.searchUsers(query.trim());
        setResults(res.data?.users || res.data || []);
      } catch (err) {
        console.error("Search users error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[420px] max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="w-6" />
          <h3 className="font-bold text-base text-gray-900">New message</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-black p-1"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* To Search Input */}
        <div className="flex items-center px-5 py-3.5 border-b border-gray-100 space-x-3">
          <span className="font-bold text-sm text-gray-900">To:</span>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-gray-900 outline-none placeholder-gray-400"
            autoFocus
          />
        </div>

        {/* User Search Results */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-gray-50 max-h-[50vh]">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((u) => {
              const uname = u.username || u.name || "user";
              return (
                <div
                  key={u._id}
                  onClick={() => onSelectUser(u)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <Avatar
                      src={u.profilePic}
                      alt={uname}
                      gender={u.gender}
                      username={uname}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {uname}
                      </span>
                      {u.name && (
                        <span className="text-xs text-gray-400 truncate">
                          {u.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-2xs"
                  >
                    Chat
                  </button>
                </div>
              );
            })
          ) : query ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No account found.
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">
              No account selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectMessagesPage;
