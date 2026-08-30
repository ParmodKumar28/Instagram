import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

// Multi-device socket mapping: userId -> Set of socketIds
const userSockets = new Map();
// Reverse mapping: socketId -> userId
const socketToUser = new Map();

/**
 * Initialize Socket.IO with HTTP Server
 * @param {import("http").Server} httpServer
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow connections from valid origins
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (token && process.env.JWT_Secret) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_Secret);
          socket.authenticatedUserId = decoded.id;
        } catch (err) {
          // Token expired or invalid
        }
      }
      next();
    } catch (err) {
      next();
    }
  });

  io.on("connection", (socket) => {
    // Auto-register authenticated user if handshake token was provided
    if (socket.authenticatedUserId) {
      const userId = socket.authenticatedUserId.toString();
      socketToUser.set(socket.id, userId);

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      socket.join(`user_${userId}`);
    }

    // 1. User Registration / Online Presence
    socket.on("register_user", (data) => {
      const userId = (socket.authenticatedUserId || data?.userId)?.toString();
      if (!userId) return;

      socketToUser.set(socket.id, userId);

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // Join user's personal room for direct notification routing
      socket.join(`user_${userId}`);

      // Broadcast to everyone that this user is online
      io.emit("user_status_changed", {
        userId,
        status: "online",
        onlineUsers: Array.from(userSockets.keys()),
      });

      // Send the current list of online users directly to this connected socket
      socket.emit("online_users_list", {
        onlineUsers: Array.from(userSockets.keys()),
      });
    });

    // 2. Join / Leave specific Conversation Room (for instant chat stream)
    socket.on("join_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
      }
    });

    socket.on("leave_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // 3. Real-time Typing Indicators
    socket.on("typing", ({ conversationId, recipientId, username }) => {
      const senderId = socketToUser.get(socket.id);
      if (recipientId) {
        emitToUser(recipientId, "user_typing", {
          conversationId,
          senderId,
          username,
        });
      }
      if (conversationId) {
        socket.to(`conv_${conversationId}`).emit("user_typing", {
          conversationId,
          senderId,
          username,
        });
      }
    });

    socket.on("stop_typing", ({ conversationId, recipientId }) => {
      const senderId = socketToUser.get(socket.id);
      if (recipientId) {
        emitToUser(recipientId, "user_stop_typing", {
          conversationId,
          senderId,
        });
      }
      if (conversationId) {
        socket.to(`conv_${conversationId}`).emit("user_stop_typing", {
          conversationId,
          senderId,
        });
      }
    });

    // 4. Real-time Message Seen Event
    socket.on("mark_seen", ({ conversationId, recipientId }) => {
      const senderId = socketToUser.get(socket.id);
      if (recipientId) {
        emitToUser(recipientId, "messages_seen", {
          conversationId,
          seenBy: senderId,
        });
      }
      if (conversationId) {
        socket.to(`conv_${conversationId}`).emit("messages_seen", {
          conversationId,
          seenBy: senderId,
        });
      }
    });

    // 5. Disconnect Handling & Presence Cleanup
    socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);
      socketToUser.delete(socket.id);

      if (userId && userSockets.has(userId)) {
        const sockets = userSockets.get(userId);
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          userSockets.delete(userId);
          // Broadcast offline event only when all device connections for this user are closed
          io.emit("user_status_changed", {
            userId,
            status: "offline",
            onlineUsers: Array.from(userSockets.keys()),
          });
        }
      }
    });
  });

  return io;
};

/**
 * Get active Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return io;
};

/**
 * Emit an event to all connected sockets of a specific user
 * @param {string} userId
 * @param {string} event
 * @param {any} data
 */
export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  const uid = userId.toString();
  // Using user room for reliable broadcast across tabs/devices
  io.to(`user_${uid}`).emit(event, data);
};

/**
 * Emit an event to multiple users
 * @param {string[]} userIds
 * @param {string} event
 * @param {any} data
 */
export const emitToUsers = (userIds, event, data) => {
  if (!io || !Array.isArray(userIds)) return;
  userIds.forEach((uid) => emitToUser(uid, event, data));
};

/**
 * Get current list of online user IDs
 */
export const getOnlineUsers = () => {
  return Array.from(userSockets.keys());
};
