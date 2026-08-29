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
        return response.data.posts;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to fetch user posts");
      throw error;
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

const INITIAL_STATE = {
  postsLoading: true,
  addPostLoad: false,
  posts: [],
  userPostsLoading: false,
  userPosts: [],
  singlePostLoading: false,
  singlePost: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState: INITIAL_STATE,
  reducers: {},
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
      })
      .addCase(fetchUserPostsAsync.fulfilled, (state, action) => {
        state.userPostsLoading = false;
        state.userPosts = action.payload || [];
      })
      .addCase(fetchUserPostsAsync.rejected, (state) => {
        state.userPostsLoading = false;
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
        toast.success("Post deleted successfully!");
      });
  },
});

export const postsReducer = postsSlice.reducer;
export const postsSelector = (state) => state.postsReducer;
export default postsSlice.reducer;
