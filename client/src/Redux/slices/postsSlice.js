import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { postService } from "../../services";

export const createPostAsync = createAsyncThunk(
  "posts/createPost",
  async (formData) => {
    try {
      const response = await postService.createPost(formData);
      if (response.status === 201) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to upload post");
      throw error;
    }
  }
);

export const fetchUserPostsAsync = createAsyncThunk(
  "posts/fetchUserPosts",
  async (userId) => {
    try {
      const response = await postService.getUserPosts(userId);
      if (response.status === 200) {
        return response.data.posts || [];
      }
      return [];
    } catch {
      // Don't show toast if user has no posts
      return [];
    }
  }
);

export const fetchPostsAsync = createAsyncThunk(
  "posts/fetchPosts",
  async () => {
    try {
      const response = await postService.getAllPosts();
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to fetch posts");
      throw error;
    }
  }
);

export const updatePostAsync = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, postData }) => {
    try {
      const response = await postService.updatePost(postId, postData);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to update post");
      throw error;
    }
  }
);

export const deletePostAsync = createAsyncThunk(
  "posts/deletePost",
  async (postId) => {
    try {
      const response = await postService.deletePost(postId);
      if (response.status === 200) {
        return postId;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to delete post");
      throw error;
    }
  }
);

export const fetchSinglePostAsync = createAsyncThunk(
  "posts/fetchSinglePost",
  async (postId) => {
    try {
      const response = await postService.getPostById(postId);
      if (response.status === 200) {
        return response.data.post;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to fetch post");
      throw error;
    }
  }
);

export const toggleSavePostAsync = createAsyncThunk(
  "posts/toggleSavePost",
  async (postId) => {
    try {
      const response = await postService.toggleSavePost(postId);
      if (response.status === 200) {
        return { postId, isSaved: response.data.isSaved, savedPosts: response.data.savedPosts };
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to save post");
      throw error;
    }
  }
);

export const fetchSavedPostsAsync = createAsyncThunk(
  "posts/fetchSavedPosts",
  async () => {
    try {
      const response = await postService.getSavedPosts();
      if (response.status === 200) {
        return response.data.savedPosts || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
      return [];
    }
  }
);

const INITIAL_STATE = {
  postsLoading: true,
  addPostLoad: false,
  posts: [],
  userPostsLoading: false,
  userPosts: [],
  savedPostsLoading: false,
  savedPosts: [],
  savedPostIds: [],
  singlePostLoading: false,
  singlePost: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState: INITIAL_STATE,
  reducers: {
    clearUserPosts: (state) => {
      state.userPosts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPostAsync.pending, (state) => {
        state.addPostLoad = true;
      })
      .addCase(createPostAsync.fulfilled, (state) => {
        state.addPostLoad = false;
        toast.success("Post uploaded successfully!");
      })
      .addCase(createPostAsync.rejected, (state) => {
        state.addPostLoad = false;
      })

      .addCase(fetchUserPostsAsync.pending, (state) => {
        state.userPostsLoading = true;
        state.userPosts = [];
      })
      .addCase(fetchUserPostsAsync.fulfilled, (state, action) => {
        state.userPostsLoading = false;
        state.userPosts = action.payload || [];
      })
      .addCase(fetchUserPostsAsync.rejected, (state) => {
        state.userPostsLoading = false;
        state.userPosts = [];
      })

      .addCase(fetchSinglePostAsync.pending, (state) => {
        state.singlePostLoading = true;
      })
      .addCase(fetchSinglePostAsync.fulfilled, (state, action) => {
        state.singlePostLoading = false;
        state.singlePost = action.payload;
      })
      .addCase(fetchSinglePostAsync.rejected, (state) => {
        state.singlePostLoading = false;
      })

      .addCase(fetchPostsAsync.pending, (state) => {
        state.postsLoading = true;
      })
      .addCase(fetchPostsAsync.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.posts = action.payload.posts || action.payload || [];
      })
      .addCase(fetchPostsAsync.rejected, (state) => {
        state.postsLoading = false;
      })

      .addCase(updatePostAsync.fulfilled, () => {
        toast.success("Post updated successfully!");
      })

      .addCase(deletePostAsync.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.posts = state.posts.filter(
          (post) => (post._id || post.id) !== deletedId
        );
        state.userPosts = state.userPosts.filter(
          (post) => (post._id || post.id) !== deletedId
        );
        state.savedPosts = state.savedPosts.filter(
          (post) => (post._id || post.id) !== deletedId
        );
        state.savedPostIds = state.savedPostIds.filter((id) => id !== deletedId);
        toast.success("Post deleted successfully!");
      })

      .addCase(toggleSavePostAsync.fulfilled, (state, action) => {
        const { postId, isSaved, savedPosts } = action.payload;
        if (isSaved) {
          if (!state.savedPostIds.includes(postId)) {
            state.savedPostIds.push(postId);
          }
          toast.success("Post saved!");
        } else {
          state.savedPostIds = state.savedPostIds.filter((id) => id !== postId);
          state.savedPosts = state.savedPosts.filter(
            (p) => (p._id || p.id || p) !== postId
          );
          toast.success("Post removed from saved");
        }
        if (Array.isArray(savedPosts)) {
          state.savedPostIds = savedPosts.map((p) => p._id || p.toString());
        }
      })

      .addCase(fetchSavedPostsAsync.pending, (state) => {
        state.savedPostsLoading = true;
      })
      .addCase(fetchSavedPostsAsync.fulfilled, (state, action) => {
        state.savedPostsLoading = false;
        state.savedPosts = action.payload || [];
        state.savedPostIds = (action.payload || []).map((p) => p._id || p.toString());
      })
      .addCase(fetchSavedPostsAsync.rejected, (state) => {
        state.savedPostsLoading = false;
      });
  },
});

export const { clearUserPosts } = postsSlice.actions;
export const postsReducer = postsSlice.reducer;
export const postsSelector = (state) => state.postsReducer;
export default postsSlice.reducer;
