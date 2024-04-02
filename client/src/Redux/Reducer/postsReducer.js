// Post's reducer is here here all state management is handled related to post's and handlers
// Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// Base url for user's
const BASE_URL_POSTS = "http://localhost:8000/api/post";

// Setting Axios default for credentials
axios.defaults.withCredentials = true;

// Async Thunks
// Create new post start's here
export const createPostAsync = createAsyncThunk(
  "posts/create",
  async (formData) => {
    try {
      console.log(formData);
      const response = await axios.post(
        `${BASE_URL_POSTS}/create-post`,
        formData
      );
      // If response is ok then return repsonse.data
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
// Create new post end's here

// Initial State
const INITIAL_STATE = {
  postsLoading: true,
  addPostLoad: false,
};

// Slice
const postsSlice = createSlice({
  // Slice name
  name: "posts",

  // Initial State
  initialState: INITIAL_STATE,

  // Reducers
  reducers: {},

  // Extra reducer's
  extraReducers: (builder) => {
    // Create post pending state extra reducer start's here
    builder.addCase(createPostAsync.pending, (state, action) => {
      state.addPostLoad = true;
    });
    // Create post pending state extra reducer end's here

    // Create post fulfilled state extra reducer start's here
    builder.addCase(createPostAsync.fulfilled, (state, action) => {
      state.addPostLoad = false;
      toast.success("Post uploaded successfully!");
    });
    // Create post fulfilled state extra reducer end's here

    // Create post rejected state extra reducer start's here
    builder.addCase(createPostAsync.rejected, (state, action) => {
      state.addPostLoad = false;
    });
    // Create post rejected state extra reducer end's here
  },
});

// Extract post reducer from the slice
export const postsReducer = postsSlice.reducer;

// Extract actions from the slice

// State from the reducer and exporting state
export const postsSelector = (state) => state.postsReducer;
