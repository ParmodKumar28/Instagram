import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { userService } from "../../services";

// Helper to safely load stored user from localStorage
const getStoredUser = () => {
  try {
    const user = localStorage.getItem("signedUser");
    return user ? JSON.parse(user) : {};
  } catch {
    return {};
  }
};

// Async Thunks
export const signUpAsync = createAsyncThunk(
  "users/signup",
  async ({ email, fullName, username, password }) => {
    try {
      const response = await userService.signup({
        name: fullName,
        email,
        username,
        password,
      });
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Signup failed");
      throw error;
    }
  }
);

export const loginAsync = createAsyncThunk(
  "users/login",
  async ({ identifier, password }) => {
    try {
      const response = await userService.login({ identifier, password });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Login failed");
      throw error;
    }
  }
);

export const logoutAsync = createAsyncThunk("users/logout", async () => {
  try {
    const response = await userService.logout();
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.customMessage || "Logout failed");
    throw error;
  }
});

export const userDataAsync = createAsyncThunk(
  "users/details",
  async ({ userId }) => {
    try {
      const response = await userService.getUserData(userId);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to fetch user details");
      throw error;
    }
  }
);

export const forgotPasswordOtpAsync = createAsyncThunk(
  "users/forgotPassword",
  async ({ email }) => {
    try {
      const response = await userService.forgotPasswordOtp({ email });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to send reset email");
      throw error;
    }
  }
);

export const resetPasswordAsync = createAsyncThunk(
  "users/reset-password",
  async ({ newPassword, confirmPassword, otp }) => {
    try {
      const response = await userService.resetPassword({
        password: newPassword,
        confirmPassword,
        resetToken: otp,
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to reset password");
      throw error;
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  "users/updateProfile",
  async (userData) => {
    try {
      const response = await userService.updateProfile(userData);
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to update profile");
      throw error;
    }
  }
);

export const uploadProfilePicAsync = createAsyncThunk(
  "users/uploadProfilePic",
  async (formData) => {
    try {
      const response = await userService.uploadProfilePic(formData);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to upload profile picture");
      throw error;
    }
  }
);

export const deleteAccountAsync = createAsyncThunk(
  "users/deleteAccount",
  async () => {
    try {
      const response = await userService.deleteAccount();
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      toast.error(error.customMessage || "Failed to delete account");
      throw error;
    }
  }
);

const storedToken = localStorage.getItem("auth-token") || "";
const storedUser = getStoredUser();

const INITIAL_STATE = {
  isSignIn: Boolean(storedToken),
  token: storedToken,
  signedUser: storedUser,
  userId: storedUser?._id || "",
  signUpLoading: false,
  loginLoading: false,
  userLoading: false,
  userData: null,
};

const handleAuthSuccess = (state, action, message) => {
  state.isSignIn = true;
  state.token = action.payload.token;
  state.signedUser = action.payload.user;
  state.userId = action.payload.user?._id || "";

  localStorage.setItem("auth-token", action.payload.token);
  localStorage.setItem("signedUser", JSON.stringify(action.payload.user));

  toast.success(message);
};

const handleAuthClear = (state, message) => {
  state.isSignIn = false;
  state.signedUser = {};
  state.userId = "";
  state.token = "";
  state.userData = null;

  localStorage.removeItem("auth-token");
  localStorage.removeItem("signedUser");

  toast.success(message);
};

const usersSlice = createSlice({
  name: "users",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Sign up
      .addCase(signUpAsync.pending, (state) => {
        state.signUpLoading = true;
      })
      .addCase(signUpAsync.fulfilled, (state, action) => {
        state.signUpLoading = false;
        handleAuthSuccess(state, action, "Signed In!");
      })
      .addCase(signUpAsync.rejected, (state) => {
        state.signUpLoading = false;
      })

      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loginLoading = true;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loginLoading = false;
        handleAuthSuccess(state, action, "Login Successful!");
      })
      .addCase(loginAsync.rejected, (state) => {
        state.loginLoading = false;
      })

      // User details
      .addCase(userDataAsync.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(userDataAsync.fulfilled, (state, action) => {
        state.userLoading = false;
        state.userData = action.payload;
      })
      .addCase(userDataAsync.rejected, (state) => {
        state.userLoading = false;
      })

      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        handleAuthClear(state, "Logout Successful!");
      })

      // Password recovery
      .addCase(forgotPasswordOtpAsync.fulfilled, (_, action) => {
        toast.success(action.payload.msg || "OTP sent successfully!");
      })
      .addCase(resetPasswordAsync.fulfilled, (_, action) => {
        toast.success(action.payload.msg || "Password reset successfully!");
      })

      // Profile Update
      .addCase(updateProfileAsync.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.userLoading = false;
        if (action.payload.updatedUser) {
          state.signedUser = { ...state.signedUser, ...action.payload.updatedUser };
          localStorage.setItem("signedUser", JSON.stringify(state.signedUser));
        }
        toast.success(action.payload.msg || "Profile updated successfully!");
      })
      .addCase(updateProfileAsync.rejected, (state) => {
        state.userLoading = false;
      })

      // Profile Picture Upload
      .addCase(uploadProfilePicAsync.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(uploadProfilePicAsync.fulfilled, (state, action) => {
        state.userLoading = false;
        if (action.payload.profilePic) {
          state.signedUser = {
            ...state.signedUser,
            profilePic: action.payload.profilePic,
          };
          localStorage.setItem("signedUser", JSON.stringify(state.signedUser));
        }
        toast.success(action.payload.message || "Profile picture uploaded successfully!");
      })
      .addCase(uploadProfilePicAsync.rejected, (state) => {
        state.userLoading = false;
      })

      // Delete Account
      .addCase(deleteAccountAsync.fulfilled, (state) => {
        handleAuthClear(state, "Account deleted successfully!");
      });
  },
});

export const usersReducer = usersSlice.reducer;
export const usersSelector = (state) => state.usersReducer;

