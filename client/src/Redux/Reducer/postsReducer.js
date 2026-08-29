// Post's reducer is here here all state management is handled related to post's and handlers
// Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { postService } from "../../services";

// Async Thunks
// Create new post
export const createPostAsync = createAsyncThunk(
  "posts/create",
  async (formData, { dispatch }) => {
    try {
      const response = await postService.createPost(formData);
      if (response.status === 201 || response.status === 200) {
        dispatch(fetchPostsAsync());
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to create post");
      throw error;
    }
  }
);

// Fetch all posts
export const fetchPostsAsync = createAsyncThunk("posts/fetch", async () => {
  try {
    const response = await postService.getAllPosts();
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.customMessage || "Failed to fetch posts");
    throw error;
  }
});

// Update post
export const updatePostAsync = createAsyncThunk(
  "posts/update",
  async ({ postId, postData }, { dispatch }) => {
    try {
      const response = await postService.updatePost(postId, postData);
      if (response.status === 200) {
        dispatch(fetchPostsAsync());
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to update post");
      throw error;
    }
  }
);

// Delete post
export const deletePostAsync = createAsyncThunk(
  "posts/delete",
  async (postId, { dispatch }) => {
    try {
      const response = await postService.deletePost(postId);
      if (response.status === 200) {
        dispatch(fetchPostsAsync());
        return postId;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to delete post");
      throw error;
    }
  }
);

// Fetch user posts
export const fetchUserPostsAsync = createAsyncThunk(
  "posts/fetchUserPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await postService.getUserPosts(userId);
      return response.data.posts;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.customMessage);
    }
  }
);

// Fetch single post by ID
export const fetchSinglePostAsync = createAsyncThunk(
  "posts/fetchSinglePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.getPostById(postId);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.customMessage);
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

    // Fetch posts
    builder
      .addCase(fetchPostsAsync.pending, (state) => {
        state.postsLoading = true;
      })
      .addCase(fetchPostsAsync.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.posts = action.payload.posts || action.payload;
      })
      .addCase(fetchPostsAsync.rejected, (state) => {
        state.postsLoading = false;
      })

      // Update post
      .addCase(updatePostAsync.fulfilled, () => {
        toast.success("Post updated successfully!");
      })

      // Delete post
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.posts = state.posts.filter(
          (post) => (post._id || post.id) !== deletedId
        );
        state.userPosts = state.userPosts.filter(
          (post) => (post._id || post.id) !== deletedId
        );
        toast.success("Post deleted successfully!");
      });
  },
});

export const postsReducer = postsSlice.reducer;
export const postsSelector = (state) => state.postsReducer;

