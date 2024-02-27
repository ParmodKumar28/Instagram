// User's reducer is here here all state management is handled related to users and handlers
// Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// Async Thunks
export const signUpAsync = createAsyncThunk(
  "users/signup",
  async ({ email, fullName, username, password }, { getState }) => {
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
      if (response.statusText === "OK") {
        return response.data;
      }
      console.log(response);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        // Display the error message in a toast
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error; // Throw the error to trigger the rejected case
    }
  }
);

// Initial State
const INITIAL_STATE = {
  isSignIn: false,
  token: "",
  signedUser: {},
  signUpLoading: false,
  loginLoading: false,
};

// Slice
const usersSlice = createSlice({
  name: "users",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signUpAsync.pending, (state, action) => {
      state.signUpLoading = true;
    });
    builder.addCase(signUpAsync.fulfilled, (state, action) => {
      state.signUpLoading = false;
      state.isSignIn = true;
      state.token = action.payload.token;
      state.signedUser = action.payload.user;

      // Showing notification
      toast.success("Signed In!");
    });
    builder.addCase(signUpAsync.rejected, (state, action) => {
      state.signUpLoading = false; // Set signUpLoading to false in case of rejection
    });
  },
});

// Extract user reducer from the slice
export const usersReducer = usersSlice.reducer;

// Extract actions from the slice

// State from the reducer and exporting state
export const usersSelector = (state) => state.usersReducer;
