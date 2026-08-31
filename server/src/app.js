// Here, iam creating the server using Express and routing and all
// Dotenv config at the top here
import "./dotenv.js";

// Imports
import express from "express";
import helmet from "helmet";
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./middlewares/errorHandlerMiddleware.js";
import {
  authLimiter,
  contentCreationLimiter,
  generalApiLimiter,
} from "./middlewares/security.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import path from "path";

// Routers imported
import userRouter from "./features/user/routes/user.routes.js";
import postsRouter from "./features/posts/routes/posts.routes.js";
import likesRouter from "./features/likes/routes/likes.routes.js";
import commentsRouter from "./features/comments/routes/comment.routes.js";
import followersRouter from "./features/followers/routes/follower.routes.js";
import storyRouter from "./features/stories/routes/story.routes.js";
import chatRouter from "./features/chat/routes/chat.routes.js";

// Server
const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Allow external avatars / video CDN streams
  })
);

// Setting up cors with support for dev, production, and Vercel deployments
const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...envOrigins,
  "https://socialgram-puce.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
]);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (
      allowedOrigins.has(normalizedOrigin) ||
      /\.vercel\.app$/.test(new URL(origin).hostname) ||
      /\.onrender\.com$/.test(new URL(origin).hostname) ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// General baseline rate limiting for all API routes
app.use("/api/", generalApiLimiter);

// Specific strict rate limits for authentication and password recovery
app.use("/api/user/signin", authLimiter);
app.use("/api/user/signup", authLimiter);
app.use("/api/user/forgotPassword", authLimiter);
app.use("/api/user/resetPassword", authLimiter);

// Content creation rate limits to prevent spam
app.use("/api/post/create", contentCreationLimiter);
app.use("/api/comment/add", contentCreationLimiter);
app.use("/api/story/create", contentCreationLimiter);
app.use("/api/chat/send", contentCreationLimiter);
app.use("/api/message/send", contentCreationLimiter);

// Parsing cookies
app.use(cookieParser());

// Parsing data
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// Static folder for serving uploaded images
app.use("/images", express.static(path.join(path.resolve(), "upload/images")));

// Configuring cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Default route
app.get("/", (req, res, next) => {
  res.send("Welcome to Socialgram API");
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
// Story routes
app.use("/api/story", storyRouter);
app.use("/api/stories", storyRouter);
// Chat routes
app.use("/api/chat", chatRouter);
app.use("/api/message", chatRouter);
app.use("/api/messages", chatRouter);

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
