// User's reducer is here here all state management is handled related to users and handlers
// Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import BASE_URL from "../baseUrl";

// Base url for user's
const BASE_URL_USERS = `${BASE_URL}/user`;

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
      // If response is ok then return response.data
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
// Sign up ends

// Login
export const loginAsync = createAsyncThunk(
  "users/login",
  async ({ email, password }) => {
    try {
      // Sending request to the server
      const response = await axios.post(`${BASE_URL_USERS}/signin`, {
        email,
        password,
      });
      // If response is ok then return response.data
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
    const response = await axios.get(`${BASE_URL_USERS}/logout`, {
      headers: {
        "auth-token": `${localStorage.getItem("auth-token")}`,
      },
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
// Logout end's

// Get user details
export const userDataAsync = createAsyncThunk(
  "users/details",
  async ({ userId }) => {
    try {
      // Sending request to the server
      const response = await axios.get(
        `${BASE_URL_USERS}/user-data/${userId}`,
        {
          headers: {
            "auth-token": `${localStorage.getItem("auth-token")}`,
          },
        }
      );
      // If response is ok then return response.data
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
// Get user details end's

// Forgot password otp
export const forgotPasswordOtpAsync = createAsyncThunk(
  "users/forgotPassword",
  async ({ email }) => {
    try {
      // Sending request to the server
      const response = await axios.post(
        `${BASE_URL_USERS}/forgot-password-otp`,
        { email },
        {
          headers: {
            "auth-token": `${localStorage.getItem("auth-token")}`,
          },
        }
      );
      // If response is ok then return response.data
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
// Forgot password otp end's

// Reset password start's
export const resetPasswordAsync = createAsyncThunk(
  "users/reset-password",
  async ({ newPassword, confirmPassword, otp }) => {
    try {
      // Sending request to the server
      const response = await axios.put(
        `${BASE_URL_USERS}/reset-password`,
        {
          password: newPassword,
          confirmPassword: confirmPassword,
          resetToken: otp,
        },
        {
          headers: {
            "auth-token": `${localStorage.getItem("auth-token")}`,
          },
        }
      );
      // If response is ok then return response.data
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
// Reset password start's end's

// Update profile
export const updateProfileAsync = createAsyncThunk(
  "users/updateProfile",
  async (userData) => {
    try {
      // Sending request to the server
      const response = await axios.put(
        `${BASE_URL_USERS}/update-profile`,
        userData,
        {
          headers: {
            Accept: "application/form-data",
            "auth-token": `${localStorage.getItem("auth-token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      // If response is ok then return response.data
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
// Update profile ends

// Upload profile picture
export const uploadProfilePicAsync = createAsyncThunk(
  "users/uploadProfilePic",
  async (formData) => {
    try {
      // Sending request to the server
      const response = await axios.post(
        `${BASE_URL_USERS}/upload-profile-pic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "auth-token": `${localStorage.getItem("auth-token")}`,
          },
        }
      );
      // If response is ok then return response.data
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
// Upload profile picture ends

// Initial State
const INITIAL_STATE = {
  isSignIn: false,
  token: "",
  signedUser: {},
  signUpLoading: false,
  loginLoading: false,
  userLoading: true,
  userData: {},
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
      // Stringify objects before setting them as cookies
      Cookies.set("token", action.payload.token);
      Cookies.set("isSignIn", state.isSignIn.toString()); // Convert boolean to string
      Cookies.set("signedUser", JSON.stringify(state.signedUser));
      Cookies.set("userId", state.signedUser._id);
      localStorage.setItem("auth-token", action.payload.token);
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
      // Stringify objects before setting them as cookies
      Cookies.set("token", action.payload.token);
      Cookies.set("isSignIn", state.isSignIn.toString()); // Convert boolean to string
      Cookies.set("signedUser", JSON.stringify(state.signedUser));
      Cookies.set("userId", state.signedUser._id);
      localStorage.setItem("auth-token", action.payload.token);
      toast.success("Login Successful!");
    });

    // When rejected
    builder.addCase(loginAsync.rejected, (state, action) => {
      state.loginLoading = false;
    });
    // loginAsync thunk ends

    // Get userDataAsync extra reducer's start's here
    builder.addCase(userDataAsync.pending, (state, action) => {
      state.userLoading = true;
    });
    builder.addCase(userDataAsync.fulfilled, (state, action) => {
      state.userLoading = false;
      state.userData = action.payload;
    });
    builder.addCase(userDataAsync.rejected, (state, action) => {
      state.userLoading = false;
    });
    // Get userDataAsync ends

    // logoutAsync thunk extra reducer's start's here
    // When pending
    builder.addCase(logoutAsync.pending, (state, action) => {});

    // When fulfilled
    builder.addCase(logoutAsync.fulfilled, (state, action) => {
      // Setting state
      Cookies.remove("isSignIn"); //Removing isSignin from cookie
      Cookies.remove("signedUser");
      Cookies.remove("userId");
      localStorage.removeItem("auth-token");
      state.isSignIn = false;
      state.signedUser = {};
      state.token = "";
      toast.success("Logout Successful!"); // Toast notification
    });

    // When rejected
    builder.addCase(logoutAsync.rejected, (state, action) => {});
    // logoutAsync thunk extra reducer's end's here

    // Forgot password thunks extra reducer's
    // When pending
    builder.addCase(forgotPasswordOtpAsync.pending, (state, action) => {});

    // When fulfilled
    builder.addCase(forgotPasswordOtpAsync.fulfilled, (state, action) => {
      toast.success(action.payload.msg);
    });

    // When rejected
    builder.addCase(forgotPasswordOtpAsync.rejected, (state, action) => {});
    // Forgot password thunks extra reducer's end's

    // Reset password thunks extra reducer's
    // When pending
    builder.addCase(resetPasswordAsync.pending, (state, action) => {});

    // When fulfilled
    builder.addCase(resetPasswordAsync.fulfilled, (state, action) => {
      toast.success(action.payload.msg);
    });

    // When rejected
    builder.addCase(resetPasswordAsync.rejected, (state, action) => {});
    // Reset password thunks extra reducer's end's

    // updateProfileAsync thunk extra reducers start here
    // When pending
    builder.addCase(updateProfileAsync.pending, (state, action) => {
      state.userLoading = true;
    });

    // When fulfilled
    builder.addCase(updateProfileAsync.fulfilled, (state, action) => {
      state.userLoading = false;
      // Update user data in state if necessary
      // state.userData = action.payload;
      toast.success("Profile updated successfully!");
    });

    // When rejected
    builder.addCase(updateProfileAsync.rejected, (state, action) => {
      state.userLoading = false;
    });
    // updateProfileAsync thunk extra reducers end here

    // uploadProfilePicAsync thunk extra reducers start here
    // When pending
    builder.addCase(uploadProfilePicAsync.pending, (state, action) => {
      state.userLoading = true;
    });

    // When fulfilled
    builder.addCase(uploadProfilePicAsync.fulfilled, (state, action) => {
      state.userLoading = false;
      // Update user data in state if necessary
      // state.userData = action.payload;
      toast.success("Profile picture uploaded successfully!");
    });

    // When rejected
    builder.addCase(uploadProfilePicAsync.rejected, (state, action) => {
      state.userLoading = false;
    });
  },
});

// Extract user reducer from the slice
export const usersReducer = usersSlice.reducer;

// Extract actions from the slice

// State from the reducer and exporting state
export const usersSelector = (state) => state.usersReducer;
