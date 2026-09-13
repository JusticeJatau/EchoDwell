import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies.echodwell_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new ApiError(401, "Please sign in to continue");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user || user.status === "suspended") throw new ApiError(401, "Your session is unavailable");
  req.user = user;
  next();
});

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) return next(new ApiError(403, "You do not have permission for this action"));
  next();
};
