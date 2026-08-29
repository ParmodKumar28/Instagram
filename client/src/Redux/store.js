// Configured Redux Store
import { configureStore } from "@reduxjs/toolkit";

import { usersReducer } from "./Reducer/usersReducer";
import { postsReducer } from "./Reducer/postsReducer";
import { followersReducer } from "./Reducer/followersReducer";

const store = configureStore({
  reducer: {
    usersReducer,
    postsReducer,
    followersReducer,
  },
});

export default store;

