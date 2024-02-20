// Creating user repository here for the database
// Imports
import UserModel from "./user.schema.js";

// Signup db
export const signupDb = async (user) => {
  const newUser = await new UserModel(user);
  await newUser.save();
  return newUser;
};

// SignIn checking email and password with db
export const userByEmailDb = async (email) => {
  return await UserModel.findOne({ email });
};

// Updating user data into the database
export const updateUserDb = async (updatedData, userId) => {
  return await UserModel.findByIdAndUpdate(userId, updatedData, {
    new: true,
    runValidators: true,
  });
};

// Getting single user data from db
export const getUserDataDb = async (userId) => {
  return await UserModel.findById(userId)
    .select("-password")
    .populate("requests", "name username profilePic")
    .populate("followers", "name username profilePic")
    .populate("following", "name username profilePic")
    .populate("posts");
};

// Find user for password reset by hashed token
export const findUserForPasswordResetDb = async (hashedToken) => {
  return await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
};

// Deleting user
export const deleteUserDb = async (userId) => {
  return await UserModel.findByIdAndDelete(userId);
};
