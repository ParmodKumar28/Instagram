// Here, iam creating the server using Express and routing and all
// Dotenv config at the top here
import "./dotenv.js";

// Imports
import express from "express";
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./middlewares/errorHandlerMiddleware.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

// Routers imported
import userRouter from "./features/user/routes/user.routes.js";
import postsRouter from "./features/posts/routes/posts.routes.js";
import likesRouter from "./features/likes/routes/likes.routes.js";
import commentsRouter from "./features/comments/routes/comment.routes.js";
import followersRouter from "./features/followers/routes/follower.routes.js";

// Server
const app = express();

// Setting up cors
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend origin
    credentials: true, // Allow credentials (cookies)
  })
);

// Parsing cookies
app.use(cookieParser());

// Parsing data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuring cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Default route
app.get("/", (req, res, next) => {
  res.send("Welcome To Instagram");
});

// Routes
// User routes
app.use("/api/user", userRouter);
// Post routes
app.use("/api/post", postsRouter);
// Like routes
app.use("/api/like", likesRouter);
// Comment's routes
app.use("/api/comment", commentsRouter);
// Follower's routes
app.use("/api/follower", followersRouter);

// Not existing route
app.use((req, res, next) => {
  res.status(400).json({
    success: false,
    msg: "Api does not exist please try valid api.",
  });
});

// Error handler middleware
app.use(errorHandlerMiddleware);

app.use(handleUncaughtError);

// Exporting server
export default app;
