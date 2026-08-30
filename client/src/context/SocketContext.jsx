import { createContext, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usersSelector } from "../redux/slices/usersSlice";
import Avatar from "../components/common/Avatar";
import {
  addIncomingMessage,
  handleIncomingMessageDeleted,
  handleIncomingMessagesSeen,
  setOnlineUsers,
  updateUserOnlineStatus,
  setTypingStatus,
  chatSelector,
} from "../redux/slices/chatSlice";
import {
  addIncomingNotification,
  getFollowRequestsAsync,
  getActivityAsync,
} from "../redux/slices/followersSlice";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinConversationRoom,
  leaveConversationRoom,
  sendTypingNotification,
  sendStopTypingNotification,
  sendMarkSeenNotification,
} from "../services/socketService";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const dispatch = useDispatch();
  const { userId, signedUser } = useSelector(usersSelector);
  const { activeConversation, onlineUsers = [], typingUsers = {} } =
    useSelector(chatSelector);

  const activeConvIdRef = useRef(null);
  activeConvIdRef.current = activeConversation?._id;

  useEffect(() => {
    if (!userId) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(userId);
    if (!socket) return;

    // 1. New incoming message
    const handleReceiveMessage = (data) => {
      const { message, conversationId } = data || {};
      if (!message) return;

      dispatch(addIncomingMessage(message));

      // If message is not for currently open conversation, show cool Instagram toast preview
      const isCurrentChat =
        activeConvIdRef.current &&
        activeConvIdRef.current.toString() ===
          (message.conversation || conversationId)?.toString();

      const isMine =
        (message.sender?._id || message.sender)?.toString() ===
        userId?.toString();

      if (!isCurrentChat && !isMine) {
        const sender = message.sender || {};
        const senderName = sender.username || sender.name || "Someone";
        const text = message.text || (message.media ? "Sent an attachment" : "Sent a message");
        const targetChatId = message.conversation || conversationId;

        toast.custom(
          (t) => (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                if (targetChatId) {
                  window.location.href = `/messages/${targetChatId}`;
                }
              }}
              className={`${
                t.visible ? "animate-in slide-in-from-top-3 fade-in duration-200" : "animate-out fade-out duration-150"
              } max-w-sm w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-3 border border-gray-200/90 flex items-center space-x-3.5 cursor-pointer pointer-events-auto hover:bg-gray-50 transition select-none`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
                  <Avatar
                    src={sender.profilePic}
                    username={senderName}
                    gender={sender.gender}
                    className="w-full h-full rounded-full object-cover border border-white bg-white"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 text-xs">💬</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {senderName}
                </p>
                <p className="text-xs text-gray-600 truncate mt-0.5">
                  {text}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">now</span>
            </div>
          ),
          { id: `msg-${message._id || Date.now()}`, duration: 4000, position: "top-right" }
        );
      }
    };

    // 2. Outgoing message echo (across other tabs of current user)
    const handleMessageSent = (data) => {
      const { message } = data || {};
      if (message) {
        dispatch(addIncomingMessage(message));
      }
    };

    // 3. Message seen receipt
    const handleMessagesSeen = (data) => {
      const { conversationId } = data || {};
      if (conversationId) {
        dispatch(handleIncomingMessagesSeen({ conversationId }));
      }
    };

    // 4. Message unsent / deleted
    const handleMessageDeleted = (data) => {
      const { messageId, conversationId } = data || {};
      if (messageId) {
        dispatch(handleIncomingMessageDeleted({ messageId, conversationId }));
      }
    };

    // 5. Typing indicator
    const handleUserTyping = (data) => {
      const { conversationId, senderId, username } = data || {};
      if (conversationId && senderId !== userId) {
        dispatch(
          setTypingStatus({
            conversationId,
            senderId,
            username,
            isTyping: true,
          })
        );
      }
    };

    const handleUserStopTyping = (data) => {
      const { conversationId, senderId } = data || {};
      if (conversationId) {
        dispatch(
          setTypingStatus({
            conversationId,
            senderId,
            isTyping: false,
          })
        );
      }
    };

    // 6. Online presence
    const handleOnlineUsersList = (data) => {
      if (data?.onlineUsers) {
        dispatch(setOnlineUsers(data.onlineUsers));
      }
    };

    const handleUserStatusChanged = (data) => {
      if (data) {
        dispatch(updateUserOnlineStatus(data));
      }
    };

    // 7. Live Notification (Likes, Comments, Follows, Stories, etc.)
    const handleNewNotification = (notification) => {
      if (notification) {
        dispatch(addIncomingNotification(notification));
        dispatch(getFollowRequestsAsync());
        dispatch(getActivityAsync());

        const sender = notification.sender || {};
        const senderName = sender.username || sender.name || "Instagram user";
        let actionText = notification.message || "interacted with you.";

        if (notification.type === "like") {
          actionText = "liked your post.";
        } else if (notification.type === "story_like") {
          actionText = "liked your story.";
        } else if (notification.type === "comment") {
          actionText = "commented on your post.";
        } else if (notification.type === "story_reply") {
          actionText = "replied to your story.";
        } else if (notification.type === "accept_request") {
          actionText = "accepted your follow request.";
        } else if (notification.type === "follow") {
          actionText = "started following you.";
        }

        toast.custom(
          (t) => (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                if (notification.postId) {
                  window.location.href = `/post/${notification.postId}`;
                } else if (sender._id) {
                  window.location.href = `/profile/${sender._id}`;
                }
              }}
              className={`${
                t.visible ? "animate-in slide-in-from-top-3 fade-in duration-200" : "animate-out fade-out duration-150"
              } max-w-sm w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-3 border border-gray-200/90 flex items-center space-x-3.5 cursor-pointer pointer-events-auto hover:bg-gray-50 transition select-none`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
                  <Avatar
                    src={sender.profilePic}
                    username={senderName}
                    gender={sender.gender}
                    className="w-full h-full rounded-full object-cover border border-white bg-white"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 text-xs">
                  {notification.type?.includes("like")
                    ? "❤️"
                    : notification.type?.includes("comment") || notification.type?.includes("reply")
                    ? "💬"
                    : "👤"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 leading-snug">
                  <span className="font-bold mr-1">{senderName}</span>
                  <span className="text-gray-600">{actionText}</span>
                </p>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">now</span>
            </div>
          ),
          { id: `notif-${Date.now()}`, duration: 4500, position: "top-right" }
        );
      }
    };

    // Register all event listeners
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("messages_seen", handleMessagesSeen);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("online_users_list", handleOnlineUsersList);
    socket.on("user_status_changed", handleUserStatusChanged);
    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("messages_seen", handleMessagesSeen);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("online_users_list", handleOnlineUsersList);
      socket.off("user_status_changed", handleUserStatusChanged);
      socket.off("new_notification", handleNewNotification);
    };
  }, [userId, dispatch]);

  const isOnline = (checkUserId) => {
    if (!checkUserId) return false;
    const uid = (checkUserId?._id || checkUserId)?.toString();
    return onlineUsers.some((id) => id?.toString() === uid);
  };

  const value = {
    socket: getSocket(),
    onlineUsers,
    isOnline,
    typingUsers,
    sendTyping: sendTypingNotification,
    sendStopTyping: sendStopTypingNotification,
    sendMarkSeen: sendMarkSeenNotification,
    joinConversation: joinConversationRoom,
    leaveConversation: leaveConversationRoom,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
