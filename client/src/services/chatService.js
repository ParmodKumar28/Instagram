import apiClient from "./apiClient";

export const chatService = {
  getConversations: () => apiClient.get("/chat/conversations"),

  getOrCreateConversation: (recipientId) =>
    apiClient.get(`/chat/user/${recipientId}`),

  getMessages: (conversationId) =>
    apiClient.get(`/chat/messages/${conversationId}`),

  sendMessage: (formData) =>
    apiClient.post("/chat/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  markSeen: (conversationId) =>
    apiClient.post(`/chat/seen/${conversationId}`),

  deleteMessage: (messageId) =>
    apiClient.delete(`/chat/message/${messageId}`),
};

export default chatService;
