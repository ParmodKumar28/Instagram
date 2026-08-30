import apiClient from "./apiClient";

export const commentService = {
  addComment: (postId, comment, parentCommentId = null) =>
    apiClient.post(`/comment/add/${postId}`, { comment, parentCommentId }),
  getComments: (postId) => apiClient.get(`/comment/${postId}`),
  deleteComment: (commentId) => apiClient.delete(`/comment/delete/${commentId}`),
  updateComment: (commentId, comment) =>
    apiClient.put(`/comment/update/${commentId}`, { comment }),
  toggleLikeComment: (commentId) =>
    apiClient.get(`/like/toggle/${commentId}?type=Comment`),
};

export default commentService;
