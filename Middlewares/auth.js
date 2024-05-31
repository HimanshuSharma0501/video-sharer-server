import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../Models/User.js";
import ErrorHandler from "../Utils/ErrorHandler.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new ErrorHandler("Not Logged In", 401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded._id);
  next();
});

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`,
        403
      )
    );
  next();
};

export const authorizeSubscriber = (req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin")
    return next(
      new ErrorHandler(`Only Subscribers can access this resource`, 403)
    );
  next();
};
