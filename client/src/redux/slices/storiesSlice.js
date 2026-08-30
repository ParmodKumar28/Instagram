import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { storyService } from "../../services";
import toast from "react-hot-toast";

const initialState = {
  feedStories: [],
  loading: false,
  creating: false,
  error: null,
};

export const fetchFeedStoriesAsync = createAsyncThunk(
  "stories/fetchFeedStories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await storyService.getFeedStories();
      return response.data?.stories || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load stories"
      );
    }
  }
);

export const createStoryAsync = createAsyncThunk(
  "stories/createStory",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await storyService.createStory(formData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to upload story");
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload story"
      );
    }
  }
);

export const markStoryViewedAsync = createAsyncThunk(
  "stories/markStoryViewed",
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await storyService.markStoryViewed(storyId);
      return { storyId, story: response.data?.story };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const likeStoryAsync = createAsyncThunk(
  "stories/likeStory",
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await storyService.likeStory(storyId);
      return { storyId, isLiked: response.data?.isLiked, likesCount: response.data?.likesCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const replyStoryAsync = createAsyncThunk(
  "stories/replyStory",
  async ({ storyId, text }, { rejectWithValue }) => {
    try {
      const response = await storyService.replyStory(storyId, text);
      return { storyId, reply: response.data?.reply };
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to send reply");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteStoryAsync = createAsyncThunk(
  "stories/deleteStory",
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await storyService.deleteStory(storyId);
      return { storyId, msg: response.data?.msg };
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete story");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const storiesSlice = createSlice({
  name: "stories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Feed Stories
      .addCase(fetchFeedStoriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedStoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.feedStories = action.payload || [];
      })
      .addCase(fetchFeedStoriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Story
      .addCase(createStoryAsync.pending, (state) => {
        state.creating = true;
      })
      .addCase(createStoryAsync.fulfilled, (state, action) => {
        state.creating = false;
        toast.success("Story added to your sequence!");
      })
      .addCase(createStoryAsync.rejected, (state) => {
        state.creating = false;
      })

      // Like Story
      .addCase(likeStoryAsync.fulfilled, (state, action) => {
        const { storyId, isLiked } = action.payload;
        state.feedStories.forEach((group) => {
          group.stories.forEach((s) => {
            if (s._id === storyId) {
              s.isLikedByMe = isLiked;
            }
          });
        });
      })

      // Reply Story
      .addCase(replyStoryAsync.fulfilled, (state, action) => {
        toast.success("Reply sent to story author!");
      })

      // Mark Viewed
      .addCase(markStoryViewedAsync.fulfilled, (state, action) => {
        const { storyId } = action.payload;
        // Mark the story as viewed in state
        state.feedStories.forEach((group) => {
          let allViewed = true;
          group.stories.forEach((s) => {
            if (s._id === storyId) {
              s.isViewedByMe = true;
            }
            if (!s.isViewedByMe) {
              allViewed = false;
            }
          });
          if (allViewed && !group.isSelf) {
            group.hasUnviewed = false;
          }
        });
      })

      // Delete Story
      .addCase(deleteStoryAsync.fulfilled, (state, action) => {
        const { storyId } = action.payload;
        state.feedStories = state.feedStories
          .map((group) => {
            const remaining = group.stories.filter((s) => s._id !== storyId);
            return { ...group, stories: remaining };
          })
          .filter((group) => group.stories.length > 0 || group.isSelf);
        toast.success("Story deleted");
      });
  },
});

export const storiesReducer = storiesSlice.reducer;
export const storiesSelector = (state) => state.storiesReducer;
export default storiesSlice.reducer;
