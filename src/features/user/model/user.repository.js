// Creating user repository here for the database
// Imports
import userModel from "./user.schema.js";

// Signup db
export const signupDb = async (user) => {
  const newUser = await new userModel(user);
  await newUser.save();
  return newUser;
};

// SignIn checking email and password with db
export const userByEmail = async (email) => {
  return await userModel.findOne({ email });
};