// Here, iam creating the server using Express and routing and all
// Dotenv config at the top here
import "./dotenv.js";

// Imports
import express from "express";

// Routers imported
import userRouter from "./features/user/routes/user.routes.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";

// Server
const app = express();

// Parsing data
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// Default route
app.get("/", (req, res, next) => {
  res.send("Welcome To Instagram");
});

// Routes
// User routes
app.use("/api/user", userRouter);

// Not existing route
app.use((req, res, next) => {
  res.status(400).json({
    success: false,
    msg: "Api does not exist please try valid api.",
  });
});

// Error handler middleware
app.use(errorHandlerMiddleware);

// Exporting server
export default app;
