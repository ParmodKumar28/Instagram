import apiClient from "./apiClient";

export const followerService = {
  toggleFollow: (followingId) =>
    apiClient.get(`/follower/follow/${followingId}`),
  getFollowers: (userId) => apiClient.get(`/follower/followers/${userId}`),
  getFollowing: (userId) => apiClient.get(`/follower/following/${userId}`),
  removeFollower: (followerId) =>
    apiClient.get(`/follower/unfollow/${followerId}`),
  unfollowUser: (followingId) =>
    apiClient.get(`/follower/unfollow/${followingId}`),
  getFollowStatus: (userId) =>
    apiClient.get(`/follower/follow-status/${userId}`),
};

export default followerService;
