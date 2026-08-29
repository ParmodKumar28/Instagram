import apiClient from "./apiClient";

export const followerService = {
  toggleFollow: (followingId) =>
    apiClient.get(`/follower/follow/${followingId}`),
  getFollowers: (userId) => apiClient.get(`/follower/followers/${userId}`),
  getFollowing: (userId) => apiClient.get(`/follower/following/${userId}`),
  removeFollower: (followerId) =>
    apiClient.get(`/follower/remove-follower/${followerId}`),
  unfollowUser: (followingId) =>
    apiClient.get(`/follower/unfollow/${followingId}`),
  getFollowStatus: (userId) =>
    apiClient.get(`/follower/follow-status/${userId}`),
  getFollowRequests: () => apiClient.get("/follower/requests"),
  getActivity: () => apiClient.get("/follower/activity"),
  acceptFollowRequest: (followerId) =>
    apiClient.get(`/follower/accept-request/${followerId}`),
  rejectFollowRequest: (followerId) =>
    apiClient.get(`/follower/reject-request/${followerId}`),
};

export default followerService;
