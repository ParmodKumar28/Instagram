import apiClient from "./apiClient";

export const storyService = {
  createStory: (formData) =>
    apiClient.post("/story/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getFeedStories: () => apiClient.get("/story/feed"),

  getUserStories: (userId) => apiClient.get(`/story/user/${userId}`),

  markStoryViewed: (storyId) => apiClient.post(`/story/${storyId}/view`),

  likeStory: (storyId) => apiClient.post(`/story/${storyId}/like`),

  replyStory: (storyId, text) => apiClient.post(`/story/${storyId}/reply`, { text }),

  deleteStory: (storyId) => apiClient.delete(`/story/${storyId}`),
};

export default storyService;
