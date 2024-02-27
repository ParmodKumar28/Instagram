// User's reducer is here here all state management is handled related to users and handlers
// Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// Base url for user's
const BASE_URL_USERS = "http://localhost:8000/api/user";

// Setting Axios default for credentials
axios.defaults.withCredentials = true;

// Async Thunks
// Sign up
export const signUpAsync = createAsyncThunk(
  "users/signup",
  async ({ email, fullName, username, password }) => {
    try {
      // Sending request to the server
      const response = await axios.post(`${BASE_URL_USERS}/signup`, {
        name: fullName,
        email,
        username,
        password,
      });
      // If response is ok then return repsonse.data
      if (response.statusText === "OK") {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Display the error message in a toast
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error; // Throw the error to trigger the rejected case
    }
  }
);
// Sign up ends

// Login
export const loginAsync = createAsyncThunk(
  "users/lgin",
  async ({ email, password }) => {
    try {
      // Sending request to the server
      const response = await axios.post(`${BASE_URL_USERS}/signin`, {
        email,
        password,
      });
      // If response is ok then return repsonse.data
      if (response.statusText === "OK") {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Display the error message in a toast
      } else {
        toast.error("An error occurred. Please try again later.");
      }
      throw error;
    }
  }
);
// Login ends

// Logout start's
export const logoutAsync = createAsyncThunk("users/logout", async () => {
  try {
    // Sending request to the server
    const response = await axios.get(`${BASE_URL_USERS}/logout`);
    // If response is ok then return repsonse.data
    if (response.statusText === "OK") {
      return response.data;
    }
  } catch (error) {
    console.log(error);
    if (error.response && error.response.data && error.response.data.error) {
      toast.error(error.response.data.error); // Display the error message in a toast
    } else {
      toast.error("An error occurred. Please try again later.");
    }
    throw error;
  }
});
// Logout end's

// Get user details
export const userDataAsync = createAsyncThunk("users/details", async () => {
  try {
    // Sending request to the server
    const response = await axios.get(`${BASE_URL_USERS}/user-data`, {
      withCredentials: true,
    });
    // If response is ok then return repsonse.data
    if (response.statusText === "OK") {
      return response.data;
    }
  } catch (error) {
    console.log(error);
    if (error.response && error.response.data && error.response.data.error) {
      toast.error(error.response.data.error); // Display the error message in a toast
    } else {
      toast.error("An error occurred. Please try again later.");
    }
    throw error;
  }
});

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
  // Slice name
  name: "users",

  // Initial State
  initialState: INITIAL_STATE,

  // Reducers
  reducers: {},

  // Extra reducer's
  extraReducers: (builder) => {
    // signUpAsync thunk extra reducer's start's here
    // When pending
    builder.addCase(signUpAsync.pending, (state, action) => {
      state.signUpLoading = true;
    });

    // When fulfilled
    builder.addCase(signUpAsync.fulfilled, (state, action) => {
      state.signUpLoading = false;
      state.isSignIn = true;
      state.token = action.payload.token;
      state.signedUser = action.payload.user;
      Cookies.set("token", action.payload.token); // Storing fresh token to cooke
      Cookies.set("isSignIn", state.isSignIn); // Storing isSignIn to cookie
      toast.success("Signed In!"); // Showing notification
    });

    // When rejected
    builder.addCase(signUpAsync.rejected, (state, action) => {
      state.signUpLoading = false; // Set signUpLoading to false in case of rejection
    });
    // signUpAsync thunk extra reducer's end's

    // loginAsync thunk start's here
    // When pending
    builder.addCase(loginAsync.pending, (state, action) => {
      state.loginLoading = true;
    });

    // When fulfilled
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      state.loginLoading = false;
      state.token = action.payload.token;
      state.signedUser = action.payload.user;
      state.isSignIn = true;
      Cookies.set("token", action.payload.token); // Storing fresh token to cooke
      Cookies.set("isSignIn", state.isSignIn); // Storing isSignIn to cookie
      toast.success("Login Successful!");
    });

    // When rejected
    builder.addCase(loginAsync.rejected, (state, action) => {
      state.loginLoading = false;
    });
    // loginAsync thunk ends

    // Get userDataAsync extra reducer's start's here
    // When pending
    builder.addCase(userDataAsync.pending, (state, action) => {});

    // When fulfilled
    builder.addCase(userDataAsync.fulfilled, (state, action) => {
      console.log(action.payload);
    });

    // When rejected
    builder.addCase(userDataAsync.rejected, (state, action) => {});
    // Get userDataAsync ends

    // logoutAsync thunk extra reducer's start's here
    // When pending
    builder.addCase(logoutAsync.pending, (state, action) => {});

    // When fulfilled
    builder.addCase(logoutAsync.fulfilled, (state, action) => {
      // Setting state
      Cookies.remove("isSignIn"); //Removing isSignin from cookie
      state.isSignIn = false;
      state.signedUser = {};
      state.token = "";
      console.log(action.payload);
      toast.success("Logout Successful!"); // Toast notification
    });

    // When rejected
    builder.addCase(logoutAsync.rejected, (state, action) => {});
    // logoutAsync thunk extra reducer's end's here
  },
});

// Extract user reducer from the slice
export const usersReducer = usersSlice.reducer;

// Extract actions from the slice

// State from the reducer and exporting state
export const usersSelector = (state) => state.usersReducer;
