import apiClient from "./apiClient";

export const chatService = {
  getConversations: () => apiClient.get("/chat/conversations"),

  getOrCreateConversation: (recipientId) =>
    apiClient.get(`/chat/user/${recipientId}`),

  getMessages: (conversationId) =>
    apiClient.get(`/chat/messages/${conversationId}`),

  sendMessage: (data) => apiClient.post("/chat/send", data),

  markSeen: (conversationId) =>
    apiClient.post(`/chat/seen/${conversationId}`),

  deleteMessage: (messageId) =>
    apiClient.delete(`/chat/message/${messageId}`),
};

export default chatService;
