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
export const userByEmail = async (email) => {
  return await UserModel.findOne({ email });
};

// Updating user data into the database
export const updateUserDb = async (updatedData, userId) => {
  return await UserModel.findByIdAndUpdate(userId, updatedData, {
    new: true,
    runValidators: true
  });
}