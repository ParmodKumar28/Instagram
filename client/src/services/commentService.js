import apiClient from "./apiClient";

export const commentService = {
  addComment: (postId, comment) =>
    apiClient.post(`/comment/add/${postId}`, { comment }),
  getComments: (postId) => apiClient.get(`/comment/${postId}`),
};

export default commentService;
