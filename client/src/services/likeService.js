import apiClient from "./apiClient";

export const likeService = {
  toggleLike: (id, type = "Post") =>
    apiClient.get(`/like/toggle/${id}?type=${type}`),
  getLikes: (id, type = "Post") =>
    apiClient.get(`/like/${id}?type=${type}`),
};

export default likeService;
