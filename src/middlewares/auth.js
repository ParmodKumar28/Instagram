// Authorizing middleware to check the jwt token is there or not
// Imports
import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import userModel from "../features/user/model/user.schema.js";

export const auth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler(401, "Login to access this route!"));
  }

  const decodedData = await jwt.verify(token, process.env.JWT_Secret);
  req.user = await userModel.findById(decodedData.id).select("-password");
  next();
};
