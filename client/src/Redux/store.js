// Creating store here for managing state's through reducer's
// Imports
import { configureStore } from "@reduxjs/toolkit";

// Local import's
import { usersReducer } from "./Reducer/usersReducer";
import { postsReducer } from "./Reducer/postsReducer";
import { commentsReducer } from "./Reducer/commentsReducer";

// Store
const store = configureStore({
  // Reducer's
  reducer: {
    usersReducer,
    postsReducer,
    commentsReducer,
  },
});

// Export store
export default store;
