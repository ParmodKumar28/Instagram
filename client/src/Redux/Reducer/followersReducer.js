import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../baseUrl";

const BASE_URL_FOLLOWERS = `${BASE_URL}/follower`;

axios.defaults.withCredentials = true;

export const toggleFollowAsync = createAsyncThunk(
  "followers/toggleFollow",
  async (followingId, { dispatch }) => {
    try {
      const response = await axios.get(
        `${BASE_URL_FOLLOWERS}/follow/${followingId}`,
        {
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
          },
        }
      );
      if (response.statusText === "OK") {
        return response.data;
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error;
    }
  }
);

export const getFollowersAsync = createAsyncThunk(
  "followers/getFollowers",
  async (userId) => {
    try {
      const response = await axios.get(
        `${BASE_URL_FOLLOWERS}/followers/${userId}`,
        {
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
          },
        }
      );
      if (response.statusText === "OK") {
        return response.data.followers;
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error;
    }
  }
);

export const getFollowingAsync = createAsyncThunk(
  "followers/getFollowing",
  async (userId) => {
    try {
      const response = await axios.get(
        `${BASE_URL_FOLLOWERS}/following/${userId}`,
        {
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
          },
        }
      );
      if (response.statusText === "OK") {
        return response.data.following;
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error;
    }
  }
);

// Async thunk to remove a follower
export const removeFollowerAsync = createAsyncThunk(
  "followers/removeFollower",
  async (followerId, { getState, rejectWithValue }) => {
    try {
      const authToken = localStorage.getItem("auth-token");
      const response = await axios.get(
        `${BASE_URL_FOLLOWERS}/unfollow/${followerId}`,
        {
          headers: {
            "auth-token": authToken,
          },
        }
      );
      if (response.statusText === "OK") {
        return followerId; // Return the ID of the removed follower upon success
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      return rejectWithValue(error.message); // Reject with the error message
    }
  }
);

// Async thunk to unfollow a user
export const unfollowUserAsync = createAsyncThunk(
  "followers/unfollowUser",
  async (followingId, { getState, rejectWithValue }) => {
    try {
      const authToken = localStorage.getItem("auth-token");
      const response = await axios.get(
        `${BASE_URL_FOLLOWERS}/unfollow/${followingId}`,
        {
          headers: {
            "auth-token": authToken,
          },
        }
      );
      if (response.statusText === "OK") {
        return response.data.msg; // Return the success message
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      return rejectWithValue(error.message); // Reject with the error message
    }
  }
);

const initialState = {
  followers: [],
  following: [],
  loading: false,
  error: null,
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
        // Update followers or following based on response
      })
      .addCase(toggleFollowAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getFollowersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(getFollowingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(removeFollowerAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFollowerAsync.fulfilled, (state, action) => {
        state.loading = false;
        toast.success("Follower removed!");
      })
      .addCase(removeFollowerAsync.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(unfollowUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(unfollowUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        toast.success("User unfollowed!");
      })
      .addCase(unfollowUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error message
      });
  },
});

// Followers reducer
export const followersReducer = followersSlice.reducer;

// State
export const followersSelector = (state) => state.followersReducer;
