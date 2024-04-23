import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL_COMMENTS = "http://localhost:8000/api/comment";

axios.defaults.withCredentials = true;

// Add comment
export const addCommentAsync = createAsyncThunk(
  "comments/add",
  async ({ postId, comment }) => {
    try {
      const response = await axios.post(`${BASE_URL_COMMENTS}/add/${postId}`, {
        comment,
      });
      if (response.status === 201) {
        return response.data.comment; // Return the new comment
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

// Async thunk to fetch comments for a specific post
export const getCommentsAsync = createAsyncThunk(
  "comments/get",
  async (postId) => {
    try {
      const response = await axios.get(`${BASE_URL_COMMENTS}/${postId}`);
      if (response.status === 200) {
        return response.data.comments; // Return the fetched comments
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

const INITIAL_STATE = {
  commentsLoading: false,
  comments: [],
};

const commentsSlice = createSlice({
  name: "comments",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    // Add comment's
    builder
      .addCase(addCommentAsync.pending, (state, action) => {
        state.commentsLoading = true;
      })
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        state.commentsLoading = false;
        toast.success("Comment added");
      })
      .addCase(addCommentAsync.rejected, (state, action) => {
        state.commentsLoading = false;
      })

      //   Get comment's
      .addCase(getCommentsAsync.pending, (state, action) => {
        state.commentsLoading = true;
      })
      .addCase(getCommentsAsync.fulfilled, (state, action) => {
        state.commentsLoading = false;
        console.log(action.payload);
        state.comments = action.payload; // Update comments in the state
      })
      .addCase(getCommentsAsync.rejected, (state, action) => {
        state.commentsLoading = false;
      });
  },
});

export const commentsReducer = commentsSlice.reducer;
export const commentsSelector = (state) => state.commentsReducer;