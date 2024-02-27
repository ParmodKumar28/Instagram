// Creating store here for managing state's through reducer's
// Imports
import { configureStore } from "@reduxjs/toolkit";

// Local import's
import { usersReducer } from "./Reducer/usersReducer";

// Store
const store = configureStore({
  // Reducer's
  reducer: {
    usersReducer,
  },
});

// Export store
export default store;
