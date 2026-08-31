import { io } from "socket.io-client";
import { SOCKET_URL } from "../redux/baseUrl";

let socket = null;

/**
 * Get current Socket.IO client instance
 */
export const getSocket = () => socket;

/**
 * Connect socket and register current user
 * @param {string} userId
 */
export const connectSocket = (userId) => {
  if (!userId) return null;

  const token = localStorage.getItem("auth-token");

  if (socket && socket.connected) {
    socket.emit("register_user", { userId });
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Determine socket endpoint
  const targetUrl = SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "");

  socket = io(targetUrl, {
    path: "/socket.io",
    auth: {
      token,
      userId,
    },
    withCredentials: true,
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    socket.emit("register_user", { userId });
  });

  socket.on("reconnect", () => {
    socket.emit("register_user", { userId });
  });

  socket.on("connect_error", (err) => {
    // Graceful log for mobile / network switches
    console.debug("Socket.IO notice:", err?.message || err);
  });

  return socket;
};

/**
 * Disconnect socket cleanly
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join conversation room
 * @param {string} conversationId
 */
export const joinConversationRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit("join_conversation", { conversationId });
  }
};

/**
 * Leave conversation room
 * @param {string} conversationId
 */
export const leaveConversationRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit("leave_conversation", { conversationId });
  }
};

/**
 * Send typing notification
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.recipientId
 * @param {string} params.username
 */
export const sendTypingNotification = ({ conversationId, recipientId, username }) => {
  if (socket && (conversationId || recipientId)) {
    socket.emit("typing", { conversationId, recipientId, username });
  }
};

/**
 * Send stop typing notification
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.recipientId
 */
export const sendStopTypingNotification = ({ conversationId, recipientId }) => {
  if (socket && (conversationId || recipientId)) {
    socket.emit("stop_typing", { conversationId, recipientId });
  }
};

/**
 * Send mark seen notification
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.recipientId
 */
export const sendMarkSeenNotification = ({ conversationId, recipientId }) => {
  if (socket && conversationId) {
    socket.emit("mark_seen", { conversationId, recipientId });
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinConversationRoom,
  leaveConversationRoom,
  sendTypingNotification,
  sendStopTypingNotification,
  sendMarkSeenNotification,
};
