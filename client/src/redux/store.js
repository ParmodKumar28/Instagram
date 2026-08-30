import { configureStore } from "@reduxjs/toolkit";
import { usersReducer } from "./slices/usersSlice";
import { postsReducer } from "./slices/postsSlice";
import { followersReducer } from "./slices/followersSlice";
import { storiesReducer } from "./slices/storiesSlice";
import { chatReducer } from "./slices/chatSlice";

export const store = configureStore({
  reducer: {
    usersReducer,
    postsReducer,
    followersReducer,
    storiesReducer,
    chatReducer,
  },
});

export default store;
