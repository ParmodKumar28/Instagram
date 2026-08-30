import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatService } from "../../services";
import toast from "react-hot-toast";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
};

// Fetch conversations
export const fetchConversationsAsync = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations();
      return response.data?.conversations || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load conversations"
      );
    }
  }
);

// Get or create conversation with a user
export const getOrCreateConversationAsync = createAsyncThunk(
  "chat/getOrCreateConversation",
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await chatService.getOrCreateConversation(recipientId);
      return response.data?.conversation;
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to open chat");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch messages for active conversation
export const fetchMessagesAsync = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(conversationId);
      return {
        conversationId,
        messages: response.data?.messages || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load messages"
      );
    }
  }
);

// Send message
export const sendMessageAsync = createAsyncThunk(
  "chat/sendMessage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Failed to send message"
      );
    }
  }
);

// Mark conversation as seen
export const markSeenAsync = createAsyncThunk(
  "chat/markSeen",
  async (conversationId, { rejectWithValue }) => {
    try {
      await chatService.markSeen(conversationId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Delete / Unsend message
export const deleteMessageAsync = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await chatService.deleteMessage(messageId);
      return { messageId, conversationId: response.data?.conversationId };
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to unsend message");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      if (action.payload?._id) {
        const conv = state.conversations.find(
          (c) => c._id === action.payload._id
        );
        if (conv) {
          conv.unreadCount = 0;
        }
      }
    },
    clearActiveConversation: (state) => {
      state.activeConversation = null;
      state.messages = [];
    },
    addIncomingMessage: (state, action) => {
      const newMessage = action.payload;
      if (
        state.activeConversation &&
        state.activeConversation._id === newMessage.conversation
      ) {
        if (!state.messages.some((m) => m._id === newMessage._id)) {
          state.messages.push(newMessage);
        }
      }
      // Update last message in conversations list
      const conv = state.conversations.find(
        (c) => c._id === newMessage.conversation
      );
      if (conv) {
        conv.lastMessage = {
          text: newMessage.text,
          media: newMessage.media,
          mediaType: newMessage.mediaType,
          sender: newMessage.sender,
          createdAt: newMessage.createdAt,
        };
        conv.updatedAt = newMessage.createdAt;
        if (state.activeConversation?._id === conv._id) {
          conv.unreadCount = 0;
        }
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },
    updateUserOnlineStatus: (state, action) => {
      const { userId, status, onlineUsers } = action.payload;
      if (onlineUsers) {
        state.onlineUsers = onlineUsers;
      } else if (status === "online" && !state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      } else if (status === "offline") {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }
    },
    setTypingStatus: (state, action) => {
      const { conversationId, senderId, username, isTyping } = action.payload;
      if (!conversationId) return;
      if (isTyping) {
        state.typingUsers[conversationId] = { senderId, username };
      } else {
        delete state.typingUsers[conversationId];
      }
    },
    handleIncomingMessageDeleted: (state, action) => {
      const { messageId } = action.payload;
      state.messages = state.messages.filter((m) => m._id !== messageId);
    },
    handleIncomingMessagesSeen: (state, action) => {
      const { conversationId } = action.payload;
      if (state.activeConversation?._id === conversationId) {
        state.messages.forEach((m) => {
          m.seen = true;
        });
      }
      const conv = state.conversations.find((c) => c._id === conversationId);
      if (conv) {
        conv.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversationsAsync.pending, (state) => {
        state.loadingConversations = true;
      })
      .addCase(fetchConversationsAsync.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload || [];
      })
      .addCase(fetchConversationsAsync.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload;
      })

      // Get or Create Conversation
      .addCase(getOrCreateConversationAsync.fulfilled, (state, action) => {
        const conv = action.payload;
        if (conv) {
          state.activeConversation = conv;
          if (!state.conversations.some((c) => c._id === conv._id)) {
            state.conversations.unshift(conv);
          }
        }
      })

      // Fetch Messages
      .addCase(fetchMessagesAsync.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchMessagesAsync.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
      })

      // Send Message
      .addCase(sendMessageAsync.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const { message, conversationId } = action.payload;
        if (message) {
          if (!state.messages.some((m) => m._id === message._id)) {
            state.messages.push(message);
          }
          // Update conversation in list
          const conv = state.conversations.find((c) => c._id === conversationId);
          if (conv) {
            conv.lastMessage = {
              text: message.text,
              media: message.media,
              mediaType: message.mediaType,
              sender: message.sender,
              createdAt: message.createdAt,
            };
            conv.updatedAt = message.createdAt;
          }
        }
      })
      .addCase(sendMessageAsync.rejected, (state) => {
        state.sendingMessage = false;
      })

      // Mark Seen
      .addCase(markSeenAsync.fulfilled, (state, action) => {
        const conversationId = action.payload;
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (conv) {
          conv.unreadCount = 0;
        }
      })

      // Delete Message
      .addCase(deleteMessageAsync.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        state.messages = state.messages.filter((m) => m._id !== messageId);
      });
  },
});

export const {
  setActiveConversation,
  clearActiveConversation,
  addIncomingMessage,
  setOnlineUsers,
  updateUserOnlineStatus,
  setTypingStatus,
  handleIncomingMessageDeleted,
  handleIncomingMessagesSeen,
} = chatSlice.actions;

export const chatReducer = chatSlice.reducer;
export const chatSelector = (state) => state.chatReducer;
export default chatSlice.reducer;
