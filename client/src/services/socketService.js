import { io } from "socket.io-client";

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

  if (socket && socket.connected) {
    socket.emit("register_user", { userId });
    return socket;
  }

  // Use relative path or proxy to connect cleanly
  socket = io(window.location.origin, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket", "polling"],
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
