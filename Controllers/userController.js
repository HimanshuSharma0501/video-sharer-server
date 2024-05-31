import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import getDataURI from "../Utils/DataURI.js";
import { User } from "../Models/User.js";
import { Course } from "../Models/Course.js";
import { SendToken } from "../Utils/SendToken.js";
import { sendEmail } from "../Utils/SendEmail.js";
import { Stats } from "../Models/Stats.js";

export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const file = req.file;
  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please Enter all fields", 400));
  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already exists", 409));

  const fileURI = getDataURI(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileURI.content);

  user = await User.create({
    name,
    email,
    password,
    role,
    avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
  });
  SendToken(res, user, "Registered Succesfully", 201);
});

//login
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("User does not exists", 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHandler("Incorrect email or password", 401));
  SendToken(res, user, `Welcome back ${user.name}`, 201);
});

//logout
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({ success: true, message: "Logged out succesfully" });
});
//get profile
export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});
//change passwod
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please enter all fields", 400));
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHandler("Incorrect old password", 401));
  user.password = newPassword;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
});
//update profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Profile updated successfully" });
});
//update profile picture
export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const file = req.file;
  const fileURI = getDataURI(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileURI.content);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Profile Picture updated successfully" });
});
//forgot password
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 400));
  const resetToken = await user.getResetToken();
  const url = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  const message = `Click on link to reset your password ${url}. Ignore if not requested`;
  //send token via email
  await sendEmail(user.email, "Video Streamer Reset Password", message);
  res.status(200).json({
    success: true,
    message: `reset token has been sent to ${user.email}`,
  });
});

//resetpassword
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user) return new ErrorHandler("Invalid or expired token ", 401);
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: `Password changed successfully`,
  });
});
//add to playlist
export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("Invalid course id", 404));
  const itemExists = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });
  if (itemExists) return next(new ErrorHandler("Item already exists", 409));
  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });
  await user.save();
  res.status(200).json({ success: true, message: "Added to playlist" });
});
//remove from playlist
export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Invalid course id", 404));
  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });
  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({ success: true, message: "Removed from playlist" });
});

//ADMIN CONTROLLERS

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({ success: true, users });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  if (user.role === "user") user.role = "admin";
  else user.role = "user";
  await user.save();
  res
    .status(200)
    .json({ success: true, message: `${user.name} is now an ${user.role}` });
});

export const deleteUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  //cancel subscription
  await user.deleteOne();

  res.status(200).json({ success: true, message: `Deleted succesfully` });
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  //cancel subscription
  await user.deleteOne();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({ success: true, message: `Deleted succesfully` });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  const subscription = await User.find({ "subscription.status": "active" });
  stats[0].users = await User.countDocuments();
  stats[0].subscriptions = subscription.length;
  stats[0].createdAt = new Date(Date.now());
  await stats[0].save();
});
