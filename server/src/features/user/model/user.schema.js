// Creating user schema here and model
// Imports
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Curated, stylish avatar pools with strictly categorized gender traits and full hairstyles (DiceBear Avataaars)
export const MALE_AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Mason&top=shortFlat&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Leo&top=shortRound&facialHair=beardLight&facialHairProbability=100",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Ethan&top=shortWaved&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Lucas&top=shortWaved&clothing=hoodie&facialHair=beardMedium&facialHairProbability=100",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Alexander&top=theCaesar&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver&top=theCaesarAndSidePart&facialHair=beardLight&facialHairProbability=100",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aiden&top=frizzle&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Liam&top=shaggy&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Noah&top=dreads01&facialHair=beardMedium&facialHairProbability=100",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Jack&top=winterHat02&accessories=sunglasses&accessoriesProbability=100&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus&top=shortFlat&accessories=wayfarers&accessoriesProbability=100&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Ryan&top=shortWaved&facialHair=beardMajestic&facialHairProbability=100",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Daniel&top=shortRound&clothing=hoodie&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Christian&top=theCaesar&clothing=blazerAndShirt&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Gabriel&top=theCaesarAndSidePart&clothing=blazerAndShirt&facialHair=beardLight&facialHairProbability=100",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Zack&top=hat&accessories=round&accessoriesProbability=100&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Justin&top=shortWaved&accessories=sunglasses&accessoriesProbability=100&facialHair=beardLight&facialHairProbability=100",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Tyler&top=frizzle&clothing=hoodie&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Brandon&top=shortFlat&clothing=graphicShirt&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Nathan&top=shortWaved&clothing=blazerAndSweater&facialHair=beardLight&facialHairProbability=100",
];

export const FEMALE_AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Sophia&top=longButNotTooLong&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Emma&top=straight01&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Mia&top=curvy&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Olivia&top=curly&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Ava&top=bob&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Isabella&top=bun&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Charlotte&top=bigHair&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Amelia&top=straight02&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Harper&top=miaWallace&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Evelyn&top=straightAndStrand&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Chloe&top=froBand&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Luna&top=longButNotTooLong&accessories=round&accessoriesProbability=100&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aria&top=curvy&accessories=sunglasses&accessoriesProbability=100&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&top=bob&clothing=collarAndSweater&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Lily&top=curly&clothing=graphicShirt&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Hannah&top=bun&clothing=blazerAndShirt&facialHairProbability=0",
];

export const NEUTRAL_AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Sam&top=winterHat02&accessories=wayfarers&accessoriesProbability=100&clothing=hoodie&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Taylor&top=hat&accessories=round&accessoriesProbability=100&clothing=graphicShirt&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan&top=shortRound&accessories=sunglasses&accessoriesProbability=100&clothing=blazerAndShirt&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Riley&top=frizzle&accessories=round&accessoriesProbability=100&clothing=hoodie&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Morgan&top=winterHat1&accessoriesProbability=0&clothing=collarAndSweater&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Casey&top=shaggy&accessories=wayfarers&accessoriesProbability=100&clothing=graphicShirt&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&top=dreads01&accessories=sunglasses&accessoriesProbability=100&clothing=hoodie&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Quinn&top=curvy&accessories=round&accessoriesProbability=100&clothing=blazerAndSweater&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Avery&top=shortWaved&accessories=sunglasses&accessoriesProbability=100&clothing=graphicShirt&facialHairProbability=0",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Robin&top=winterHat03&clothing=hoodie&facialHairProbability=0",
];

export const ALL_AVATARS = [...MALE_AVATARS, ...FEMALE_AVATARS, ...NEUTRAL_AVATARS];

export const normalizeGender = (gender) => {
  if (!gender || typeof gender !== "string") return "neutral";
  const g = gender.trim().toLowerCase();

  // Female variations
  if (
    g === "female" ||
    g === "f" ||
    g === "woman" ||
    g === "women" ||
    g === "girl" ||
    g === "she" ||
    g === "her"
  ) {
    return "female";
  }

  // Male variations
  if (
    g === "male" ||
    g === "m" ||
    g === "man" ||
    g === "men" ||
    g === "boy" ||
    g === "he" ||
    g === "him" ||
    g === "guy"
  ) {
    return "male";
  }

  return "neutral";
};

const getHash = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Helper function to generate cool avatars with granular gender detection
export const getDefaultAvatar = (gender, username) => {
  const normGender = normalizeGender(gender);
  const cleanUsername = (username || "instagram").toString().trim().toLowerCase();
  const hash = getHash(cleanUsername);

  if (normGender === "female") {
    return FEMALE_AVATARS[hash % FEMALE_AVATARS.length];
  }
  if (normGender === "male") {
    return MALE_AVATARS[hash % MALE_AVATARS.length];
  }
  return NEUTRAL_AVATARS[hash % NEUTRAL_AVATARS.length];
};

const userSchema = new mongoose.Schema(
  {
    profilePic: {
      type: String,
      default: function () {
        return getDefaultAvatar(this.gender, this.username);
      },
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
          if (value === null || value === undefined || value === "") {
            // Allow null, undefined, and empty string values
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
          if (value === null || value === undefined || value === "") {
            return true;
          }
          const d = new Date(value);
          return !isNaN(d.getTime());
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
      maxLength: [150, "Bio can have 100 characters max!"],
    },
    website: {
      type: String,
    },
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Middlewares
// Hash user password before save using bcrypt library and assign default avatar
userSchema.pre("save", async function (next) {
  const user = this;

  // Auto-generate cool avatar according to gender if not set or if using outdated placeholders
  const isPlaceholder =
    !user.profilePic ||
    user.profilePic.trim() === "" ||
    user.profilePic.includes("pngwing") ||
    user.profilePic.includes("blank-profile-picture") ||
    user.profilePic.includes("placekitten") ||
    user.profilePic.includes("avatar.iran.liara.run") ||
    user.profilePic.includes("images.unsplash.com");

  const isPresetAvatar = user.profilePic && user.profilePic.includes("api.dicebear.com");

  if (isPlaceholder || (user.isModified("gender") && isPresetAvatar)) {
    user.profilePic = getDefaultAvatar(user.gender, user.username || user.name || user.email);
  }

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
  // Generate a random six-digit number
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the resetToken using sha256
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Update user's resetPasswordToken
  this.resetPasswordToken = hashedResetToken;

  // Set expiration time
  this.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  return resetToken;
};

// Creating model
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
