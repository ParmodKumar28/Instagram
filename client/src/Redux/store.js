import { configureStore } from "@reduxjs/toolkit";
import { usersReducer } from "./slices/usersSlice";
import { postsReducer } from "./slices/postsSlice";
import { followersReducer } from "./slices/followersSlice";

export const store = configureStore({
  reducer: {
    usersReducer,
    postsReducer,
    followersReducer,
  },
});

export default store;
