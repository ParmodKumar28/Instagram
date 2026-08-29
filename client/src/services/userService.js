import apiClient from "./apiClient";

export const userService = {
  signup: (userData) => apiClient.post("/user/signup", userData),
  login: (credentials) => apiClient.post("/user/signin", credentials),
  logout: () => apiClient.get("/user/logout"),
  getUserData: (userId) => apiClient.get(`/user/user-data/${userId}`),
  forgotPasswordOtp: (data) => apiClient.post("/user/forgot-password-otp", data),
  resetPassword: (data) => apiClient.put("/user/reset-password", data),
  updateProfile: (userData) => apiClient.put("/user/update-profile", userData),
  uploadProfilePic: (formData) =>
    apiClient.post("/user/upload-profile-pic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteAccount: () => apiClient.delete("/user/delete-account"),
};

export default userService;
