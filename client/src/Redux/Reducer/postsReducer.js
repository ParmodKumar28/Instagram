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
  async (formData, { dispatch }) => {
    try {
      const response = await axios.post(
        `${BASE_URL_POSTS}/create-post`,
        formData
      );
      // If response is ok then return repsonse.data
      if (response.statusText === "OK") {
        dispatch(fetchPostsAsync());
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

// Fetch post's
export const fetchPostsAsync = createAsyncThunk("posts/fetch", async () => {
  try {
    const response = await axios.get(`${BASE_URL_POSTS}/all-posts`);
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
});
// Fetch post's end's

// Async Thunk for updating a post
export const updatePostAsync = createAsyncThunk(
  "posts/update",
  async ({ postId, postData }, { dispatch }) => {
    try {
      const response = await axios.put(
        `${BASE_URL_POSTS}/update-post/${postId}`,
        postData
      );
      if (response.statusText === "OK") {
        dispatch(fetchPostsAsync());
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error;
    }
  }
);

// Async Thunk for deleting a post
export const deletePostAsync = createAsyncThunk(
  "posts/delete",
  async (postId, { dispatch }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL_POSTS}/delete-post/${postId}`
      );
      if (response.statusText === "OK") {
        dispatch(fetchPostsAsync());
        return postId;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error;
    }
  }
);

// Initial State
const INITIAL_STATE = {
  postsLoading: true,
  addPostLoad: false,
  posts: [],
};

// Slice
const postsSlice = createSlice({
  // Slice name
  name: "posts",

  // Initial State
  initialState: INITIAL_STATE,

  // Reducers
  reducers: {},

  // Extra reducers
  extraReducers: (builder) => {
    // Create post pending state extra reducer
    builder.addCase(createPostAsync.pending, (state, action) => {
      state.addPostLoad = true; // Set loading state for adding a post
    });

    // Create post fulfilled state extra reducer
    builder.addCase(createPostAsync.fulfilled, (state, action) => {
      state.addPostLoad = false; // Set loading state to false
      toast.success("Post uploaded successfully!"); // Display success message
    });

    // Create post rejected state extra reducer
    builder.addCase(createPostAsync.rejected, (state, action) => {
      state.addPostLoad = false; // Set loading state to false
    });

    // Fetch posts pending state extra reducer
    builder.addCase(fetchPostsAsync.pending, (state, action) => {
      state.postsLoading = true; // Set loading state for fetching posts
    });

    // Fetch posts fulfilled state extra reducer
    builder.addCase(fetchPostsAsync.fulfilled, (state, action) => {
      state.postsLoading = false; // Set loading state to false
      state.posts = action.payload.posts; // Update posts state with fetched data
    });

    // Fetch posts rejected state extra reducer
    builder.addCase(fetchPostsAsync.rejected, (state, action) => {
      state.postsLoading = false; // Set loading state to false
    });

    // Update post pending state extra reducer
    builder.addCase(updatePostAsync.pending, (state, action) => {
      // Handle pending state for updating post if needed
    });

    // Update post fulfilled state extra reducer
    builder.addCase(updatePostAsync.fulfilled, (state, action) => {
      // Handle fulfilled state for updating post if needed
      toast.success("Post updated successfully!"); // Display success message
    });

    // Update post rejected state extra reducer
    builder.addCase(updatePostAsync.rejected, (state, action) => {
      // Handle rejected state for updating post if needed
    });

    // Delete post pending state extra reducer
    builder.addCase(deletePostAsync.pending, (state, action) => {
      // Handle pending state for deleting post if needed
    });

    // Delete post fulfilled state extra reducer
    builder.addCase(deletePostAsync.fulfilled, (state, action) => {
      // Handle fulfilled state for deleting post if needed
      toast.success("Post deleted successfully!"); // Display success message
      state.posts = state.posts.filter((post) => post.id !== action.payload); // Remove deleted post from state
    });

    // Delete post rejected state extra reducer
    builder.addCase(deletePostAsync.rejected, (state, action) => {
      // Handle rejected state for deleting post if needed
    });
  },
});

// Extract post reducer from the slice
export const postsReducer = postsSlice.reducer;

// Extract actions from the slice

// State from the reducer and exporting state
export const postsSelector = (state) => state.postsReducer;
