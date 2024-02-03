// Creating user repository here for the database
// Imports
import userModel from "./user.schema.js";

// Signup db
export const signupDb = async (user) => {
  const newUser = await new userModel(user);
  await newUser.save();
  return newUser;
};
