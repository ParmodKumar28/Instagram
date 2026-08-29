// Authorizing middleware to verify JWT token and attach user to request
import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import userModel from "../features/user/model/user.schema.js";

export const auth = async (req, res, next) => {
  try {
    // 1. Extract token from cookies, Authorization header (Bearer), or auth-token header
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader) ||
      req.header("auth-token");

    if (!token) {
      return next(new ErrorHandler(401, "Login to access this route!"));
    }

    // 2. Verify token with error handling for invalid/expired tokens
    let decodedData;
    try {
      decodedData = jwt.verify(token, process.env.JWT_Secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new ErrorHandler(401, "Session expired, please login again!"));
      }
      return next(new ErrorHandler(401, "Invalid token, authorization denied!"));
    }

    // 3. Verify user still exists in database
    const user = await userModel.findById(decodedData.id).select("-password");
    if (!user) {
      return next(
        new ErrorHandler(401, "User belonging to this token no longer exists!")
      );
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler(500, error.message || "Authentication error"));
  }
};

