// Creating user schema here and model
// Imports
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    profilePic: {
      type: String,
    },
    name: {
      type: String,
      min: [2, "Name should be greater than 2 characters!"],
      max: [20, "Name should be less than 20 characters!"],
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
    username: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      sparse: true, // Allow multiple documents to have a null value for this field
      validate: {
        validator: function (value) {
          if (value === null || value === undefined) {
            // Allow null and undefined values
            return true;
          }

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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    stories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
      },
    ],
    reels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Middlewares
// Hash user password before save using bcrypt library
userSchema.pre("save", async function (next) {
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

// JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_Secret, {
    expiresIn: process.env.JWT_Expire,
  });
};

// user password compare
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate resetPasswordToken
userSchema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hashing and updating user resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Creating model
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
