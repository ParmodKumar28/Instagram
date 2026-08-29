// Authorizing middleware to verify JWT token and attach user to request
import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import userModel from "../features/user/model/user.schema.js";

export const auth = async (req, res, next) => {
  try {
    // Extract token strictly from Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new ErrorHandler(401, "Access denied. Bearer token required in Authorization header!")
      );
    }

    const token = authHeader.split(" ")[1];
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
    req.userId = user._id;
    next();
  } catch (error) {
    return next(new ErrorHandler(500, error.message || "Authentication error"));
  }
};

