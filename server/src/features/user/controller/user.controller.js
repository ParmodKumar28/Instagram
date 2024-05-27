// Creating here user controller to handle communication between routes and the model/database
// Imports
import { filePath } from "../../../app.js";
import uploadCloudinary from "../../../utils/cloudinary.js";
import { sendResetPasswordMail } from "../../../utils/email/PasswordResetEmail.js";
import { sendWelcomeMail } from "../../../utils/email/WelcomeEmail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  deleteUserDb,
  findUserForPasswordResetDb,
  getUserDataDb,
  signupDb,
  updateUserDb,
  userByEmailDb,
} from "../model/user.repository.js";
import crypto from "crypto";

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
    // Creating jwt token and adding to cookie
    await sendToken(newUser, res, 200);
    // Sending welcome email
    await sendWelcomeMail(email, name);
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

// Post signIn
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new ErrorHandler(400, "Please provide both email & password!")
      );
    }

    // Checking if the credentials are correct or not
    const user = await userByEmailDb(email);
    if (!user) {
      return next(
        new ErrorHandler(401, "No user exist by this email register yourself!")
      );
    }
    // Comparing password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return next(new ErrorHandler(401, "Wrong password!"));
    }
    // Generating token and sending token with response
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    // Removing token from the cookie to logout
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({ success: true, msg: "logout successful!" });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Update profile user
export const updateUserProfile = async (req, res, next) => {
  try {
    const updatedData = req.body;

    // Check if the updatedData object is empty
    if (Object.keys(updatedData).length === 0) {
      return next(new ErrorHandler(400, "Please provide data to update!"));
    }

    const userId = req.user._id;
    const updatedUser = await updateUserDb(updatedData, userId);

    if (!updatedUser) {
      return next(new ErrorHandler(404, "User not found or data not updated."));
    }

    return res
      .status(201)
      .json({ success: true, updatedUser, msg: "User data updated!" });
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};

// Upload profile pic
export const addProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(
        new ErrorHandler(400, "Please add a image file in request body!")
      );
    }
    // User
    const user = req.user;
    // Uploading image on the cloudinary and then adding to database
    // const imageUrl = await uploadCloudinary(req.file.path);
    const imageUrl = `${filePath}/${req.file.path}`;
    if (!imageUrl) {
      return next(
        new ErrorHandler(
          400,
          "Image not uploaded on cloudinary something went wrong!"
        )
      );
    }
    user.profilePic = imageUrl;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};

// Get user data
export const userData = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return next(new ErrorHandler(404, "User id not recieved!"));
    }
    const user = await getUserDataDb(userId);
    if (!user) {
      return next(new ErrorHandler(404, "No user found by this id!"));
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};

// Forgot password otp sending
export const forgotPasswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(
        new ErrorHandler(
          400,
          "Please, provide registered email to receive otp!"
        )
      );
    }
    const user = await userByEmailDb(email);
    if (!user) {
      return next(
        new ErrorHandler(
          400,
          "No user registered with this email, please provide valid email!"
        )
      );
    } else {
      // Creating otp and saving to user
      const resetToken = await user.getResetPasswordToken();
      await user.save();
      const resetPasswordUrl = "http://localhost:5173/reset-password";

      // Sending email
      await sendResetPasswordMail(
        email,
        user.name,
        resetToken,
        resetPasswordUrl
      );
      res.status(200).json({ success: true, msg: "Reset mail sent!" });
    }
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.body;
    if (!resetToken) {
      return next(new ErrorHandler(400, "Please give otp token!"));
    }

    // Creating token hash to compare with token stored on user
    const hashedToken = await crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Finding user based on the hashed token in db
    const user = await findUserForPasswordResetDb(hashedToken);
    if (!user || user.resetPasswordExpire < Date.now()) {
      return next(new ErrorHandler(400, "Token is expired or invalid!"));
    }

    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(
        new ErrorHandler(400, "Password and confirm password don't match!")
      );
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ success: true, msg: "Password reset successful!" });
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};

// Update password
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(
        new ErrorHandler(
          400,
          "Please provide current password and new and confirm password!"
        )
      );
    }
    const user = await getUserDataDb(req.user._id);
    // Comparing current password here if matches then updating password
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(
        new ErrorHandler(400, "Current password doesn't match enter valid!")
      );
    }
    if (newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(400, "new password and confirm password do not match!")
      );
    }
    // Updating password in the db
    user.password = newPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, msg: "Password updated successfully!" });
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};

// Deleting user account
export const deleteAccount = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserDb(req.user._id);
    if (!deletedUser) {
      return next(
        new ErrorHandler(
          400,
          "User account not deleted or not user found by this id!"
        )
      );
    }
    return res
      .status(200)
      .json({ success: true, msg: "Account deleted successfully!" });
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};
