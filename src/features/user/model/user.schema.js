// Creating user schema here and model
// Imports
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    profilePic: {
      type: Buffer,
    },
    name: {
      type: String,
      min: [2, "Name should be greater than 2 characters!"],
      max: [20, "Name should be less than 20 characters!"],
    },
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: function (value) {
          // Use a regular expression for email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email address!",
      },
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      validate: {
        validator: function (value) {
          const mobileNumberRegex = /^[0-9]{10}$/;
          return mobileNumberRegex.test(value);
        },
        message: "Invalid mobile number!",
      },
    },
    password: {
      type: String,
      required: true,
      min: [8, "A strong password should contain minimum 8 characters!"],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value);
        },
        message: "Invalid date of birth",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    accountType: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    bio: {
      type: String,
      minLength: [6, "Bio should have atleast 6 characters!"],
      maxLength: [100, "Bio can have 100 characters max!"],
    },
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post",
      },
    ],
    stories: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Story",
      },
    ],
    reels: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Reel",
      },
    ],
  },
  { timestamps: true }
);

// Middlewares
userSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// Creating model
const userModel = mongoose.model("User", userSchema);
export default userModel;
