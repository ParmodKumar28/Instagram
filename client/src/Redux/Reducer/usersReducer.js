// User's reducer is here here all state management is handled realted to user's and handler's
// Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// Async Thunks

export const signUpAsync = createAsyncThunk(
  "users/signup",
  async ({ email, fullName, username, password }) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/user/signup",
        {
          name: fullName,
          email,
          username,
          password,
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        // Display the error message in a toast
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  }
);

// Initial State
const INITIAL_STATE = {
  isSignIn: false,
  signedUser: {},
  loading: true,
};

// Slice
const usersSlice = createSlice({
  name: "users",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {},
});

// Extract user reducer from the slice
export const usersReducer = usersSlice.reducer;

// Extract action's from the slice

// State from the reducer and exporting state
export const usersSelector = (state) => state.usersReducer;
