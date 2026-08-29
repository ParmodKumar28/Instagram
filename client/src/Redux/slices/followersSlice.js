import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { followerService } from "../../services";

export const toggleFollowAsync = createAsyncThunk(
  "followers/toggleFollow",
  async (followingId) => {
    try {
      const response = await followerService.toggleFollow(followingId);
      if (response.status === 200) {
        return response.data;
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
        return response.data.msg;
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
      toast.error(error.customMessage || "Failed to fetch follow status");
      throw error;
    }
  }
);

const initialState = {
  followers: [],
  following: [],
  loading: false,
  error: null,
  followStatus: "",
};

const followersSlice = createSlice({
  name: "followers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleFollowAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFollowAsync.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.msg);
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
      .addCase(removeFollowerAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFollowerAsync.fulfilled, (state) => {
        state.loading = false;
        toast.success("Follower removed!");
      })
      .addCase(removeFollowerAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(unfollowUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(unfollowUserAsync.fulfilled, (state) => {
        state.loading = false;
        toast.success("User unfollowed!");
      })
      .addCase(unfollowUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFollowStatusAsync.fulfilled, (state, action) => {
        state.followStatus = action.payload.followStatus;
      });
  },
});

export const followersReducer = followersSlice.reducer;
export const followersSelector = (state) => state.followersReducer;
export default followersSlice.reducer;
