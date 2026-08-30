import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { followerService } from "../../services";

export const toggleFollowAsync = createAsyncThunk(
  "followers/toggleFollow",
  async (followingId) => {
    try {
      const response = await followerService.toggleFollow(followingId);
      if (response.status === 200) {
        return {
          followingId,
          status: response.data?.status,
          isFollowing: response.data?.isFollowing,
          isPending: response.data?.isPending,
          msg: response.data?.msg,
        };
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to toggle follow status");
      throw error;
    }
  }
);

export const getFollowersAsync = createAsyncThunk(
  "followers/getFollowers",
  async (userId) => {
    try {
      const response = await followerService.getFollowers(userId);
      if (response.status === 200) {
        return response.data.followers;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to fetch followers");
      throw error;
    }
  }
);

export const getFollowingAsync = createAsyncThunk(
  "followers/getFollowing",
  async (userId) => {
    try {
      const response = await followerService.getFollowing(userId);
      if (response.status === 200) {
        return response.data.following;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to fetch following");
      throw error;
    }
  }
);

export const getFollowRequestsAsync = createAsyncThunk(
  "followers/getFollowRequests",
  async () => {
    try {
      const response = await followerService.getFollowRequests();
      if (response.status === 200) {
        return response.data.requests || [];
      }
      return [];
    } catch {
      return [];
    }
  }
);

export const getActivityAsync = createAsyncThunk(
  "followers/getActivity",
  async () => {
    try {
      const response = await followerService.getActivity();
      if (response.status === 200) {
        return response.data.activities || [];
      }
      return [];
    } catch {
      return [];
    }
  }
);

export const acceptFollowRequestAsync = createAsyncThunk(
  "followers/acceptFollowRequest",
  async (followerId) => {
    try {
      const response = await followerService.acceptFollowRequest(followerId);
      if (response.status === 200) {
        toast.success("Follow request accepted");
        return followerId;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to accept request");
      throw error;
    }
  }
);

export const rejectFollowRequestAsync = createAsyncThunk(
  "followers/rejectFollowRequest",
  async (followerId) => {
    try {
      const response = await followerService.rejectFollowRequest(followerId);
      if (response.status === 200) {
        toast.success("Follow request removed");
        return followerId;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to reject request");
      throw error;
    }
  }
);

export const removeFollowerAsync = createAsyncThunk(
  "followers/removeFollower",
  async (followerId, { rejectWithValue }) => {
    try {
      const response = await followerService.removeFollower(followerId);
      if (response.status === 200) {
        return followerId;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to remove follower");
      return rejectWithValue(error.customMessage || error.message);
    }
  }
);

export const unfollowUserAsync = createAsyncThunk(
  "followers/unfollowUser",
  async (followingId, { rejectWithValue }) => {
    try {
      const response = await followerService.unfollowUser(followingId);
      if (response.status === 200) {
        return followingId;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to unfollow user");
      return rejectWithValue(error.customMessage || error.message);
    }
  }
);

export const getFollowStatusAsync = createAsyncThunk(
  "followers/getFollowStatus",
  async (userId) => {
    try {
      const response = await followerService.getFollowStatus(userId);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      return { followStatus: "not-following" };
    }
  }
);

const initialState = {
  followers: [],
  following: [],
  requests: [],
  activity: [],
  hasUnreadNotifications: false,
  unreadCount: 0,
  loading: false,
  error: null,
  followStatus: "",
};

const followersSlice = createSlice({
  name: "followers",
  initialState,
  reducers: {
    addIncomingNotification: (state, action) => {
      const notification = action.payload;
      state.hasUnreadNotifications = true;
      state.unreadCount = (state.unreadCount || 0) + 1;

      if (notification?.type === "follow") {
        if (
          notification.sender &&
          !state.requests.some(
            (r) =>
              (r.follower?._id || r.follower) ===
              (notification.sender?._id || notification.sender)
          )
        ) {
          state.requests.unshift({
            _id: `req_${Date.now()}`,
            follower: notification.sender,
            createdAt: notification.createdAt || new Date(),
          });
        }
      }
    },
    clearUnreadNotifications: (state) => {
      state.hasUnreadNotifications = false;
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleFollowAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFollowAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { followingId, status, isFollowing, msg } = action.payload || {};
        if (status) {
          state.followStatus = status;
        } else if (msg?.includes("Unfollowed") || msg?.includes("cancelled")) {
          state.followStatus = "not-following";
        } else if (msg?.includes("Followed") || msg?.includes("accepted")) {
          state.followStatus = "accepted";
        } else if (msg?.includes("sent") || msg?.includes("pending")) {
          state.followStatus = "pending";
        }

        // Keep local following array in sync
        if (status === "accepted" || isFollowing === true) {
          if (
            followingId &&
            !state.following.some(
              (u) => (u.following?._id || u.following || u._id || "").toString() === followingId.toString()
            )
          ) {
            state.following.push({ following: followingId, _id: followingId });
          }
        } else if (status === "not-following" || isFollowing === false) {
          state.following = state.following.filter(
            (u) => (u.following?._id || u.following || u._id || "").toString() !== followingId?.toString()
          );
        }

        if (msg) toast.success(msg);
      })
      .addCase(toggleFollowAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getFollowersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload || [];
      })
      .addCase(getFollowingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload || [];
      })
      .addCase(getFollowRequestsAsync.fulfilled, (state, action) => {
        state.requests = action.payload || [];
      })
      .addCase(getActivityAsync.fulfilled, (state, action) => {
        state.activity = action.payload || [];
      })
      .addCase(acceptFollowRequestAsync.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (req) => (req.follower?._id || req.follower) !== action.payload
        );
      })
      .addCase(rejectFollowRequestAsync.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (req) => (req.follower?._id || req.follower) !== action.payload
        );
      })
      .addCase(removeFollowerAsync.fulfilled, (state, action) => {
        state.followers = state.followers.filter(
          (f) => (f.follower?._id || f._id) !== action.payload
        );
        toast.success("Follower removed!");
      })
      .addCase(unfollowUserAsync.fulfilled, (state, action) => {
        state.following = state.following.filter(
          (f) => (f.following?._id || f._id) !== action.payload
        );
        state.followStatus = "not-following";
        toast.success("Unfollowed");
      })
      .addCase(getFollowStatusAsync.fulfilled, (state, action) => {
        state.followStatus = action.payload?.followStatus || "not-following";
      });
  },
});

export const { addIncomingNotification, clearUnreadNotifications } =
  followersSlice.actions;

export const followersReducer = followersSlice.reducer;
export const followersSelector = (state) => state.followersReducer;
export default followersSlice.reducer;
