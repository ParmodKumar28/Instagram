// Creating here user controller to handle communication between routes and the model/database
// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { signupDb } from "../model/user.repository.js";

// Post SignUp function
export const signUp = async (req, res, next) => {
  try {
    const { email, name, username, password } = req.body;
    if (!email) {
      return next(new ErrorHandler(400, "Please enter email!"));
    }
    if (!name) {
      return next(new ErrorHandler(400, "Please enter name!"));
    }
    if (!username) {
      return next(new ErrorHandler(400, "Please enter username!"));
    }
    if (!password) {
      return next(new ErrorHandler(400, "Please enter password!"));
    }
    // Calling db function
    const newUser = await signupDb({ email, name, username, password });
    if (!newUser) {
      return next(new ErrorHandler(400, "User not created!"));
    } else {
      return res.status(201).json({
        success: true,
        msg: "user created successfully!",
        newUser,
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.username) {
        // Duplicate username error
        return next(
          new ErrorHandler(
            401,
            "Username already taken. Please choose a different username."
          )
        );
      } else if (error.keyPattern && error.keyPattern.email) {
        // Duplicate email error
        return next(
          new ErrorHandler(
            401,
            "Email address already in use. Please use a different email."
          )
        );
      }
    }
    return next(new ErrorHandler(400, error));
  }
};
