// Post's reducer is here here all state management is handled related to post's and handlers
// Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../baseUrl";

// Base url for post's
const BASE_URL_POSTS = `${BASE_URL}/post`;

// Setting Axios default for credentials
axios.defaults.withCredentials = true;

// Async Thunks
// Create new post starts here
export const createPostAsync = createAsyncThunk(
  "posts/create",
  async (formData, { dispatch }) => {
    try {
      const response = await fetch(`${BASE_URL_POSTS}/create-post`, {
        method: "POST",
        headers: {
          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(fetchPostsAsync());
        return data;
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          toast.error(errorData.error);
        } else {
          toast.error("An error occurred. Please try again later.");
        }
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again later.");
      throw error;
    }
  }
);
// Create new post ends here

// Fetch posts
export const fetchPostsAsync = createAsyncThunk("posts/fetch", async () => {
  try {
    const response = await axios.get(`${BASE_URL_POSTS}/all-posts`, {
      headers: {
        "auth-token": `${localStorage.getItem("auth-token")}`,
      },
    });
    if (response.status === 200) {
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
});
// Fetch posts ends

// Async Thunk for updating a post
export const updatePostAsync = createAsyncThunk(
  "posts/update",
  async ({ postId, postData }, { dispatch }) => {
    try {
      const response = await axios.put(
        `${BASE_URL_POSTS}/update-post/${postId}`,
        postData,
        {
          headers: {
            Accept: "application/form-data",
            "auth-token": `${localStorage.getItem("auth-token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
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
        `${BASE_URL_POSTS}/delete-post/${postId}`,
        {
          headers: {
            "auth-token": `${localStorage.getItem("auth-token")}`,
          },
        }
      );
      if (response.status === 200) {
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

// Async Thunk for fetching user posts
export const fetchUserPostsAsync = createAsyncThunk(
  "posts/fetchUserPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL_POSTS}/user-posts/${userId}`,
        {
          headers: {
            "auth-token": `${localStorage.getItem("auth-token")}`,
          },
        }
      );
      return response.data.posts;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async Thunk for fetching a single post by ID
export const fetchSinglePostAsync = createAsyncThunk(
  "posts/fetchSinglePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL_POSTS}/${postId}`, {
        headers: {
          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
      });
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial State
const INITIAL_STATE = {
  postsLoading: true,
  addPostLoad: false,
  posts: [],
  userPostsLoading: false,
  userPosts: [],
  singlePostLoading: false,
  singlePost: null,
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

    // Fetch user posts pending state extra reducer
    builder.addCase(fetchUserPostsAsync.pending, (state) => {
      state.userPostsLoading = true;
    });

    // Fetch user posts fulfilled state extra reducer
    builder.addCase(fetchUserPostsAsync.fulfilled, (state, action) => {
      state.userPostsLoading = false;
      state.userPosts = action.payload;
    });

    // Fetch user posts rejected state extra reducer
    builder.addCase(fetchUserPostsAsync.rejected, (state) => {
      state.userPostsLoading = false;
    });

    // Extra reducers for fetching a single post by ID
    builder.addCase(fetchSinglePostAsync.pending, (state) => {
      state.singlePostLoading = true;
    });

    builder.addCase(fetchSinglePostAsync.fulfilled, (state, action) => {
      state.singlePostLoading = false;
      state.singlePost = action.payload;
    });

    builder.addCase(fetchSinglePostAsync.rejected, (state) => {
      state.singlePostLoading = false;
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
