// Import's
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchPostsAsync } from "./postsReducer";
import BASE_URL from "../baseUrl";

// Base url for like's
const BASE_URL_LIKES = `${BASE_URL}/like`;

// Setting Axios default for credentials
axios.defaults.withCredentials = true;

// Async Thunks
// Toggle Like
export const toggleLikeAsync = createAsyncThunk(
  "likes/toggle",
  async ({ id, type }, { dispatch }) => {
    try {
      const response = axios.get(
        `${BASE_URL_LIKES}/toggle/${id}?type=${type}`,
        {
          headers: {
            "auth-token": `${localStorage.getItem("auth-token")}`,
          },
        }
      );
      // If response is ok then return repsonse.data
      // dispatch(fetchPostsAsync());
      if (response.statusText === "OK") {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Display the error message in a toast
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error; // Throw the error to trigger the rejected case
    }
  }
);

// Get Likes
export const getLikesAsync = createAsyncThunk(
  "likes/getLikes",
  async ({ id, type }) => {
    try {
      const response = await axios.get(`${BASE_URL_LIKES}/${id}?type=${type}`, {
        headers: {
          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
      });
      // If response is ok then return response.data
      if (response.statusText === "OK") {
        return response.data;
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Display the error message in a toast
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error; // Throw the error to trigger the rejected case
    }
  }
);

const INITIAL_STATE = {};

const likesSlice = createSlice({
  name: "likes",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    // Add comment's
    builder
      .addCase(toggleLikeAsync.pending, (state, action) => {})
      .addCase(toggleLikeAsync.fulfilled, (state, action) => {})
      .addCase(toggleLikeAsync.rejected, (state, action) => {});
  },
});

// Extract like reducer from the slice
export const likesReducer = likesSlice.reducer;

// State from the reducer and exporting state
export const likesSelector = (state) => state.likesReducer;
