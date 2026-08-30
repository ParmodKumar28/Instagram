import apiClient from "./apiClient";

export const postService = {
  createPost: (formData) =>
    apiClient.post("/post/create-post", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAllPosts: () => apiClient.get("/post/all-posts"),
  getReels: () => apiClient.get("/post/reels"),
  getPostById: (postId) => apiClient.get(`/post/${postId}`),
  getUserPosts: (userId) => apiClient.get(`/post/user-posts/${userId}`),
  getTaggedPosts: (userId) => apiClient.get(`/post/tagged-posts/${userId}`),
  updatePost: (postId, postData) =>
    apiClient.put(`/post/update-post/${postId}`, postData),
  deletePost: (postId) => apiClient.delete(`/post/delete-post/${postId}`),
  toggleSavePost: (postId) => apiClient.post(`/post/save/${postId}`),
  getSavedPosts: () => apiClient.get("/post/saved/all"),
};

export default postService;
